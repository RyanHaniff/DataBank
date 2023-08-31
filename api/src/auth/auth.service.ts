import { randomInt } from 'crypto';

import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { AuthPayload, CurrentUser, Locale, VerificationProcedureInfo } from '@databank/types';
import bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service.js';

import { CreateAccountDto } from './dto/create-account.dto.js';
import { VerifyAccountDto } from './dto/verify-account.dto.js';
import { VerificationCode } from './schemas/verification-code.schema.js';

import { I18nService } from '@/i18n/i18n.service.js';
import { MailService } from '@/mail/mail.service.js';
import { User, UserDocument } from '@/users/schemas/user.schema.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly i18n: I18nService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly usersService: UsersService
  ) {}

  async login(email: string, password: string): Promise<AuthPayload> {
    const user = await this.usersService.findByEmail(email).select('+hashedPassword');
    if (!user) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    const isCorrectPassword = await bcrypt.compare(password, user.hashedPassword);
    if (!isCorrectPassword) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    const accessToken = await this.signToken(user);

    return { accessToken };
  }

  /** Create a new standard account with verification required */
  async createAccount(createAccountDto: CreateAccountDto): Promise<User> {
    return this.usersService.createUser({ ...createAccountDto, role: 'standard', isVerified: false });
  }

  async sendVerificationCode({ email }: CurrentUser, locale?: Locale): Promise<VerificationProcedureInfo> {
    // This should never happen when called from controller, but in case it is ever called elsewhere
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User Not Found');
    }

    // If there is an existing, non-expired code, use that since we record attempts for security
    let verificationCode: VerificationCode;
    if (user.verificationCode && user.verificationCode.expiry > Date.now()) {
      verificationCode = user.verificationCode;
    } else {
      verificationCode = {
        attemptsMade: 0,
        expiry: Date.now() + parseInt(this.config.getOrThrow('VALIDATION_TIMEOUT')),
        value: randomInt(100000, 1000000)
      };
      await user.updateOne({ verificationCode });
    }

    await this.mailService.sendMail({
      to: user.email,
      subject: this.i18n.translate(locale, 'verificationEmail.body'),
      text: this.i18n.translate(locale, 'verificationEmail.body') + '\n\n' + `Code : ${verificationCode.value}`
    });
    return { attemptsMade: verificationCode.attemptsMade, expiry: verificationCode.expiry };
  }

  async verifyAccount({ code }: VerifyAccountDto, { email }: CurrentUser): Promise<AuthPayload> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User Not Found');
    } else if (!user.verificationCode) {
      throw new ForbiddenException('Validation code is undefined. Please request a validation code.');
    }

    const isExpired = user.verificationCode.expiry < Date.now();
    if (isExpired) {
      throw new ForbiddenException('Validation code is expired. Please request a new validation code.');
    }

    const maxAttempts = parseInt(this.config.get('MAX_VALIDATION_ATTEMPTS')!);
    if (!maxAttempts) {
      throw new InternalServerErrorException(
        `Environment variable 'MAX_VALIDATION_ATTEMPTS' must be set to a positive integer, not ${this.config.get(
          'MAX_VALIDATION_ATTEMPTS'
        )!}`
      );
    }

    if (user.verificationCode.attemptsMade > maxAttempts) {
      throw new ForbiddenException(
        'Too many attempts to validate this code. Please request a new validation code after the timeout.'
      );
    }

    if (user.verificationCode.value !== code) {
      user.verificationCode.attemptsMade++;
      await user.save();
      throw new ForbiddenException('Incorrect validation code. Please try again.');
    }

    user.verificationCode = undefined;
    user.verifiedAt = Date.now();
    user.isVerified = true;

    await user.save();

    const accessToken = await this.signToken(user);

    return { accessToken };
  }

  private async signToken(user: UserDocument) {
    const { email, firstName, lastName, role, isVerified } = user;
    const payload: CurrentUser = { id: user.id as string, firstName, lastName, email, role, isVerified };
    return this.jwtService.signAsync(payload);
  }
}

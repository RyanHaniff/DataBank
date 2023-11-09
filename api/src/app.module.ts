import { LoggerMiddleware } from '@douglasneuroinformatics/nestjs/core';
import { CryptoModule, DatabaseModule } from '@douglasneuroinformatics/nestjs/modules';
import { type MiddlewareConsumer, Module, type NestModule, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AuthModule } from './auth/auth.module';
import { AcceptLanguageMiddleware } from './core/middleware/accept-language.middleware';
import { DatasetsModule } from './datasets/datasets.module';
import { I18nModule } from './i18n/i18n.module';
import { SetupModule } from './setup/setup.module';
import { UsersModule } from './users/users.module';
import { ProjectModule } from './project/project.module';
import { ProjectsModule } from './projects/projects.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true
    }),
    CryptoModule.registerAsync({
      inject: [ConfigService],
      isGlobal: true,
      useFactory: (configService: ConfigService) => ({
        secretKey: configService.getOrThrow('SECRET_KEY')
      })
    }),
    DatabaseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const env = configService.getOrThrow<string>('NODE_ENV');
        return {
          dbName: `databank-${env}`,
          mongoUri: configService.getOrThrow<string>('MONGO_URI')
        };
      }
    }),
    DatasetsModule,
    I18nModule,
    SetupModule,
    ThrottlerModule.forRoot([
      {
        limit: 100,
        ttl: 60000
      }
    ]),
    UsersModule,
    ProjectModule,
    ProjectsModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe
    }
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AcceptLanguageMiddleware, LoggerMiddleware).forRoutes('*');
  }
}

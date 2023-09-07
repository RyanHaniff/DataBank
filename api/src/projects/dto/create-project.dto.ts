import { IsDate, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

import { Dataset } from '@/datasets/schemas/dataset.schema.js';
import { User } from '@/users/schemas/user.schema.js';

export class CreateProjectDto {
  @IsNotEmpty()
  projectName: string;

  @IsOptional()
  projectDescription: string;

  @IsOptional()
  externalID: string;

  // must have at least one dataset
  @MinLength(1)
  listOfDatasets: Dataset[];

  // users that should all have the same access to the dataset
  listOfUsers: User[];

  @MinLength(1)
  listOfManagers: string; // change this to refer to manager that is a user

  // When the project will expire
  @IsNotEmpty()
  @IsDate()
  expiry: Date;
}

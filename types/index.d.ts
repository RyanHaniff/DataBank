/** CORE */

import { Primitive, Simplify } from 'type-fest';

export type Locale = 'en' | 'fr';

export type ExceptionResponse = {
  message: string;
};

/** AUTH */

export type AuthPayload = {
  accessToken: string;
};

export type UserRole = 'admin' | 'standard';

export type CurrentUser = {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isVerified: boolean;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type VerificationProcedureInfo = {
  /** The number of previous attempts to verify this code */
  attemptsMade: number;

  /** The unix timestamp after which the code will be invalidated */
  expiry: number;
};

/** USER */

export type TUser = {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  verifiedAt?: number;
};

/** DATASETS */

export type DatasetInfo = {
  _id: string;
  createdAt: number;
  updatedAt: number;
  owner: TUser;
  name: string;
  description: string;
  license: string;
};

export type DatasetColumnType = 'str' | 'float' | 'int';

export type DatasetColumn = {
  description: string;
  type: DatasetColumnType;
};

export type DatasetData<TColumns extends Record<string, DatasetColumn>> = {
  [key: string]: {
    [K in keyof TColumns]: Primitive;
  };
};

export type TDataset<
  TColumns extends Record<string, DatasetColumn> = Record<string, DatasetColumn>,
  TData extends DatasetData<TColumns> = DatasetData<TColumns>
> = Simplify<
  DatasetInfo & {
    columns: TColumns;
    data: TData;
  }
>;

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

import { User } from '@/users/schemas/user.schema.js';

@Schema()
export class Project {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  // Allows for multiple users
  @Prop({ required: true, type: [{ type: MongooseSchema.Types.ObjectId, ref: User.name }] })
  owner: User[];
}

export type DatasetDocument = HydratedDocument<Project>;

export const ProjectSchema = SchemaFactory.createForClass(Project);

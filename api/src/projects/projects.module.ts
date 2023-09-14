import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ProjectsController } from './projects.controller.js';

@Module({
  controllers: [ProjectsController]
})
export class ProjectsModule {}

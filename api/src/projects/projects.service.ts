import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model, ObjectId } from 'mongoose';

import { CreateProjectDto } from './dto/create-project.dto.js';
import { Project } from './schemas/project.schema.js';

@Injectable()
export class ProjectsService {
  constructor(@InjectModel(Project.name) private projectModel: Model<Project>) {}

  createProject(createProjectDto: CreateProjectDto, ownerId: ObjectId) {
    return this.projectModel.create({ ...createProjectDto, owner: ownerId });
  }

  async getProjectById(id: string | ObjectId): Promise<Project> {
    const project = await this.projectModel.findById(id);
    if (!project) {
      throw new NotFoundException();
    }
    await project.populate('owner');
    return project;
  }

  async deleteProject(id: ObjectId) {
    return this.projectModel.findByIdAndDelete(id);
  }
}

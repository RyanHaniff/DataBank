import { Injectable } from '@nestjs/common';

import { Project } from './schemas/project.schema.js';
// import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class ProjectsService {
    
  async getProjectById(id: string) : Promise<Project> {

  }
}

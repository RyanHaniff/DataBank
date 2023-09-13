import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { CreateProjectDto } from './dto/create-project.dto.js';
import { ProjectsService } from './projects.service.js';

import { RouteAccess } from '@/core/decorators/route-access.decorator.js';
import { ParseIdPipe } from '@/core/pipes/parse-id.pipe.js';



@ApiTags('Projects')
@Controller({ path: 'projects' })
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @ApiOperation({ summary: 'Create Project' })
  @Post()
  @RouteAccess({ role: 'standard' })
  createProject(@Body() createProjectDto: CreateProjectDto) {
    return createProjectDto;
  }

  @ApiOperation({ summary: 'Get Data for Project' })
  @Get(':id')
  @RouteAccess({ role: 'standard' })
  @RouteAccess({ role: 'standard' })
  getProjectById(@Param('id', ParseIdPipe) id: string) { // change the var type of id
    return id;
  }
}

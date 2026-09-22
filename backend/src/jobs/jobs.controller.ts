import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  JwtAuthGuard,
  JwtPayload,
} from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Roles } from 'src/auth/decorators/roles/roles.decorator';
import { Role } from 'generated/prisma/enums';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { QueryJobsDto } from './dto/query-jobs.dto';
import { UpdateJobDto } from './dto/update-job.dto';

type AuthenticatedRequest = Request & { user: JwtPayload };

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query: QueryJobsDto) {
    return this.jobsService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.jobsService.findOne(id, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.COMPANY)
  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateJobDto) {
    return this.jobsService.create(req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.COMPANY)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateJobDto,
  ) {
    return this.jobsService.update(req.user.sub, id, dto);
  }
}

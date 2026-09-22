import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Role } from 'generated/prisma/enums';
import { Roles } from 'src/auth/decorators/roles/roles.decorator';
import {
  JwtAuthGuard,
  JwtPayload,
} from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { ApplyJobDto } from '../dto/apply-jobs.dto';
import { QueryApplicationsDto } from '../dto/query-applications.dto';
import { ApplicationsService } from '../applications.service';

type AuthenticatedRequest = Request & { user: JwtPayload };

@Controller('jobs')
export class JobApplicationController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.JOB_SEEKER)
  @Post(':id/applications')
  apply(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: ApplyJobDto,
  ) {
    return this.applicationsService.apply(id, req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.COMPANY)
  @Get(':id/applications')
  getApplicants(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Query() query: QueryApplicationsDto,
  ) {
    return this.applicationsService.getJobApplicants(id, req.user.sub, query);
  }
}

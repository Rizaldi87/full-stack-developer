import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import {
  JwtAuthGuard,
  JwtPayload,
} from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Roles } from 'src/auth/decorators/roles/roles.decorator';
import { Role } from 'generated/prisma/enums';
import { JobsService } from '../jobs.service';

type AuthenticatedRequest = Request & { user: JwtPayload };

@Controller('company')
export class CompanyJobsController {
  constructor(private readonly jobsService: JobsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.COMPANY)
  @Get('jobs')
  findMy(@Req() req: AuthenticatedRequest) {
    return this.jobsService.getMyJobs(req.user.sub);
  }
}

import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';

import {
  JwtAuthGuard,
  JwtPayload,
} from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { Roles } from 'src/auth/decorators/roles/roles.decorator';
import { QueryApplicationsDto } from './dto/query-applications.dto';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Role } from 'generated/prisma/enums';

type AuthenticatedRequest = Request & { user: JwtPayload };

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.JOB_SEEKER)
  @Get('me')
  findMy(
    @Req() req: AuthenticatedRequest,
    @Query() query: QueryApplicationsDto,
  ) {
    return this.applicationsService.getMyApplications(req.user.sub, query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.COMPANY)
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.applicationsService.updateStatus(id, req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/history')
  getHistory(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.applicationsService.getHistory(id, req.user);
  }
}

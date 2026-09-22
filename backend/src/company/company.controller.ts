import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import {
  JwtAuthGuard,
  JwtPayload,
} from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Roles } from 'src/auth/decorators/roles/roles.decorator';
import { Role } from 'generated/prisma/enums';

type AuthenticatedRequest = Request & { user: JwtPayload };

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.COMPANY)
  @Post()
  create(
    @Req() req: Request & { user: JwtPayload },
    @Body() createCompanyDto: CreateCompanyDto,
  ) {
    return this.companyService.create(req.user.sub, createCompanyDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.COMPANY)
  @Get('me')
  findMy(@Req() req: AuthenticatedRequest) {
    return this.companyService.getMyCompany(req.user.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.COMPANY)
  @Patch('me')
  updateMy(@Req() req: AuthenticatedRequest, @Body() dto: UpdateCompanyDto) {
    return this.companyService.updateMyCompany(req.user.sub, dto);
  }
}

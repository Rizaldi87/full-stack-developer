import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { CompanyRepository } from './company.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [CompanyController],
  providers: [CompanyService, CompanyRepository, PrismaService, JwtService],
  exports: [CompanyService],
})
export class CompanyModule {}

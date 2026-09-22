import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { CompanyJobsController } from './company-jobs/company-jobs.controller';
import { CompanyModule } from 'src/company/company.module';
import { JobsRepository } from './jobs.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [CompanyModule],
  controllers: [JobsController, CompanyJobsController],
  providers: [JobsService, JobsRepository, PrismaService, JwtService],
  exports: [JobsService],
})
export class JobsModule {}

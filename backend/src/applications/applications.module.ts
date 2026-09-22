import { Module } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { JobApplicationController } from './job-application/job-application.controller';
import { ApplicationsRepository } from './applications.repository';
import { JwtService } from '@nestjs/jwt';
import { CompanyModule } from 'src/company/company.module';
import { JobsModule } from 'src/jobs/jobs.module';

@Module({
  imports: [JobsModule, CompanyModule],
  controllers: [ApplicationsController, JobApplicationController],
  providers: [
    ApplicationsService,
    ApplicationsRepository,
    PrismaService,
    JwtService,
  ],
})
export class ApplicationsModule {}

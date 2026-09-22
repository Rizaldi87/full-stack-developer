import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { JobStatus, JobType } from 'generated/prisma/enums';
import { Prisma } from 'generated/prisma/client';
import { UpdateJobDto } from './dto/update-job.dto';

@Injectable()
export class JobsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findOpenJobs(args: {
    search?: string;
    location?: string;
    jobType?: JobType;
    skip: number;
    take: number;
  }) {
    const where: Prisma.JobWhereInput = {
      status: JobStatus.OPEN,
      title: args.search
        ? { contains: args.search, mode: Prisma.QueryMode.insensitive }
        : undefined,
      location: args.location
        ? { contains: args.location, mode: Prisma.QueryMode.insensitive }
        : undefined,
      jobType: args.jobType,
    };

    return this.prisma.job.findMany({
      where,
      include: {
        company: { select: { id: true, name: true, location: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: args.skip,
      take: args.take,
    });
  }

  countOpenJobs(args: {
    search?: string;
    location?: string;
    jobType?: JobType;
  }) {
    return this.prisma.job.count({
      where: {
        status: JobStatus.OPEN,
        title: args.search ? { contains: args.search } : undefined,
        location: args.location ? { contains: args.location } : undefined,
        jobType: args.jobType,
      },
    });
  }

  findById(id: string) {
    return this.prisma.job.findUnique({
      where: { id },
      include: {
        company: { select: { id: true, name: true, location: true } },
      },
    });
  }

  hasApplied(jobId: string, applicantId: string) {
    return this.prisma.application
      .findUnique({
        where: { jobId_applicantId: { jobId, applicantId } },
      })
      .then((application) => application !== null);
  }

  create(companyId: string, dto: CreateJobDto) {
    return this.prisma.job.create({ data: { companyId, ...dto } });
  }

  findManyByCompany(companyId: string) {
    return this.prisma.job.findMany({
      where: { companyId },
      include: { _count: { select: { applications: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  update(id: string, data: UpdateJobDto) {
    return this.prisma.job.update({
      where: {
        id,
      },
      data,
    });
  }
}

import { Injectable } from '@nestjs/common';
import { ApplicationStatus } from 'generated/prisma/enums';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ApplicationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByJobAndApplicant(jobId: string, applicantId: string) {
    return this.prisma.application.findUnique({
      where: { jobId_applicantId: { jobId, applicantId } },
    });
  }

  findByIdWithJob(id: string) {
    return this.prisma.application.findUnique({
      where: { id },
      include: {
        job: { select: { id: true, title: true, companyId: true } },
      },
    });
  }

  createApplication(
    jobId: string,
    applicantId: string,
    coverLetter: string | undefined,
  ) {
    return this.prisma.application.create({
      data: {
        jobId,
        applicantId,
        coverLetter,
        status: ApplicationStatus.APPLIED,
        history: {
          create: {
            fromStatus: null,
            toStatus: ApplicationStatus.APPLIED,
            changedById: applicantId,
          },
        },
      },
    });
  }

  findManyByApplicant(
    applicantId: string,
    args: { status?: ApplicationStatus; skip: number; take: number },
  ) {
    return this.prisma.application.findMany({
      where: { applicantId, status: args.status },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            location: true,
            salaryMin: true,
            salaryMax: true,
            jobType: true,
            status: true,
            company: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: args.skip,
      take: args.take,
    });
  }

  countByApplicant(applicantId: string, status?: ApplicationStatus) {
    return this.prisma.application.count({ where: { applicantId, status } });
  }

  findManyByJob(
    jobId: string,
    args: { status?: ApplicationStatus; skip: number; take: number },
  ) {
    return this.prisma.application.findMany({
      where: { jobId, status: args.status },
      include: {
        applicant: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: args.skip,
      take: args.take,
    });
  }

  countByJob(jobId: string, status?: ApplicationStatus) {
    return this.prisma.application.count({ where: { jobId, status } });
  }

  updateStatusWithHistory(args: {
    id: string;
    fromStatus: ApplicationStatus;
    toStatus: ApplicationStatus;
    note?: string;
    changedById: string;
  }) {
    return this.prisma.$transaction([
      this.prisma.application.update({
        where: { id: args.id },
        data: { status: args.toStatus },
      }),
      this.prisma.applicationHistory.create({
        data: {
          applicationId: args.id,
          fromStatus: args.fromStatus,
          toStatus: args.toStatus,
          note: args.note,
          changedById: args.changedById,
        },
      }),
    ]);
  }

  findHistory(id: string) {
    return this.prisma.application.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        job: { select: { id: true, title: true } },
        applicant: { select: { id: true, name: true } },
        history: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            fromStatus: true,
            toStatus: true,
            note: true,
            createdAt: true,
            changedBy: { select: { name: true } },
          },
        },
      },
    });
  }
}

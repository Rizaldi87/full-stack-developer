import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ApplicationStatus, JobStatus, Role } from 'generated/prisma/enums';
import { ApplicationsRepository } from './applications.repository';
import { JobsService } from 'src/jobs/jobs.service';
import { CompanyService } from 'src/company/company.service';
import { ApplyJobDto } from './dto/apply-jobs.dto';
import { Prisma } from 'generated/prisma/client';
import { QueryApplicationsDto } from './dto/query-applications.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { JwtPayload } from 'src/auth/guards/jwt-auth/jwt-auth.guard';

const ALLOWED_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  [ApplicationStatus.APPLIED]: [
    ApplicationStatus.REVIEWING,
    ApplicationStatus.REJECTED,
  ],
  [ApplicationStatus.REVIEWING]: [
    ApplicationStatus.SHORTLISTED,
    ApplicationStatus.REJECTED,
  ],
  [ApplicationStatus.SHORTLISTED]: [
    ApplicationStatus.ACCEPTED,
    ApplicationStatus.REJECTED,
  ],
  [ApplicationStatus.REJECTED]: [],
  [ApplicationStatus.ACCEPTED]: [],
};

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly repo: ApplicationsRepository,
    private readonly jobsService: JobsService,
    private readonly companyService: CompanyService,
  ) {}

  async apply(jobId: string, userId: string, dto: ApplyJobDto) {
    const job = await this.jobsService.findById(jobId);
    if (!job) throw new NotFoundException('Job tidak ditemukan');
    if (job.status !== JobStatus.OPEN) {
      throw new ConflictException('Lowongan sudah ditutup');
    }

    const existing = await this.repo.findByJobAndApplicant(jobId, userId);
    if (existing) {
      throw new ConflictException('Kamu sudah melamar lowongan ini');
    }

    try {
      const application = await this.repo.createApplication(
        jobId,
        userId,
        dto.coverLetter,
      );
      return {
        success: true,
        message: 'Aplikasi berhasil dikirim',
        data: application,
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Kamu sudah melamar lowongan ini');
      }
      throw error;
    }
  }

  async getMyApplications(userId: string, query: QueryApplicationsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.repo.findManyByApplicant(userId, {
        status: query.status,
        skip,
        take: limit,
      }),
      this.repo.countByApplicant(userId, query.status),
    ]);

    return {
      success: true,
      message: 'Applications Found',
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / limit),
      },
    };
  }

  async getJobApplicants(
    jobId: string,
    userId: string,
    query: QueryApplicationsDto,
  ) {
    const job = await this.jobsService.findById(jobId);
    if (!job) throw new NotFoundException('Job not found');

    await this.ensureCompanyOwnsJob(job.companyId, userId);

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.repo.findManyByJob(jobId, {
        status: query.status,
        skip,
        take: limit,
      }),
      this.repo.countByJob(jobId, query.status),
    ]);

    return {
      success: true,
      message: 'Applicants Found',
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / limit),
      },
    };
  }

  async updateStatus(
    id: string,
    userId: string,
    dto: UpdateApplicationStatusDto,
  ) {
    const application = await this.repo.findByIdWithJob(id);
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    await this.ensureCompanyOwnsJob(application.job.companyId, userId);

    const from = application.status;
    if (from === dto.status) {
      throw new BadRequestException('Status cant be same');
    }

    const allowed = ALLOWED_TRANSITIONS[from];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Transisi ${from} -> ${dto.status} not allowed`,
      );
    }

    const [updated] = await this.repo.updateStatusWithHistory({
      id,
      fromStatus: from,
      toStatus: dto.status,
      note: dto.note,
      changedById: userId,
    });

    return {
      success: true,
      message: 'Status successfully updated',
      data: {
        id: updated.id,
        status: updated.status,
        updatedAt: updated.updatedAt,
      },
    };
  }

  async getHistory(id: string, user: JwtPayload) {
    const application = await this.repo.findByIdWithJob(id);
    if (!application) {
      throw new NotFoundException('Applications Not Found');
    }

    if (user.role === Role.JOB_SEEKER) {
      if (application.applicantId !== user.sub) {
        throw new ForbiddenException(
          'Youre forbidden to access this application',
        );
      }
    } else {
      await this.ensureCompanyOwnsJob(application.job.companyId, user.sub);
    }

    const history = await this.repo.findHistory(id);
    return { success: true, message: 'History Found', data: history };
  }

  private async ensureCompanyOwnsJob(jobCompanyId: string, userId: string) {
    const company = await this.companyService.findByOwner(userId);
    if (!company || jobCompanyId !== company.id) {
      throw new ForbiddenException('Anda tidak berhak mengakses lowongan ini');
    }
  }
}

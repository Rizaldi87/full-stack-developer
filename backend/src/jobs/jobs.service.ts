import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CompanyService } from 'src/company/company.service';
import { JwtPayload } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { Role } from 'generated/prisma/enums';
import { CreateJobDto } from './dto/create-job.dto';
import { QueryJobsDto } from './dto/query-jobs.dto';
import { JobsRepository } from './jobs.repository';
import { UpdateJobDto } from './dto/update-job.dto';

@Injectable()
export class JobsService {
  constructor(
    private readonly repo: JobsRepository,
    private readonly companyService: CompanyService,
  ) {}

  async findAll(query: QueryJobsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      this.repo.findOpenJobs({ ...query, skip, take: limit }),
      this.repo.countOpenJobs(query),
    ]);

    return {
      success: true,
      message: 'Job Found',
      data: jobs,
      meta: {
        page,
        limit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, user: JwtPayload) {
    const job = await this.repo.findById(id);
    if (!job) {
      throw new NotFoundException('Job tidak ditemukan');
    }

    const data =
      user.role === Role.JOB_SEEKER
        ? { ...job, hasApplied: await this.repo.hasApplied(id, user.sub) }
        : job;

    return { success: true, message: 'Job Found', data };
  }

  findById(id: string) {
    return this.repo.findById(id);
  }

  async create(userId: string, dto: CreateJobDto) {
    const company = await this.companyService.findByOwner(userId);
    if (!company) {
      throw new ForbiddenException(
        'Buat profil company dulu lewat POST /company',
      );
    }

    if (
      dto.salaryMin != null &&
      dto.salaryMax != null &&
      dto.salaryMin > dto.salaryMax
    ) {
      throw new BadRequestException(
        'salaryMin tidak boleh lebih besar dari salaryMax',
      );
    }

    const job = await this.repo.create(company.id, dto);
    return { success: true, message: 'Job Created Successfully', data: job };
  }

  async getMyJobs(userId: string) {
    const company = await this.companyService.findByOwner(userId);
    if (!company) {
      throw new ForbiddenException('Company belum dibuat');
    }

    const jobs = await this.repo.findManyByCompany(company.id);
    return { success: true, message: 'Job Found', data: jobs };
  }

  async update(userId: string, id: string, dto: UpdateJobDto) {
    const job = await this.repo.findById(id);
    if (!job) throw new NotFoundException('Job tidak ditemukan');

    const company = await this.companyService.findByOwner(userId);
    if (!company || job.companyId !== company.id) {
      throw new ForbiddenException('Anda tidak berhak mengubah lowongan ini');
    }

    const updatedJob = await this.repo.update(id, dto);
    return {
      success: true,
      message: 'Job Updated Successfully',
      data: updatedJob,
    };
  }
}

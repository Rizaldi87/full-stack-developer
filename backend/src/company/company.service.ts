import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyRepository } from './company.repository';

@Injectable()
export class CompanyService {
  constructor(private readonly repo: CompanyRepository) {}
  async create(ownerId: string, dto: CreateCompanyDto) {
    const existing = await this.repo.findCompanyByOwner(ownerId);
    if (existing) {
      throw new ConflictException('Company already exists for this user');
    }

    const company = await this.repo.create(ownerId, dto);
    return {
      success: true,
      message: 'Company Created Successfully',
      data: company,
    };
  }

  async getMyCompany(ownerId: string) {
    const company = await this.repo.findCompanyByOwner(ownerId);
    if (!company) {
      throw new NotFoundException('Company Not Found');
    }
    return { success: true, message: 'Company Found', data: company };
  }

  async updateMyCompany(ownerId: string, dto: UpdateCompanyDto) {
    const company = await this.repo.findCompanyByOwner(ownerId);
    if (!company) {
      throw new NotFoundException('Company Not Found');
    }

    const updated = await this.repo.update(company.id, dto);
    return {
      success: true,
      message: 'Company Updated Successfully',
      data: updated,
    };
  }

  findByOwner(ownerId: string) {
    return this.repo.findCompanyByOwner(ownerId);
  }
}

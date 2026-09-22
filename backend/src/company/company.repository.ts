import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompanyRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(ownerId: string, dto: CreateCompanyDto) {
    return this.prisma.company.create({ data: { ownerId, ...dto } });
  }

  findCompanyByOwner(ownerId: string) {
    return this.prisma.company.findUnique({ where: { ownerId } });
  }

  update(companyId: string, dto: UpdateCompanyDto) {
    return this.prisma.company.update({ where: { id: companyId }, data: dto });
  }

  delete(id: string) {
    return this.prisma.company.delete({ where: { id } });
  }
}

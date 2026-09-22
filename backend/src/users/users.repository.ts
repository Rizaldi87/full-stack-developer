import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from 'generated/prisma/enums';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateUserDto) {
    return this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.password,
        name: data.name,
        role: data.role,
      },
    });
  }
  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }
  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  updateRefreshToken(id: string, refreshToken: string | null) {
    return this.prisma.user.update({
      where: { id },
      data: { refreshToken },
    });
  }

  findCompanyByUserId(id: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: {
        id,
        role: Role.COMPANY,
      },
    });
  }
}

import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly repo: UserRepository) {}
  create(createUserDto: CreateUserDto) {
    return this.repo.create(createUserDto);
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  findByEmail(email: string) {
    return this.repo.findByEmail(email);
  }

  findById(id: string) {
    return this.repo.findById(id);
  }

  setRefreshToken(id: string, tokenHash: string) {
    return this.repo.updateRefreshToken(id, tokenHash);
  }

  clearRefreshToken(id: string) {
    return this.repo.updateRefreshToken(id, null);
  }

  findUserCompany(id: string) {
    return this.repo.findCompanyByUserId(id);
  }
}

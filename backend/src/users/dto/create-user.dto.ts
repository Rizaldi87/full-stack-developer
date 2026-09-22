import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Role } from 'generated/prisma/enums';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  role: Role;
}

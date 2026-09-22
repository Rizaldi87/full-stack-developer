import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApplicationStatus } from 'generated/prisma/enums';

export class UpdateApplicationStatusDto {
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;

  @IsOptional()
  @IsString()
  note?: string;
}

import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { RolesGuard } from './guards/roles/roles.guard';
import { Roles } from './decorators/roles/roles.decorator';
import { Role } from 'generated/prisma/enums';
import { JwtAuthGuard, JwtPayload } from './guards/jwt-auth/jwt-auth.guard';
import { RefreshTokenDto } from 'src/auth/dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: CreateUserDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: Request & { user: JwtPayload }) {
    return req.user;
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto);
  }
}

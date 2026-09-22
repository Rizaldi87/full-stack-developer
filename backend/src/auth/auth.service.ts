import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';
import { RefreshTokenDto } from 'src/auth/dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: CreateUserDto) {
    const existingUser = await this.userService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('User already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = await this.userService.create({
      email: dto.email,
      password: hashedPassword,
      name: dto.name,
      role: dto.role,
    });

    return {
      succes: true,
      message: 'user created successfully',
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async login(dto: LoginDto) {
    const userExist = await this.userService.findByEmail(dto.email);
    if (!userExist) {
      throw new UnauthorizedException('Email or Password invalid');
    }
    const validPassword = await bcrypt.compare(
      dto.password,
      userExist.passwordHash,
    );
    if (!validPassword) {
      throw new UnauthorizedException('Email or Password invalid');
    }

    const payload = {
      sub: userExist.id,
      email: userExist.email,
      role: userExist.role,
    };
    const accessToken = await this.jwtService.signAsync(payload);

    const refreshPayload = {
      sub: userExist.id,
      email: userExist.email,
      type: 'refresh' as const,
    };
    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.getOrThrow<StringValue>(
        'JWT_REFRESH_EXPIRES_IN',
      ),
    });

    const refreshHash = await bcrypt.hash(refreshToken, 10);
    await this.userService.setRefreshToken(userExist.id, refreshHash);

    return {
      success: true,
      message: 'Login Successfully',
      data: {
        accessToken: accessToken,
        refreshToken: refreshToken,
      },
    };
  }

  async refreshToken(dto: RefreshTokenDto) {
    let payload: { sub: string; type?: string };
    try {
      payload = await this.jwtService.verifyAsync(dto.refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token invalid or expired');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    const user = await this.userService.findById(payload.sub);
    if (!user?.refreshToken) {
      throw new UnauthorizedException('Refresh token revoked');
    }

    const match = await bcrypt.compare(dto.refreshToken, user.refreshToken);
    if (!match) {
      throw new UnauthorizedException('Refresh token revoked');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    const newRefreshToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email, type: 'refresh' as const },
      {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.getOrThrow<StringValue>(
          'JWT_REFRESH_EXPIRES_IN',
        ),
      },
    );

    await this.userService.setRefreshToken(
      user.id,
      await bcrypt.hash(newRefreshToken, 10),
    );

    return {
      success: true,
      message: 'Token refreshed',
      data: { accessToken, refreshToken: newRefreshToken },
    };
  }
}

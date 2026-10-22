import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import {
  RegisterRequest,
  LoginRequest,
  RefreshTokenRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthUserPayload,
} from '@ca-career-os/shared';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() body: RegisterRequest,
    @Res({ passthrough: true }) res: Response
  ) {
    const authData = await this.authService.register(body);

    // Set secure HttpOnly cookie for refresh token
    res.cookie('refreshToken', authData.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/v1/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return authData;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: LoginRequest,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.ip || '127.0.0.1';
    const authData = await this.authService.login(body, clientIp);

    res.cookie('refreshToken', authData.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/v1/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return authData;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() body: Partial<RefreshTokenRequest>,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    // Read from body or cookie
    let token = body.refreshToken;
    if (!token && req.headers['cookie']) {
      const cookies = req.headers['cookie'].split(';');
      for (const cookie of cookies) {
        const [k, v] = cookie.trim().split('=');
        if (k === 'refreshToken') {
          token = decodeURIComponent(v);
          break;
        }
      }
    }

    const authData = await this.authService.refreshToken({ refreshToken: token || '' });

    res.cookie('refreshToken', authData.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/v1/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return authData;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Body() body: Partial<RefreshTokenRequest>,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    let token = body.refreshToken;
    if (!token && req.headers['cookie']) {
      const cookies = req.headers['cookie'].split(';');
      for (const cookie of cookies) {
        const [k, v] = cookie.trim().split('=');
        if (k === 'refreshToken') {
          token = decodeURIComponent(v);
          break;
        }
      }
    }

    res.clearCookie('refreshToken', {
      path: '/api/v1/auth',
    });

    return await this.authService.logout(token || '');
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() body: ForgotPasswordRequest) {
    return await this.authService.forgotPassword(body);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() body: ResetPasswordRequest) {
    return await this.authService.resetPassword(body);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() user: AuthUserPayload) {
    return await this.authService.getMe(user.id);
  }
}

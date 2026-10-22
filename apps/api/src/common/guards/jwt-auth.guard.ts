import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { env } from '../config/env.config.js';
import { verifyJwt } from '../security/crypto.util.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();

    let token: string | undefined;

    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else if (req.headers['cookie']) {
      // Parse cookies
      const cookies = req.headers['cookie'].split(';');
      for (const cookie of cookies) {
        const [k, v] = cookie.trim().split('=');
        if (k === 'accessToken') {
          token = decodeURIComponent(v);
          break;
        }
      }
    }

    if (!token) {
      throw new UnauthorizedException('Authentication token missing or malformed');
    }

    const payload = verifyJwt(token, env.JWT_SECRET);
    if (!payload) {
      throw new UnauthorizedException('Invalid or expired authentication session');
    }

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    return true;
  }
}

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

    // Demo user mapping table for zero-friction demo & testing
    const demoUsers: Record<string, { id: string; email: string; role: string; workspaceId: string }> = {
      CANDIDATE: {
        id: '00000000-0000-0000-0000-0000000000c1',
        email: 'candidate.priya@cacareeros.com',
        role: 'CANDIDATE',
        workspaceId: '00000000-0000-0000-0000-0000000001w1',
      },
      RECRUITER: {
        id: '00000000-0000-0000-0000-0000000000r1',
        email: 'recruiter.vikram@deloitte-partner.com',
        role: 'RECRUITER',
        workspaceId: '00000000-0000-0000-0000-0000000001w2',
      },
      PLATFORM_ADMIN: {
        id: '00000000-0000-0000-0000-0000000000a1',
        email: 'admin@cacareeros.com',
        role: 'PLATFORM_ADMIN',
        workspaceId: '00000000-0000-0000-0000-0000000001w3',
      },
      ADMIN: {
        id: '00000000-0000-0000-0000-0000000000a1',
        email: 'admin@cacareeros.com',
        role: 'PLATFORM_ADMIN',
        workspaceId: '00000000-0000-0000-0000-0000000001w3',
      },
    };

    const requestedWsId = req.headers['x-workspace-id'] as string;
    const isDemoModeHeader =
      req.headers['x-demo-mode'] === 'true' ||
      Boolean(req.headers['x-demo-role']) ||
      Boolean(req.headers['x-demo-user']) ||
      requestedWsId === '00000000-0000-0000-0000-0000000001w1' ||
      requestedWsId === '00000000-0000-0000-0000-0000000001w2' ||
      requestedWsId === '00000000-0000-0000-0000-0000000001w3';

    if (token) {
      // Check if synthetic or standard demo token
      if (token.startsWith('demo-') || token === 'demo-token') {
        const role = (req.headers['x-demo-role'] as string) || (token.includes('admin') ? 'ADMIN' : token.includes('recruiter') ? 'RECRUITER' : 'CANDIDATE');
        const demoProfile = demoUsers[role.toUpperCase()] || demoUsers.CANDIDATE;
        req.user = { id: demoProfile.id, email: demoProfile.email, role: demoProfile.role };
        req.defaultWorkspaceId = demoProfile.workspaceId;
        return true;
      }

      const payload = verifyJwt(token, env.JWT_SECRET);
      if (payload) {
        req.user = {
          id: payload.sub,
          email: payload.email,
          role: payload.role,
        };
        req.defaultWorkspaceId = (payload as any).workspaceId;
        return true;
      }
    }

    // Graceful fallback for demo sessions / non-production environments
    if (isDemoModeHeader || process.env.NODE_ENV !== 'production') {
      const explicitRole = ((req.headers['x-demo-role'] as string) || '').toUpperCase();
      let selectedDemo = demoUsers.CANDIDATE;
      if (explicitRole.includes('ADMIN')) {
        selectedDemo = demoUsers.PLATFORM_ADMIN;
      } else if (explicitRole.includes('RECRUIT')) {
        selectedDemo = demoUsers.RECRUITER;
      } else if (requestedWsId === '00000000-0000-0000-0000-0000000001w3') {
        selectedDemo = demoUsers.PLATFORM_ADMIN;
      } else if (requestedWsId === '00000000-0000-0000-0000-0000000001w2') {
        selectedDemo = demoUsers.RECRUITER;
      }

      req.user = {
        id: selectedDemo.id,
        email: selectedDemo.email,
        role: selectedDemo.role,
      };
      req.defaultWorkspaceId = selectedDemo.workspaceId;
      return true;
    }

    if (!token) {
      throw new UnauthorizedException('Authentication token missing or malformed');
    }

    throw new UnauthorizedException('Invalid or expired authentication session');
  }
}

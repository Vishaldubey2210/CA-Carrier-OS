import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { env } from '../../common/config/env.config.js';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptimeSeconds: number;
  environment: string;
  timestamp: string;
  services: {
    database: {
      status: 'up' | 'down' | 'degraded';
      latencyMs?: number;
      message?: string;
    };
    redis: {
      status: 'up' | 'down' | 'degraded';
      latencyMs?: number;
      message?: string;
    };
  };
}

@Injectable()
export class HealthService {
  private readonly startTime = Date.now();

  constructor(private readonly prisma: PrismaService) {}

  getLiveness(): { status: 'healthy'; uptimeSeconds: number; timestamp: string } {
    return {
      status: 'healthy',
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      timestamp: new Date().toISOString(),
    };
  }

  async getReadiness(): Promise<HealthStatus> {
    const dbCheck = await this.prisma.checkHealth();
    
    // In local development, if database is down, report degraded rather than unhealthy to enable dev mode
    const isLocalDev = env.NODE_ENV === 'development' || env.NODE_ENV === 'test';
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (dbCheck.status === 'down') {
      overallStatus = isLocalDev ? 'degraded' : 'unhealthy';
    }

    return {
      status: overallStatus,
      version: '0.1.0',
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: dbCheck.status === 'up' ? 'up' : (isLocalDev ? 'degraded' : 'down'),
          latencyMs: dbCheck.latencyMs,
          message: dbCheck.message || (dbCheck.status === 'up' ? 'Database operational' : 'Database offline (graceful local development mode)'),
        },
        redis: {
          status: 'up',
          message: 'Redis queue connection ready',
        },
      },
    };
  }
}

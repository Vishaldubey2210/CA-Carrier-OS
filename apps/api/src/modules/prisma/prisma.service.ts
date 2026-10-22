import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private connected = false;
  private lastError: string | null = null;

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.connected = true;
      this.lastError = null;
      this.logger.log('Successfully connected to database');
    } catch (err: any) {
      this.connected = false;
      this.lastError = err?.message || 'Database connection error';
      if (process.env.NODE_ENV === 'production') {
        const fatalMsg = `FATAL: Database connection required in production mode. Cannot fall back to in-memory storage: ${this.lastError}`;
        this.logger.error(fatalMsg);
        throw new Error(fatalMsg);
      }
      this.logger.warn(
        `Database connection could not be established on startup: ${this.lastError}. (Operating in degraded/offline mode for local development)`
      );
    }
  }

  async checkHealth(): Promise<{ status: 'up' | 'down'; latencyMs?: number; message?: string }> {
    const startTime = Date.now();
    try {
      await this.$queryRaw`SELECT 1`;
      this.connected = true;
      this.lastError = null;
      return {
        status: 'up',
        latencyMs: Date.now() - startTime,
      };
    } catch (err: any) {
      this.connected = false;
      this.lastError = err?.message || 'Database query error';
      return {
        status: 'down',
        message: this.lastError ?? undefined,
        latencyMs: Date.now() - startTime,
      };
    }
  }

  isDatabaseConnected(): boolean {
    return this.connected;
  }

  getLastError(): string | null {
    return this.lastError;
  }

  async onModuleDestroy(): Promise<void> {
    if (this.connected) {
      await this.$disconnect();
    }
  }
}

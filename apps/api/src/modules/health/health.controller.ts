import { Controller, Get, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import { HealthService, HealthStatus } from './health.service.js';

@Controller('api/v1/health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  getLiveness() {
    return this.healthService.getLiveness();
  }

  @Get('ready')
  async getReadiness(@Res({ passthrough: true }) res: Response) {
    const status = await this.healthService.getReadiness();
    if (status.status === 'unhealthy') {
      res.status(HttpStatus.SERVICE_UNAVAILABLE);
    }
    return status;
  }
}

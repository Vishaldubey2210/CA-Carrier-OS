import { Controller, Post, Get, Body, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { SupportService, ContactEnquiryInput } from './support.service.js';

@Controller('api/v1/support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('contact')
  @HttpCode(HttpStatus.OK)
  async submitContact(
    @Body() body: ContactEnquiryInput,
    @Req() req: Request
  ) {
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.ip || '127.0.0.1';
    return await this.supportService.submitEnquiry(body, clientIp);
  }

  @Get('enquiries')
  @HttpCode(HttpStatus.OK)
  async getEnquiries() {
    return await this.supportService.listEnquiries();
  }
}

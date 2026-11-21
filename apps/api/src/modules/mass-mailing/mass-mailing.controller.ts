import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MassMailingService } from './mass-mailing.service.js';
import {
  SmtpConfigSchema,
  MassMailingCampaignSchema,
  createSuccessResponse,
  ApiResponse,
  SmtpConfigInput,
  SmtpConfigRecord,
  MassMailingCampaignRequest,
  MassMailingCampaignResult,
  MassMailingRecipient,
} from '@ca-career-os/shared';

@Controller('api/v1/mass-mailing')
export class MassMailingController {
  constructor(private readonly massMailingService: MassMailingService) {}

  @Post('verify-smtp')
  @HttpCode(HttpStatus.OK)
  async verifySmtp(@Body() body: SmtpConfigInput): Promise<ApiResponse<any>> {
    const validated = SmtpConfigSchema.parse(body);
    const result = await this.massMailingService.verifySmtp(validated);
    return createSuccessResponse(result);
  }

  @Post('save-smtp')
  @HttpCode(HttpStatus.OK)
  async saveSmtp(@Body() body: SmtpConfigInput): Promise<ApiResponse<SmtpConfigRecord>> {
    const validated = SmtpConfigSchema.parse(body);
    const record = await this.massMailingService.saveSmtpConfig(validated);
    return createSuccessResponse(record);
  }

  @Get('smtp-status')
  getSmtpStatus(): ApiResponse<SmtpConfigRecord | { configured: false }> {
    const saved = this.massMailingService.getSavedSmtpConfig();
    if (!saved) {
      return createSuccessResponse({ configured: false });
    }
    return createSuccessResponse(saved);
  }

  @Get('targets')
  getTargetFirms(
    @Query('search') search?: string,
    @Query('region') region?: string,
    @Query('city') city?: string,
    @Query('category') category?: string,
    @Query('limit') limit?: string
  ): ApiResponse<{ total: number; firms: MassMailingRecipient[] }> {
    const result = this.massMailingService.getTargetFirms({
      search,
      region,
      city,
      category,
      limit: limit ? parseInt(limit, 10) : 50,
    });
    return createSuccessResponse(result);
  }

  @Post('send')
  @HttpCode(HttpStatus.OK)
  async sendCampaign(@Body() body: MassMailingCampaignRequest): Promise<ApiResponse<MassMailingCampaignResult>> {
    const validated = MassMailingCampaignSchema.parse(body);
    const result = await this.massMailingService.executeCampaign(validated as any);
    return createSuccessResponse(result);
  }
}

import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import {
  CAPathway,
  CreateOfferComparisonSchema,
  createSuccessResponse,
} from '@ca-career-os/shared';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { WorkspaceGuard } from '../../common/guards/workspace.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { CurrentWorkspace } from '../../common/decorators/current-workspace.decorator.js';
import { FinancialService } from './financial.service.js';

@Controller('api/v1/financial')
export class FinancialController {
  constructor(private readonly financialService: FinancialService) {}

  /**
   * Browse verified salary benchmarks
   */
  @Get('salary-benchmarks')
  async listBenchmarks(
    @Query('pathway') pathway?: CAPathway,
    @Query('city') city?: string,
    @Query('industry') industry?: string
  ) {
    const list = await this.financialService.listSalaryBenchmarks(pathway, city, industry);
    return createSuccessResponse(list);
  }

  /**
   * Unbundle CTC breakdown into fixed, variable, PF, gratuity, and estimated take-home
   */
  @Post('unbundle-ctc')
  unbundleCtc(@Body() body: { annualCtc?: number; fixedPercentage?: number; regime?: 'NEW' | 'OLD' }) {
    if (!body?.annualCtc) {
      throw new BadRequestException('Annual CTC is required');
    }
    const result = this.financialService.unbundleCtc({
      annualCtc: Number(body.annualCtc),
      fixedPercentage: body.fixedPercentage ? Number(body.fixedPercentage) : undefined,
      regime: body.regime,
    });
    return createSuccessResponse(result);
  }

  /**
   * Create an offer comparison entry (Candidate Workspace only)
   */
  @Post('offers')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  async createOffer(
    @Body() body: unknown,
    @CurrentUser() user: any,
    @CurrentWorkspace() workspace: any
  ) {
    const parse = CreateOfferComparisonSchema.safeParse(body);
    if (!parse.success) {
      throw new BadRequestException({
        message: 'Invalid offer comparison payload',
        errors: parse.error.errors,
      });
    }

    const offer = await this.financialService.createOfferComparison(
      parse.data,
      user.id,
      workspace.id
    );
    return createSuccessResponse(offer);
  }

  /**
   * List candidate offer comparison records
   */
  @Get('offers')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  async listOffers(
    @CurrentUser() user: any,
    @CurrentWorkspace() workspace: any
  ) {
    const list = await this.financialService.listUserOffers(user.id, workspace.id);
    return createSuccessResponse(list);
  }

  /**
   * Delete an offer comparison record
   */
  @Delete('offers/:id')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  async deleteOffer(
    @Param('id') id: string,
    @CurrentUser() user: any
  ) {
    const res = await this.financialService.deleteOffer(id, user.id);
    return createSuccessResponse(res);
  }
}

import { Injectable, Logger, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  CAPathway,
  SalaryBenchmarkItem,
  OfferComparisonItem,
  CreateOfferComparisonInputType,
} from '@ca-career-os/shared';
import { PrismaService } from '../prisma/prisma.service.js';
import { CURATED_SALARY_BENCHMARKS } from './salary-benchmarks.data.js';

export interface UnbundleCtcInput {
  annualCtc: number;
  fixedPercentage?: number; // e.g. 85%
  regime?: 'NEW' | 'OLD';
}

export interface UnbundleCtcOutput {
  annualCtc: number;
  fixedBase: number;
  variableComponent: number;
  employerPf: number;
  employeePf: number;
  gratuity: number;
  professionalTax: number;
  estimatedAnnualTax: number;
  estimatedMonthlyTakeHome: number;
  regimeUsed: string;
  disclaimer: string;
}

@Injectable()
export class FinancialService {
  private readonly logger = new Logger(FinancialService.name);
  private readonly memOffers = new Map<string, OfferComparisonItem>(); // id -> OfferComparisonItem

  constructor(private readonly prisma: PrismaService) {}

  /**
   * List verified salary benchmarks with provenance and limitations.
   */
  async listSalaryBenchmarks(
    pathway?: CAPathway,
    locationCity?: string,
    industry?: string
  ): Promise<SalaryBenchmarkItem[]> {
    let benchmarks = [...CURATED_SALARY_BENCHMARKS];

    if (pathway) {
      benchmarks = benchmarks.filter((b) => b.pathway === pathway);
    }
    if (locationCity) {
      const cityLower = locationCity.toLowerCase();
      benchmarks = benchmarks.filter((b) => b.locationCity.toLowerCase().includes(cityLower));
    }
    if (industry) {
      const indLower = industry.toLowerCase();
      benchmarks = benchmarks.filter((b) => b.industry.toLowerCase().includes(indLower));
    }

    return benchmarks;
  }

  /**
   * Unbundle CTC into fixed, variable, PF, gratuity, tax, and estimated monthly take-home.
   */
  unbundleCtc(input: UnbundleCtcInput): UnbundleCtcOutput {
    const { annualCtc, fixedPercentage = 85, regime = 'NEW' } = input;

    if (annualCtc <= 0) {
      throw new BadRequestException('Annual CTC must be a positive number');
    }

    const fixedBase = Math.round((annualCtc * Math.min(100, Math.max(50, fixedPercentage))) / 100);
    const variableComponent = annualCtc - fixedBase;

    // Basic salary typically accounts for 40% of fixed pay in Indian corporate structures
    const basicSalary = Math.round(fixedBase * 0.4);

    // Employer PF: 12% of basic (capped at statutory or actual)
    const employerPf = Math.min(Math.round(basicSalary * 0.12), 144000);
    const employeePf = employerPf;

    // Gratuity: 4.81% of basic
    const gratuity = Math.round(basicSalary * 0.0481);

    // Professional Tax: standard ₹2,500 annually in major Indian metros (MH, KA, DL)
    const professionalTax = 2500;

    // Estimated Taxable Income under New Regime (FY 2024-25 / 2025-26)
    // Gross Taxable = Fixed Base - Standard Deduction (₹75,000)
    const standardDeduction = 75000;
    const taxableIncome = Math.max(0, fixedBase - standardDeduction);

    let tax = 0;
    if (taxableIncome > 1500000) {
      tax = 140000 + (taxableIncome - 1500000) * 0.3;
    } else if (taxableIncome > 1200000) {
      tax = 80000 + (taxableIncome - 1200000) * 0.2;
    } else if (taxableIncome > 1000000) {
      tax = 50000 + (taxableIncome - 1000000) * 0.15;
    } else if (taxableIncome > 700000) {
      tax = 20000 + (taxableIncome - 700000) * 0.1;
    } else if (taxableIncome > 300000) {
      tax = (taxableIncome - 300000) * 0.05;
    }

    // Section 87A rebate for taxable income <= 7,000,00
    if (taxableIncome <= 700000) {
      tax = 0;
    }

    // Health & Education Cess: 4%
    const totalTax = Math.round(tax * 1.04);

    // Net Monthly Take-Home = (Fixed Base - Employee PF - Professional Tax - Total Tax) / 12
    const netAnnualCash = Math.max(0, fixedBase - employeePf - professionalTax - totalTax);
    const estimatedMonthlyTakeHome = Math.round(netAnnualCash / 12);

    return {
      annualCtc,
      fixedBase,
      variableComponent,
      employerPf,
      employeePf,
      gratuity,
      professionalTax,
      estimatedAnnualTax: totalTax,
      estimatedMonthlyTakeHome,
      regimeUsed: `${regime} Tax Regime (Section 115BAC)`,
      disclaimer:
        'This calculation is an estimate based on standard corporate salary structuring. Exact net pay depends on employer PF caps, specific HRA exemptions, NPS contribution elections, and medical insurance deductions.',
    };
  }

  /**
   * Create an offer comparison entry for candidate.
   * Strictly isolated to the candidate's personal workspace.
   */
  async createOfferComparison(
    input: CreateOfferComparisonInputType,
    userId: string,
    workspaceId: string
  ): Promise<OfferComparisonItem> {
    const totalCtc =
      input.baseSalary +
      input.variablePay +
      input.bonus +
      input.benefitsValue +
      input.stockValue;

    const unbundled = this.unbundleCtc({
      annualCtc: input.baseSalary, // Base guaranteed cash for realistic take-home
      fixedPercentage: 100,
    });

    const offerId = randomUUID();
    const item: OfferComparisonItem = {
      id: offerId,
      userId,
      workspaceId,
      title: input.title,
      companyName: input.companyName,
      roleTitle: input.roleTitle,
      baseSalary: input.baseSalary,
      variablePay: input.variablePay,
      variableConditions: input.variableConditions || null,
      bonus: input.bonus,
      benefitsValue: input.benefitsValue,
      stockValue: input.stockValue,
      totalCtc,
      monthlyNetEstimate: unbundled.estimatedMonthlyTakeHome,
      locationCity: input.locationCity,
      workArrangement: input.workArrangement,
      learningPriorityScore: input.learningPriorityScore,
      isGuaranteed: input.variablePay === 0 && input.stockValue === 0,
      assumptionsJson: {
        standardDeduction: 75000,
        regime: 'NEW',
        disclaimer: 'Variable bonus and equity vesting are non-guaranteed and subject to performance criteria.',
      },
      createdAt: new Date().toISOString(),
    };

    this.memOffers.set(offerId, item);
    this.logger.log(`Created offer comparison record ${offerId} for user ${userId}`);
    return item;
  }

  /**
   * List candidate offer comparison records.
   * Enforces Candidate Blindfold Rule (employers and recruiters have zero access).
   */
  async listUserOffers(userId: string, workspaceId: string): Promise<OfferComparisonItem[]> {
    return Array.from(this.memOffers.values()).filter(
      (o) => o.userId === userId && o.workspaceId === workspaceId
    );
  }

  /**
   * Delete an offer comparison record with user ownership check.
   */
  async deleteOffer(offerId: string, userId: string): Promise<{ deleted: boolean }> {
    const offer = this.memOffers.get(offerId);
    if (!offer) {
      throw new NotFoundException(`Offer comparison with ID ${offerId} not found`);
    }
    if (offer.userId !== userId) {
      throw new ForbiddenException('Access denied: You do not own this offer comparison record');
    }
    this.memOffers.delete(offerId);
    return { deleted: true };
  }
}

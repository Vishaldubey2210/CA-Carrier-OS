import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import {
  DocumentUploadInput,
  DocumentUploadSchema,
  Form108ExtractionResult,
  Form108ExtractionSchema,
} from '@ca-career-os/shared';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';

export interface DocumentOcrAdapter {
  extract(fileBuffer: Buffer, fileName: string): Promise<{
    rawText: string;
    fields: Record<string, any>;
    confidence: number;
    provider: string;
    isMock: boolean;
  }>;
}

/**
 * Deterministic Mock OCR Adapter for local verification and automated testing.
 * Labels all outputs explicitly with isMock: true, provider: 'mock-form108-parser'.
 * Recognizes structured Form 108 sample text or synthesized test buffers.
 */
export class MockOcrAdapter implements DocumentOcrAdapter {
  async extract(fileBuffer: Buffer, fileName: string): Promise<{
    rawText: string;
    fields: Record<string, any>;
    confidence: number;
    provider: string;
    isMock: boolean;
  }> {
    const textSample = fileBuffer.toString('utf8');

    // Simulate low-confidence or unreadable document if corrupted marker detected
    if (textSample.includes('CORRUPTED_UNREADABLE') || fileBuffer.length < 20) {
      return {
        rawText: 'Unreadable or severely blurred text.',
        fields: {},
        confidence: 0.35, // Low confidence
        provider: 'mock-form108-parser',
        isMock: true,
      };
    }

    // Deterministic Form 108 Articleship Completion Form parsed fields
    return {
      rawText: `THE INSTITUTE OF CHARTERED ACCOUNTANTS OF INDIA\nFORM 108 (See Regulation 65)\nCertificate of Service under Articles\nName of Principal: K. R. Ramanathan, FCA\nMembership No: FCA-084920\nFirm Name: Deloitte Haskins & Sells LLP\nFirm Registration No: 117366W\nPeriod of Service: From 01/02/2021 to 31/01/2024\nTotal Weeks Served: 156\nLeave Taken: 12 Weeks\nAreas of Practice: Statutory Audit, Internal Audit, Ind AS 115/116, CARO 2020.`,
      fields: {
        firmName: 'Deloitte Haskins & Sells LLP',
        firmRegistrationNumber: '117366W',
        principalName: 'K. R. Ramanathan',
        principalMembershipNumber: 'FCA-084920',
        articleshipStartDate: '2021-02-01T00:00:00.000Z',
        articleshipEndDate: '2024-01-31T00:00:00.000Z',
        totalWeeksServed: 156,
        leaveTakenWeeks: 12,
        areasOfPractice: [
          'Statutory Audit',
          'Internal Financial Controls (IFCoFR)',
          'Ind AS Reporting',
          'CARO 2020 Compliance',
        ],
      },
      confidence: 0.96,
      provider: 'mock-form108-parser',
      isMock: true,
    };
  }
}

export interface DocumentProcessingResult {
  success: boolean;
  documentType: string;
  fileSignatureValid: boolean;
  confidence: number;
  extractedForm108?: Form108ExtractionResult;
  requiresManualReview: boolean;
  error?: string;
  metadata: {
    fileName: string;
    fileSizeBytes: number;
    mimeType: string;
    provider: string;
    isMock: boolean;
  };
}

@Injectable()
export class DocumentIntelligenceService {
  private readonly logger = new Logger(DocumentIntelligenceService.name);
  private ocrAdapter: DocumentOcrAdapter;
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  constructor() {
    this.ocrAdapter = new MockOcrAdapter();
  }

  setOcrAdapter(adapter: DocumentOcrAdapter) {
    this.ocrAdapter = adapter;
  }

  /**
   * Validates file signature (magic bytes) against declared MIME type to prevent polyglot file uploads.
   */
  private validateFileSignature(buffer: Buffer, mimeType: string): boolean {
    if (buffer.length < 4) return false;

    // PDF: %PDF- (0x25 0x50 0x44 0x46)
    if (mimeType === 'application/pdf') {
      return (
        buffer[0] === 0x25 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x44 &&
        buffer[3] === 0x46
      );
    }

    // PNG: \x89PNG (0x89 0x50 0x4E 0x47)
    if (mimeType === 'image/png') {
      return (
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4E &&
        buffer[3] === 0x47
      );
    }

    // JPEG: \xFF\xD8\xFF (0xFF 0xD8 0xFF)
    if (mimeType === 'image/jpeg') {
      return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    }

    return false;
  }

  /**
   * Process and extract structured verified fields from candidate documents (e.g. Form 108 Articleship Certificate).
   */
  async processDocument(input: DocumentUploadInput): Promise<DocumentProcessingResult> {
    const parseResult = DocumentUploadSchema.safeParse(input);
    if (!parseResult.success) {
      throw new BadRequestException({
        message: 'Invalid document upload payload',
        errors: parseResult.error.errors,
      });
    }

    // 1. Decode base64 content
    let fileBuffer: Buffer;
    try {
      fileBuffer = Buffer.from(input.base64Content, 'base64');
    } catch {
      throw new BadRequestException('Invalid base64 document content');
    }

    // 2. Validate file size (max 10MB)
    const declaredSize = (input as any).fileSizeBytes;
    if (fileBuffer.length > this.MAX_FILE_SIZE || (typeof declaredSize === 'number' && declaredSize > this.MAX_FILE_SIZE)) {
      const sizeToCheck = fileBuffer.length > this.MAX_FILE_SIZE ? fileBuffer.length : declaredSize;
      throw new BadRequestException(
        `File size (${(sizeToCheck / (1024 * 1024)).toFixed(1)}MB) exceeds maximum allowed limit of 10MB`
      );
    }

    if (fileBuffer.length === 0) {
      throw new BadRequestException('Uploaded document is empty');
    }

    // 3. Validate Magic Bytes / File Signature
    const isSignatureValid = this.validateFileSignature(fileBuffer, input.mimeType);
    if (!isSignatureValid) {
      throw new BadRequestException(
        `File signature mismatch: File binary header does not match declared MIME type ${input.mimeType}`
      );
    }

    // 4. Secure temporary file handling with guaranteed cleanup in finally block
    const tempFileName = `ocr_${crypto.randomBytes(8).toString('hex')}_${path.basename(input.fileName)}`;
    const tempFilePath = path.join(os.tmpdir(), tempFileName);

    try {
      // Write temporary file securely
      fs.writeFileSync(tempFilePath, fileBuffer, { mode: 0o600 });

      // Run OCR extraction adapter
      const extraction = await this.ocrAdapter.extract(fileBuffer, input.fileName);

      // Low-confidence handling (< 60% confidence requires manual verification)
      const requiresManualReview = extraction.confidence < 0.6;

      let extractedForm108: Form108ExtractionResult | undefined;
      if (input.documentType === 'FORM_108' && !requiresManualReview) {
        const schemaValidation = Form108ExtractionSchema.safeParse({
          ...extraction.fields,
          isOcrExtracted: true,
          isMock: extraction.isMock,
          confidence: extraction.confidence,
        });

        if (schemaValidation.success) {
          extractedForm108 = schemaValidation.data;
        } else {
          this.logger.warn(`Form 108 validation errors: ${JSON.stringify(schemaValidation.error.errors)}`);
        }
      }

      this.logger.log(
        `Processed document ${input.fileName} (${fileBuffer.length} bytes) via ${extraction.provider} (Confidence: ${(extraction.confidence * 100).toFixed(1)}%, ManualReview: ${requiresManualReview})`
      );

      return {
        success: !requiresManualReview && Boolean(extractedForm108),
        documentType: input.documentType,
        fileSignatureValid: true,
        confidence: extraction.confidence,
        extractedForm108,
        requiresManualReview,
        error: requiresManualReview ? 'OCR confidence score below 60%. Manual review required.' : undefined,
        metadata: {
          fileName: input.fileName,
          fileSizeBytes: fileBuffer.length,
          mimeType: input.mimeType,
          provider: extraction.provider,
          isMock: extraction.isMock,
        },
      };
    } finally {
      // Guaranteed cleanup of temporary file
      if (fs.existsSync(tempFilePath)) {
        try {
          fs.unlinkSync(tempFilePath);
        } catch (cleanupErr: any) {
          this.logger.warn(`Failed to cleanup temp file ${tempFilePath}: ${cleanupErr.message}`);
        }
      }
    }
  }
}

import dotenv from 'dotenv';
import { EnvConfigSchema, type EnvConfig } from '@ca-career-os/shared';

// Load .env if present
dotenv.config();

export function validateEnv(): EnvConfig {
  const result = EnvConfigSchema.safeParse(process.env);
  if (!result.success) {
    const errorDetails = result.error.errors
      .map((e) => `[${e.path.join('.')}]: ${e.message}`)
      .join(', ');
    throw new Error(`Invalid environment configuration: ${errorDetails}`);
  }
  return result.data;
}

export const env = validateEnv();

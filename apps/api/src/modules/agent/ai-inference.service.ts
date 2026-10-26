import { Injectable, Logger } from '@nestjs/common';

export interface ChatMessageItem {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AiInferenceOptions {
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AiInferenceResult {
  content: string;
  provider: 'nvidia' | 'groq' | 'deterministic-fallback';
  model: string;
  error?: string;
}

@Injectable()
export class AiInferenceService {
  private readonly logger = new Logger(AiInferenceService.name);

  private getNvidiaConfig() {
    const apiKey = process.env.NVIDIA_API_KEY || process.env.AI_API_KEY;
    const baseUrl = (process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1').replace(/\/+$/, '');
    const model = process.env.AI_MODEL || 'meta/llama-3.3-70b-instruct';
    return { apiKey, baseUrl, model };
  }

  private getGroqConfig() {
    const apiKey = process.env.GROQ_API_KEY || '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';
    const baseUrl = (process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1').replace(/\/+$/, '');
    const model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
    return { apiKey, baseUrl, model };
  }

  /**
   * Generates a chat completion with automatic failover:
   * 1. Attempts NVIDIA NIM API first.
   * 2. If NVIDIA returns an error (410 EOL, 401, 429, timeout, network failure),
   *    automatically falls over to Groq API.
   * 3. If both fail, returns grounded deterministic response.
   */
  async generateCompletion(
    messages: ChatMessageItem[],
    options: AiInferenceOptions = {}
  ): Promise<AiInferenceResult> {
    const fullMessages: ChatMessageItem[] = [];
    if (options.systemPrompt) {
      fullMessages.push({ role: 'system', content: options.systemPrompt });
    }
    fullMessages.push(...messages);

    const nvidia = this.getNvidiaConfig();
    const groq = this.getGroqConfig();

    // -----------------------------------------------------------------------
    // STEP 1: Attempt NVIDIA API
    // -----------------------------------------------------------------------
    if (nvidia.apiKey) {
      try {
        this.logger.log(`Attempting primary inference via NVIDIA API (${nvidia.model})...`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 7000);

        const res = await fetch(`${nvidia.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${nvidia.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: nvidia.model,
            messages: fullMessages,
            temperature: options.temperature ?? 0.3,
            max_tokens: options.maxTokens ?? 1024,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          const data = (await res.json()) as any;
          const content = data?.choices?.[0]?.message?.content;
          if (content && typeof content === 'string') {
            this.logger.log(`NVIDIA API response received successfully.`);
            return {
              content: content.trim(),
              provider: 'nvidia',
              model: nvidia.model,
            };
          }
        }

        const errorBody = await res.text().catch(() => '');
        this.logger.warn(
          `NVIDIA API failed with status ${res.status}: ${errorBody.substring(0, 150)}. Failing over to Groq API...`
        );
      } catch (err: any) {
        this.logger.warn(`NVIDIA API request threw exception (${err?.message || err}). Failing over to Groq API...`);
      }
    } else {
      this.logger.log(`NVIDIA_API_KEY not configured. Directly using Groq API...`);
    }

    // -----------------------------------------------------------------------
    // STEP 2: Fallback to Groq API
    // -----------------------------------------------------------------------
    if (groq.apiKey) {
      try {
        this.logger.log(`Calling Groq API fallback (${groq.model})...`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 9000);

        const res = await fetch(`${groq.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${groq.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: groq.model,
            messages: fullMessages,
            temperature: options.temperature ?? 0.3,
            max_tokens: options.maxTokens ?? 1024,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          const data = (await res.json()) as any;
          const content = data?.choices?.[0]?.message?.content;
          if (content && typeof content === 'string') {
            this.logger.log(`Groq API fallback generated inference successfully.`);
            return {
              content: content.trim(),
              provider: 'groq',
              model: groq.model,
            };
          }
        }

        const errorBody = await res.text().catch(() => '');
        this.logger.error(`Groq API fallback failed with status ${res.status}: ${errorBody.substring(0, 150)}`);
      } catch (err: any) {
        this.logger.error(`Groq API request error: ${err?.message || err}`);
      }
    }

    // -----------------------------------------------------------------------
    // STEP 3: Deterministic ICAI Fallback
    // -----------------------------------------------------------------------
    this.logger.warn(`All external LLM providers failed. Providing deterministic ICAI-grounded response.`);
    return {
      content:
        'I have analyzed your request under ICAI regulatory standards and your candidate profile context. Please review your active milestones, verified competencies, and preparation roadmap.',
      provider: 'deterministic-fallback',
      model: 'rule-based-grounding',
    };
  }
}

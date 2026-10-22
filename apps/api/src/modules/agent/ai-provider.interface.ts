import { AgentToolDefinition } from './agent-tools.registry.js';

export interface ChatMessageContext {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
}

export interface GeneratedToolCall {
  id: string;
  name: string;
  arguments: Record<string, any>;
}

export interface AiProviderResponse {
  content: string;
  toolCalls?: GeneratedToolCall[];
  provider: 'gemini' | 'openai' | 'claude' | 'local-deterministic';
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
}

export interface AiProvider {
  generate(
    systemPrompt: string,
    history: ChatMessageContext[],
    tools: AgentToolDefinition[]
  ): Promise<AiProviderResponse>;
}

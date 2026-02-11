/**
 * Anthropic Claude Provider 实现
 */

import Anthropic from '@anthropic-ai/sdk';
import type { LLMProvider } from './provider.js';
import type {
  ChatParams,
  Chunk,
  ChatResponse,
  Message,
  ToolDefinition,
  ToolCall,
  TokenUsage,
  ContentBlock,
} from './types.js';

export interface AnthropicConfig {
  apiKey: string;
  baseUrl?: string;
  defaultModel: string;
}

export class AnthropicProvider implements LLMProvider {
  private client: Anthropic;
  private defaultModel: string;

  constructor(config: AnthropicConfig) {
    this.client = new Anthropic({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
    });
    this.defaultModel = config.defaultModel;
  }

  async *chat(params: ChatParams): AsyncGenerator<Chunk> {
    const stream = await this.client.messages.create({
      model: params.model || this.defaultModel,
      messages: this.convertMessages(params.messages),
      tools: this.convertTools(params.tools),
      system: params.system,
      max_tokens: params.maxTokens || 4096,
      temperature: params.temperature,
      stream: true,
    });

    for await (const event of stream) {
      switch (event.type) {
        case 'content_block_delta':
          if (event.delta.type === 'text_delta') {
            yield { type: 'text', content: event.delta.text };
          }
          break;
        case 'message_stop':
          yield { type: 'done' };
          break;
        case 'message_delta':
          if (event.usage) {
            const inputTokens = event.usage.input_tokens ?? 0;
            const outputTokens = event.usage.output_tokens ?? 0;
            yield {
              type: 'done',
              usage: {
                inputTokens,
                outputTokens,
                totalTokens: inputTokens + outputTokens,
              },
            };
          }
          break;
      }
    }
  }

  async chatComplete(params: ChatParams): Promise<ChatResponse> {
    const response = await this.client.messages.create({
      model: params.model || this.defaultModel,
      messages: this.convertMessages(params.messages),
      tools: this.convertTools(params.tools),
      system: params.system,
      max_tokens: params.maxTokens || 4096,
      temperature: params.temperature,
    });

    return this.convertResponse(response);
  }

  getModels(): string[] {
    return [
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
      'claude-3-5-opus-20241022',
    ];
  }

  private convertMessages(messages: Message[]): Anthropic.MessageParam[] {
    return messages
      .filter((msg) => msg.role !== 'system') // system 消息通过 system 参数传递
      .map((msg) => {
        if (typeof msg.content === 'string') {
          return { role: msg.role as 'user' | 'assistant', content: msg.content };
        }
        return {
          role: msg.role as 'user' | 'assistant',
          content: msg.content.map(this.convertContentBlock),
        };
      });
  }

  private convertContentBlock(block: ContentBlock): Anthropic.ContentBlock {
    switch (block.type) {
      case 'text':
        return { type: 'text', text: block.text, citations: null };
      case 'tool_use':
        return {
          type: 'tool_use',
          id: block.id,
          name: block.name,
          input: block.input,
        };
      case 'tool_result':
        // tool_result 需要特殊处理，Anthropic SDK 的类型定义不完整
        return {
          type: 'tool_result',
          tool_use_id: block.tool_use_id,
          content: block.content,
          is_error: false,
        } as unknown as Anthropic.ContentBlock;
      default:
        throw new Error(`Unknown content block type: ${(block as { type: string }).type}`);
    }
  }

  private convertTools(tools?: ToolDefinition[]): Anthropic.Tool[] | undefined {
    if (!tools) return undefined;
    return tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.input_schema as Anthropic.Tool.InputSchema,
    }));
  }

  private convertResponse(response: Anthropic.Message): ChatResponse {
    const content = response.content
      .filter((block) => block.type === 'text')
      .map((block) => (block.type === 'text' ? block.text : ''))
      .join('');

    const toolCalls: ToolCall[] = response.content
      .filter((block) => block.type === 'tool_use')
      .map((block) => {
        if (block.type === 'tool_use') {
          return {
            id: block.id,
            name: block.name,
            input: block.input as Record<string, unknown>,
          };
        }
        throw new Error('Invalid tool use block');
      });

    const usage: TokenUsage = {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      totalTokens: response.usage.input_tokens + response.usage.output_tokens,
    };

    return {
      content,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      usage,
    };
  }
}

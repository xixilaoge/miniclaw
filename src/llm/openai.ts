/**
 * OpenAI Provider 实现
 */

import OpenAI from 'openai';
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
  TextContent,
} from './types.js';

export interface OpenAIConfig {
  apiKey: string;
  baseUrl?: string;
  defaultModel: string;
}

export class OpenAIProvider implements LLMProvider {
  private client: OpenAI;
  private defaultModel: string;

  constructor(config: OpenAIConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
    });
    this.defaultModel = config.defaultModel;
  }

  async *chat(params: ChatParams): AsyncGenerator<Chunk> {
    const stream = await this.client.chat.completions.create({
      model: params.model || this.defaultModel,
      messages: this.convertMessages(params.messages),
      tools: this.convertTools(params.tools),
      max_tokens: params.maxTokens,
      temperature: params.temperature,
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;
      if (delta?.content) {
        yield { type: 'text', content: delta.content };
      }
      if (chunk.choices[0]?.finish_reason === 'stop') {
        yield { type: 'done' };
      }
      if (chunk.usage) {
        yield {
          type: 'done',
          usage: {
            inputTokens: chunk.usage.prompt_tokens,
            outputTokens: chunk.usage.completion_tokens,
            totalTokens: chunk.usage.total_tokens,
          },
        };
      }
    }
  }

  async chatComplete(params: ChatParams): Promise<ChatResponse> {
    const response = await this.client.chat.completions.create({
      model: params.model || this.defaultModel,
      messages: this.convertMessages(params.messages),
      tools: this.convertTools(params.tools),
      max_tokens: params.maxTokens,
      temperature: params.temperature,
    });

    return this.convertResponse(response);
  }

  getModels(): string[] {
    return ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'];
  }

  private convertMessages(messages: Message[]): OpenAI.ChatCompletionMessageParam[] {
    return messages.map((msg) => {
      if (typeof msg.content === 'string') {
        return { role: msg.role, content: msg.content };
      }
      // 对于带内容块的消息，OpenAI 需要特殊处理
      if (msg.content.length === 1 && msg.content[0].type === 'text') {
        return { role: msg.role, content: (msg.content[0] as TextContent).text };
      }
      // 当内容是数组时，只支持 assistant 角色
      return {
        role: 'assistant',
        content: msg.content.map(this.convertContentBlock),
      } as OpenAI.ChatCompletionMessageParam;
    });
  }

  private convertContentBlock(block: ContentBlock): OpenAI.ChatCompletionContentPart {
    switch (block.type) {
      case 'text':
        return { type: 'text', text: block.text };
      case 'tool_use':
      case 'tool_result':
        // OpenAI 的工具调用通过不同的机制处理
        throw new Error(`Content block type ${block.type} should be handled separately`);
      default:
        throw new Error(`Unknown content block type: ${(block as { type: string }).type}`);
    }
  }

  private convertTools(tools?: ToolDefinition[]): OpenAI.ChatCompletionTool[] | undefined {
    if (!tools) return undefined;
    return tools.map((tool) => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.input_schema,
      },
    }));
  }

  private convertResponse(response: OpenAI.ChatCompletion): ChatResponse {
    const content = response.choices[0]?.message?.content || '';

    const toolCalls: ToolCall[] = [];
    for (const tc of response.choices[0]?.message?.tool_calls || []) {
      if (tc.type === 'function') {
        toolCalls.push({
          id: tc.id,
          name: tc.function.name,
          input: JSON.parse(tc.function.arguments) as Record<string, unknown>,
        });
      }
    }

    const usage: TokenUsage = {
      inputTokens: response.usage?.prompt_tokens || 0,
      outputTokens: response.usage?.completion_tokens || 0,
      totalTokens: response.usage?.total_tokens || 0,
    };

    return {
      content,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      usage,
    };
  }
}

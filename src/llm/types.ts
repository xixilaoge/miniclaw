/**
 * LLM 统一类型定义
 */

export type MessageRole = 'user' | 'assistant' | 'system';

export interface TextContent {
  type: 'text';
  text: string;
}

export interface ToolUseContent {
  type: 'tool_use';
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface ToolResultContent {
  type: 'tool_result';
  tool_use_id: string;
  content: string;
}

export type ContentBlock = TextContent | ToolUseContent | ToolResultContent;

export interface Message {
  role: MessageRole;
  content: string | ContentBlock[];
}

export interface ToolDefinition {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

export interface ToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface Chunk {
  type: 'text' | 'tool_use' | 'done';
  content?: string;
  toolCall?: ToolCall;
  usage?: TokenUsage;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface ChatResponse {
  content: string;
  toolCalls?: ToolCall[];
  usage?: TokenUsage;
}

export interface ChatParams {
  messages: Message[];
  tools?: ToolDefinition[];
  model?: string;
  maxTokens?: number;
  temperature?: number;
  system?: string;
}

/**
 * Agent 引擎类型定义
 */

import type { Message, ToolDefinition, ChatResponse } from '../llm/types.js';
import type { SessionData } from '../memory/types.js';

export interface AgentConfig {
  llm: {
    provider: 'anthropic' | 'openai';
    anthropic?: {
      apiKey: string;
      defaultModel: string;
      baseUrl?: string;
    };
    openai?: {
      apiKey: string;
      defaultModel: string;
      baseUrl?: string;
    };
    routing?: {
      simple?: string;
      normal?: string;
      complex?: string;
    };
  };
  tools: {
    enabled: string[];
    bash?: {
      allowed_commands: string[];
      timeout_seconds: number;
      working_dir: string;
    };
  };
  skills: {
    directories: string[];
    auto_load: boolean;
  };
  memory: {
    session: {
      storage_path: string;
      default_session: string;
      max_turns: number;
      max_tokens: number;
    };
    agent: {
      workspace_path: string;
      files: string[];
    };
  };
}

export interface AgentContext {
  session: SessionData;
  tools: ToolDefinition[];
  skills: Map<string, string>; // skill name -> content
}

export interface AgentRunOptions {
  sessionId?: string;
  model?: string;
  system?: string;
}

export interface AgentResult {
  response: ChatResponse;
  toolResults?: ToolResult[];
  sessionUsed: SessionData;
}

export interface ToolResult {
  name: string;
  success: boolean;
  result: unknown;
  error?: string;
}

export interface Agent {
  run(messages: Message[], options?: AgentRunOptions): Promise<AgentResult>;
  chat(userMessage: string, sessionId?: string): Promise<string>;
}

/**
 * Agent 引擎实现
 */

import logger from '../logger/index.js';
import { createLLMProvider } from '../llm/index.js';
import { ToolRegistryImpl } from '../tools/index.js';
import { SessionStoreImpl } from '../memory/session-store.js';
import { AgentStoreImpl } from '../memory/agent-store.js';
import type {
  Agent,
  AgentConfig,
  AgentContext,
  AgentResult,
  AgentRunOptions,
  ToolResult,
} from './types.js';
import type { Message, ChatResponse } from '../llm/types.js';

/**
 * Agent 实现
 */
export class AgentImpl implements Agent {
  private config: AgentConfig;
  private toolRegistry: ToolRegistryImpl;
  private sessionStore: SessionStoreImpl;
  private agentStore: AgentStoreImpl;

  constructor(agentConfig: AgentConfig) {
    this.config = agentConfig;
    this.toolRegistry = new ToolRegistryImpl();
    this.sessionStore = new SessionStoreImpl(agentConfig.memory.session.storage_path);
    this.agentStore = new AgentStoreImpl(agentConfig.memory.agent.workspace_path);
  }

  /**
   * 运行 Agent 对话
   */
  async run(messages: Message[], options?: AgentRunOptions): Promise<AgentResult> {
    const sessionId = options?.sessionId || this.config.memory.session.default_session;
    const model = options?.model;

    // 确保会话存在
    await this.ensureSession(sessionId);

    // 获取 LLM Provider
    const provider = createLLMProvider(this.config.llm);

    // 构建上下文
    const context = await this.buildContext(sessionId);

    // 添加系统消息
    const systemPrompt = options?.system || await this.buildSystemPrompt(context);
    const allMessages: Message[] = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ];

    // 调用 LLM
    const response = await provider.chatComplete({
      messages: allMessages,
      model: model || this.getDefaultModel(),
      tools: context.tools,
    });

    // 保存消息到会话
    await this.saveMessages(sessionId, messages, response);

    // 处理工具调用
    let toolResults: ToolResult[] | undefined;
    if (response.toolCalls && response.toolCalls.length > 0) {
      toolResults = await this.executeToolCalls(response.toolCalls);
    }

    return {
      response,
      toolResults,
      sessionUsed: await this.sessionStore.load(sessionId),
    };
  }

  /**
   * 简单对话接口
   */
  async chat(userMessage: string, sessionId?: string): Promise<string> {
    const result = await this.run([{ role: 'user', content: userMessage }], { sessionId });
    return result.response.content;
  }

  /**
   * 确保会话存在
   */
  private async ensureSession(sessionId: string): Promise<void> {
    try {
      await this.sessionStore.load(sessionId);
    } catch {
      await this.sessionStore.create(sessionId);
    }
  }

  /**
   * 构建 Agent 上下文
   */
  private async buildContext(sessionId: string): Promise<AgentContext> {
    const session = await this.sessionStore.load(sessionId);
    const tools = this.toolRegistry.list();

    return {
      session,
      tools,
      skills: new Map(),
    };
  }

  /**
   * 构建系统提示
   */
  private async buildSystemPrompt(context: AgentContext): Promise<string> {
    const memory = await this.agentStore.readMemory();
    const identity = await this.agentStore.readIdentity();

    let prompt = '';

    if (identity) {
      prompt += `# Your Identity\n${identity}\n\n`;
    }

    prompt += `# Core Instructions\nYou are a helpful AI assistant with access to tools.\n\n`;

    if (memory) {
      prompt += `# Context\n${memory}\n\n`;
    }

    return prompt.trim();
  }

  /**
   * 获取默认模型
   */
  private getDefaultModel(): string {
    const { provider, anthropic, openai } = this.config.llm;
    if (provider === 'anthropic' && anthropic) {
      return anthropic.defaultModel;
    }
    if (provider === 'openai' && openai) {
      return openai.defaultModel;
    }
    return 'claude-3-5-sonnet-20241022';
  }

  /**
   * 保存消息到会话
   */
  private async saveMessages(sessionId: string, userMessages: Message[], response: ChatResponse): Promise<void> {
    for (const msg of userMessages) {
      await this.sessionStore.addMessage(sessionId, {
        role: msg.role,
        content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
      });
    }

    await this.sessionStore.addMessage(sessionId, {
      role: 'assistant',
      content: response.content,
    });
  }

  /**
   * 执行工具调用
   */
  private async executeToolCalls(toolCalls: NonNullable<ChatResponse['toolCalls']>): Promise<ToolResult[]> {
    const results: ToolResult[] = [];

    for (const toolCall of toolCalls) {
      try {
        const result = await this.toolRegistry.execute(toolCall.name, toolCall.input);
        results.push({
          name: toolCall.name,
          success: true,
          result,
        });
        logger.debug({ tool: toolCall.name }, 'Tool executed successfully');
      } catch (error) {
        results.push({
          name: toolCall.name,
          success: false,
          result: null,
          error: error instanceof Error ? error.message : String(error),
        });
        logger.warn({ tool: toolCall.name, error }, 'Tool execution failed');
      }
    }

    return results;
  }
}

/**
 * 创建 Agent 实例（别名）
 */
export { AgentImpl as Agent };

/**
 * 导出工厂函数
 */
export function createAgent(config: AgentConfig): Agent {
  return new AgentImpl(config);
}

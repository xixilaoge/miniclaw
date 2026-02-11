/**
 * LLM Provider 抽象接口
 */

import type { ChatParams, Chunk, ChatResponse } from './types.js';

/**
 * LLM Provider 统一接口
 * 所有 LLM 提供商（Anthropic、OpenAI 等）都需要实现此接口
 */
export interface LLMProvider {
  /**
   * 流式对话
   * @param params 聊天参数
   * @returns 异步生成器，产出流式响应块
   */
  chat(params: ChatParams): AsyncGenerator<Chunk>;

  /**
   * 非流式对话（完整响应）
   * @param params 聊天参数
   * @returns 完整的聊天响应
   */
  chatComplete(params: ChatParams): Promise<ChatResponse>;

  /**
   * 获取支持的模型列表
   * @returns 模型名称数组
   */
  getModels(): string[];
}

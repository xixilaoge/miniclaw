/**
 * LLM 抽象层入口
 * 提供工厂函数和统一导出
 */

import type { LLMProvider } from './provider.js';
import { AnthropicProvider } from './anthropic.js';
import { OpenAIProvider } from './openai.js';

export interface LLMConfig {
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
}

/**
 * 创建 LLM Provider 实例
 * @param config LLM 配置
 * @returns LLM Provider 实例
 */
export function createLLMProvider(config: LLMConfig): LLMProvider {
  switch (config.provider) {
    case 'anthropic':
      if (!config.anthropic?.apiKey) {
        throw new Error('Anthropic API key is required');
      }
      return new AnthropicProvider(config.anthropic);

    case 'openai':
      if (!config.openai?.apiKey) {
        throw new Error('OpenAI API key is required');
      }
      return new OpenAIProvider(config.openai);

    default:
      throw new Error(`Unknown provider: ${(config as { provider: string }).provider}`);
  }
}

// 导出所有类型
export * from './types.js';
export * from './provider.js';
export * from './anthropic.js';
export * from './openai.js';

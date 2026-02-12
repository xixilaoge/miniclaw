/**
 * agent 单元测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AgentImpl } from '../../src/agent/index.js';
import type { AgentConfig, AgentRunOptions, AgentResult } from '../../src/agent/types.js';

describe('Agent', () => {
  describe('构造 Agent', () => {
    it('应该创建 Agent 实例', () => {
      const config: AgentConfig = {
        llm: {
          provider: 'anthropic',
          anthropic: {
            apiKey: 'sk-test',
            defaultModel: 'claude-3-5-sonnet-20241022',
          },
        },
        tools: {
          enabled: ['read_file', 'write_file', 'bash'],
        },
        skills: {
          directories: ['./skills'],
          auto_load: false,
        },
        memory: {
          session: {
            storage_path: '/tmp/miniclaw/sessions',
            default_session: 'default',
            max_turns: 100,
            max_tokens: 100000,
          },
          agent: {
            workspace_path: '/tmp/miniclaw/workspace',
            files: ['MEMORY.md', 'IDENTITY.md', 'USER.md'],
          },
        },
      };
      const agent = new AgentImpl(config);

      expect(agent).toBeDefined();
      expect(agent['config']).toEqual(config);
    });
  });

  describe('run', () => {
    it('应该执行简单对话', async () => {
      const config: AgentConfig = {
        llm: {
          provider: 'anthropic',
          anthropic: {
            apiKey: 'sk-test',
            defaultModel: 'claude-3-5-sonnet-20241022',
          },
        },
        tools: {
          enabled: ['read_file', 'write_file', 'bash'],
        },
        skills: {
          directories: ['./skills'],
          auto_load: false,
        },
        memory: {
          session: {
            storage_path: '/tmp/miniclaw/sessions',
            default_session: 'default',
            max_turns: 100,
            max_tokens: 100000,
          },
          agent: {
            workspace_path: '/tmp/miniclaw/workspace',
            files: ['MEMORY.md', 'IDENTITY.md', 'USER.md'],
          },
        },
      };
      const agent = new AgentImpl(config);

      const result = await agent.run([{ role: 'user', content: '你好' }]);

      expect(result.response.content).toBeTruthy();
    });
  });
});

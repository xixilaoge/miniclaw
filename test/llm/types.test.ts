/**
 * llm/types 单元测试
 */

import { describe, it, expect } from 'vitest';
import type {
  MessageRole,
  TextContent,
  ToolUseContent,
  ToolResultContent,
  ContentBlock,
  Message,
  ToolDefinition,
  ToolCall,
  Chunk,
  TokenUsage,
  ChatResponse,
  ChatParams,
} from '../../src/llm/types.js';

describe('llm/types', () => {
  describe('MessageRole', () => {
    it('应该支持三种角色类型', () => {
      const roles: MessageRole[] = ['user', 'assistant', 'system'];
      expect(roles).toContain('user');
      expect(roles).toContain('assistant');
      expect(roles).toContain('system');
    });
  });

  describe('TextContent', () => {
    it('应该正确构造文本内容块', () => {
      const text: TextContent = {
        type: 'text',
        text: 'hello world',
      };
      expect(text.type).toBe('text');
      expect(text.text).toBe('hello world');
    });
  });

  describe('ToolUseContent', () => {
    it('应该正确构造工具使用内容块', () => {
      const toolUse: ToolUseContent = {
        type: 'tool_use',
        id: 'tool_123',
        name: 'read_file',
        input: { path: '/test.txt' },
      };
      expect(toolUse.type).toBe('tool_use');
      expect(toolUse.id).toBe('tool_123');
      expect(toolUse.name).toBe('read_file');
      expect(toolUse.input).toEqual({ path: '/test.txt' });
    });
  });

  describe('ToolResultContent', () => {
    it('应该正确构造工具结果内容块', () => {
      const toolResult: ToolResultContent = {
        type: 'tool_result',
        tool_use_id: 'tool_123',
        content: 'file content',
      };
      expect(toolResult.type).toBe('tool_result');
      expect(toolResult.tool_use_id).toBe('tool_123');
      expect(toolResult.content).toBe('file content');
    });
  });

  describe('Message', () => {
    it('应该支持字符串内容', () => {
      const message: Message = {
        role: 'user',
        content: 'hello',
      };
      expect(message.role).toBe('user');
      expect(message.content).toBe('hello');
    });

    it('应该支持内容块数组', () => {
      const content: ContentBlock[] = [
        { type: 'text', text: 'hello' },
        {
          type: 'tool_use',
          id: 'tool_1',
          name: 'bash',
          input: { command: 'ls' },
        },
      ];
      const message: Message = {
        role: 'assistant',
        content,
      };
      expect(message.role).toBe('assistant');
      expect(message.content).toEqual(content);
    });
  });

  describe('ToolDefinition', () => {
    it('应该正确构造工具定义', () => {
      const tool: ToolDefinition = {
        name: 'read_file',
        description: '读取文件内容',
        input_schema: {
          type: 'object',
          properties: {
            path: { type: 'string' },
          },
        },
      };
      expect(tool.name).toBe('read_file');
      expect(tool.description).toBe('读取文件内容');
      expect(tool.input_schema).toHaveProperty('type', 'object');
    });
  });

  describe('ToolCall', () => {
    it('应该正确构造工具调用', () => {
      const call: ToolCall = {
        id: 'call_123',
        name: 'write_file',
        input: { path: '/test.txt', content: 'hello' },
      };
      expect(call.id).toBe('call_123');
      expect(call.name).toBe('write_file');
      expect(call.input).toEqual({ path: '/test.txt', content: 'hello' });
    });
  });

  describe('Chunk', () => {
    it('应该正确构造文本块', () => {
      const chunk: Chunk = {
        type: 'text',
        content: 'hello',
      };
      expect(chunk.type).toBe('text');
      expect(chunk.content).toBe('hello');
    });

    it('应该正确构造工具使用块', () => {
      const chunk: Chunk = {
        type: 'tool_use',
        toolCall: {
          id: 'call_1',
          name: 'bash',
          input: { command: 'ls' },
        },
      };
      expect(chunk.type).toBe('tool_use');
      expect(chunk.toolCall).toEqual({
        id: 'call_1',
        name: 'bash',
        input: { command: 'ls' },
      });
    });

    it('应该正确构造完成块', () => {
      const chunk: Chunk = {
        type: 'done',
        content: undefined,
      };
      expect(chunk.type).toBe('done');
    });

    it('应该正确构造带 token 用量的块', () => {
      const chunk: Chunk = {
        type: 'done',
        usage: {
          inputTokens: 100,
          outputTokens: 50,
          totalTokens: 150,
        },
      };
      expect(chunk.type).toBe('done');
      expect(chunk.usage?.inputTokens).toBe(100);
      expect(chunk.usage?.outputTokens).toBe(50);
      expect(chunk.usage?.totalTokens).toBe(150);
    });
  });

  describe('TokenUsage', () => {
    it('应该正确构造 token 使用量', () => {
      const usage: TokenUsage = {
        inputTokens: 100,
        outputTokens: 50,
        totalTokens: 150,
      };
      expect(usage.inputTokens).toBe(100);
      expect(usage.outputTokens).toBe(50);
      expect(usage.totalTokens).toBe(150);
    });

    it('totalTokens 应该等于 input + output', () => {
      const usage: TokenUsage = {
        inputTokens: 100,
        outputTokens: 50,
        totalTokens: 150,
      };
      expect(usage.totalTokens).toBe(usage.inputTokens + usage.outputTokens);
    });
  });

  describe('ChatResponse', () => {
    it('应该正确构造纯文本响应', () => {
      const response: ChatResponse = {
        content: 'hello world',
      };
      expect(response.content).toBe('hello world');
      expect(response.toolCalls).toBeUndefined();
    });

    it('应该正确构造带工具调用的响应', () => {
      const response: ChatResponse = {
        content: '让我来帮你',
        toolCalls: [
          {
            id: 'call_1',
            name: 'read_file',
            input: { path: '/test.txt' },
          },
        ],
      };
      expect(response.content).toBe('让我来帮你');
      expect(response.toolCalls).toHaveLength(1);
      expect(response.toolCalls?.[0].name).toBe('read_file');
    });

    it('应该正确构造带 token 用量的响应', () => {
      const response: ChatResponse = {
        content: 'answer',
        usage: {
          inputTokens: 100,
          outputTokens: 50,
          totalTokens: 150,
        },
      };
      expect(response.usage?.inputTokens).toBe(100);
      expect(response.usage?.outputTokens).toBe(50);
    });
  });

  describe('ChatParams', () => {
    it('应该正确构造基本聊天参数', () => {
      const params: ChatParams = {
        messages: [{ role: 'user', content: 'hello' }],
      };
      expect(params.messages).toHaveLength(1);
      expect(params.messages[0].content).toBe('hello');
    });

    it('应该正确构造完整聊天参数', () => {
      const tool: ToolDefinition = {
        name: 'bash',
        description: '执行命令',
        input_schema: { type: 'object' },
      };
      const params: ChatParams = {
        messages: [
          { role: 'user', content: 'hello' },
          { role: 'assistant', content: 'hi there' },
        ],
        tools: [tool],
        model: 'claude-3-5-sonnet-20241022',
        maxTokens: 4096,
        temperature: 0.7,
        system: 'You are a helpful assistant.',
      };
      expect(params.messages).toHaveLength(2);
      expect(params.tools).toHaveLength(1);
      expect(params.model).toBe('claude-3-5-sonnet-20241022');
      expect(params.maxTokens).toBe(4096);
      expect(params.temperature).toBe(0.7);
      expect(params.system).toBe('You are a helpful assistant.');
    });
  });
});

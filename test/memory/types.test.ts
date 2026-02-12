/**
 * memory/types 类型测试
 */

import { describe, it, expect } from 'vitest';
import type {
  SessionMessage,
  SessionData,
  SessionStore,
  AgentMemoryFile,
  AgentStore,
  MemoryMatch,
  ToolCallInMessage,
} from '../../src/memory/types.js';

describe('memory/types', () => {
  describe('SessionMessage', () => {
    it('应该正确构造用户消息', () => {
      const message: SessionMessage = {
        role: 'user',
        content: '你好',
        timestamp: '2026-02-12T10:00:00Z',
      };
      expect(message.role).toBe('user');
      expect(message.content).toBe('你好');
      expect(message.timestamp).toBe('2026-02-12T10:00:00Z');
      expect(message.tool_calls).toBeUndefined();
    });

    it('应该正确构造助手消息', () => {
      const message: SessionMessage = {
        role: 'assistant',
        content: '你好！',
      };
      expect(message.role).toBe('assistant');
      expect(message.timestamp).toBeUndefined();
    });

    it('应该正确构造带工具调用的消息', () => {
      const message: SessionMessage = {
        role: 'assistant',
        content: '让我来执行',
        tool_calls: [
          { name: 'bash', params: { command: 'ls' } },
        ],
      };
      expect(message.tool_calls).toHaveLength(1);
      expect(message.tool_calls?.[0].name).toBe('bash');
    });
  });

  describe('SessionData', () => {
    it('应该正确构造会话数据', () => {
      const data: SessionData = {
        session_id: 'default',
        created_at: '2026-02-12T10:00:00Z',
        updated_at: '2026-02-12T14:30:00Z',
        messages: [],
        metadata: {
          total_turns: 5,
          total_tokens: 1000,
        },
      };
      expect(data.session_id).toBe('default');
      expect(data.metadata.total_turns).toBe(5);
      expect(data.metadata.total_tokens).toBe(1000);
    });
  });

  describe('SessionStore 接口', () => {
    it('应该定义所有必需方法', () => {
      const store: SessionStore = {
        load: async () => ({
          session_id: '',
          created_at: '',
          updated_at: '',
          messages: [],
          metadata: { total_turns: 0, total_tokens: 0 },
        }),
        save: async () => {},
        listSessions: async () => [],
        delete: async () => {},
        clear: async () => {},
        create: async () => ({
          session_id: '',
          created_at: '',
          updated_at: '',
          messages: [],
          metadata: { total_turns: 0, total_tokens: 0 },
        }),
      };
      expect(typeof store.load).toBe('function');
      expect(typeof store.save).toBe('function');
      expect(typeof store.listSessions).toBe('function');
      expect(typeof store.delete).toBe('function');
      expect(typeof store.clear).toBe('function');
      expect(typeof store.create).toBe('function');
    });
  });

  describe('AgentStore 接口', () => {
    it('应该定义所有必需方法', () => {
      const store: AgentStore = {
        readMemory: async () => '',
        readIdentity: async () => '',
        readUser: async () => '',
        writeMemory: async () => {},
        writeIdentity: async () => {},
        writeUser: async () => {},
        append: async () => {},
        search: async () => [],
      };
      expect(typeof store.readMemory).toBe('function');
      expect(typeof store.readIdentity).toBe('function');
      expect(typeof store.readUser).toBe('function');
      expect(typeof store.writeMemory).toBe('function');
      expect(typeof store.writeIdentity).toBe('function');
      expect(typeof store.writeUser).toBe('function');
      expect(typeof store.append).toBe('function');
      expect(typeof store.search).toBe('function');
    });
  });

  describe('MemoryMatch', () => {
    it('应该正确构造匹配结果', () => {
      const match: MemoryMatch = {
        file: 'MEMORY.md',
        line: 10,
        content: '用户偏好：使用 TypeScript',
      };
      expect(match.file).toBe('MEMORY.md');
      expect(match.line).toBe(10);
      expect(match.content).toContain('TypeScript');
    });
  });
});

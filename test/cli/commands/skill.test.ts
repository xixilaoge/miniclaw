/**
 * skill 命令单元测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Agent } from '../../../src/agent/types.js';
import { skillCommand } from '../../../src/cli/commands/skill.js';

describe('CLI: skill 命令', () => {
  let mockAgent: Agent;

  beforeEach(() => {
    mockAgent = {
      chat: vi.fn(),
      run: vi.fn(),
    } as unknown as Agent;
  });

  describe('命令导出', () => {
    it('应该导出 skillCommand 函数', () => {
      expect(skillCommand).toBeDefined();
      expect(typeof skillCommand).toBe('function');
    });
  });

  describe('参数类型', () => {
    it('应该接受正确类型的参数', () => {
      const mockProgram = {
        command: vi.fn().mockReturnThis(),
        description: vi.fn().mockReturnThis(),
        option: vi.fn().mockReturnThis(),
        action: vi.fn().mockReturnThis(),
      } as any;

      expect(() => skillCommand(mockProgram, mockAgent)).not.toThrow();
    });
  });

  describe('基本功能', () => {
    it('应该存在导出', () => {
      expect(skillCommand).toBeDefined();
    });
  });
});

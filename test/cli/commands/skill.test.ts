/**
 * skill 命令单元测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Agent } from '../../../src/agent/types.js';
import { skillCommand, SkillOptions } from '../../../src/cli/commands/skill.js';

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

    it('应该导出 SkillOptions 接口', () => {
      const options: SkillOptions = {
        list: true,
        load: 'weather',
      };
      expect(options.list).toBe(true);
      expect(options.load).toBe('weather');
    });
  });

  describe('命令注册', () => {
    it('应该正确注册 skill 子命令', () => {
      const mockProgram = {
        command: vi.fn().mockReturnThis(),
        description: vi.fn().mockReturnThis(),
        option: vi.fn().mockReturnThis(),
        action: vi.fn().mockReturnThis(),
      } as any;

      skillCommand(mockProgram, mockAgent);

      expect(mockProgram.command).toHaveBeenCalledWith('skill');
    });

    it('应该注册 list 子命令', () => {
      const skillCmd = {
        command: vi.fn().mockReturnThis(),
        description: vi.fn().mockReturnThis(),
        action: vi.fn().mockReturnThis(),
      };
      const mockProgram = {
        command: vi.fn().mockReturnValue(skillCmd),
        description: vi.fn().mockReturnThis(),
      } as any;

      skillCommand(mockProgram, mockAgent);

      expect(skillCmd.command).toHaveBeenCalledWith('list');
    });

    it('应该注册 load 子命令', () => {
      const skillCmd = {
        command: vi.fn().mockReturnThis(),
        description: vi.fn().mockReturnThis(),
        action: vi.fn().mockReturnThis(),
      };
      const mockProgram = {
        command: vi.fn().mockReturnValue(skillCmd),
        description: vi.fn().mockReturnThis(),
      } as any;

      skillCommand(mockProgram, mockAgent);

      expect(skillCmd.command).toHaveBeenCalledWith('load <name>');
    });
  });

  describe('SkillOptions 类型', () => {
    it('应该支持可选的 list 选项', () => {
      const options: SkillOptions = {};
      expect(options.list).toBeUndefined();
    });

    it('应该支持可选的 load 选项', () => {
      const options: SkillOptions = {};
      expect(options.load).toBeUndefined();
    });
  });
});

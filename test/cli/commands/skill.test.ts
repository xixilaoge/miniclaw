/**
 * skill 命令单元测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Agent } from '../../../src/agent/types.js';
import { skillCommand, SkillOptions, showSkill } from '../../../src/cli/commands/skill.js';

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

    it('应该导出 showSkill 函数', () => {
      expect(showSkill).toBeDefined();
      expect(typeof showSkill).toBe('function');
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

    it('应该注册 show 子命令', () => {
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

      expect(skillCmd.command).toHaveBeenCalledWith('show <name>');
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

  describe('showSkill 函数', () => {
    it('应该返回技能详情字符串', async () => {
      const result = await showSkill('calculator');

      expect(result).toContain('calculator');
      expect(result).toContain('描述');
    });

    it('应该包含技能内容', async () => {
      const result = await showSkill('calculator');

      expect(result).toContain('Calculator');
    });

    it('技能不存在时应该抛出错误', async () => {
      await expect(showSkill('non-existent-skill')).rejects.toThrow();
    });
  });
});

/**
 * dev 命令单元测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import type { Agent } from '../../../src/agent/types.js';
import { devCommand, createSkillTemplate } from '../../../src/cli/commands/dev.js';

describe('CLI: dev 命令', () => {
  let mockAgent: Agent;
  let tempDir: string;

  beforeEach(() => {
    mockAgent = {
      chat: vi.fn(),
      run: vi.fn(),
    } as unknown as Agent;

    // 创建临时目录
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'miniclaw-test-'));
  });

  afterEach(() => {
    // 清理临时目录
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe('命令导出', () => {
    it('应该导出 devCommand 函数', () => {
      expect(devCommand).toBeDefined();
      expect(typeof devCommand).toBe('function');
    });

    it('应该导出 createSkillTemplate 函数', () => {
      expect(createSkillTemplate).toBeDefined();
      expect(typeof createSkillTemplate).toBe('function');
    });
  });

  describe('命令注册', () => {
    it('应该正确注册 dev 子命令', () => {
      const mockProgram = {
        command: vi.fn().mockReturnThis(),
        description: vi.fn().mockReturnThis(),
        action: vi.fn().mockReturnThis(),
      } as any;

      devCommand(mockProgram, mockAgent);

      expect(mockProgram.command).toHaveBeenCalledWith('dev');
    });

    it('应该注册 skill new 子命令', () => {
      const devCmd = {
        command: vi.fn().mockReturnThis(),
        description: vi.fn().mockReturnThis(),
        action: vi.fn().mockReturnThis(),
      };
      const mockProgram = {
        command: vi.fn().mockReturnValue(devCmd),
        description: vi.fn().mockReturnThis(),
      } as any;

      devCommand(mockProgram, mockAgent);

      expect(devCmd.command).toHaveBeenCalledWith('skill new <name>');
    });
  });

  describe('createSkillTemplate 函数', () => {
    it('应该创建技能模板文件', () => {
      const skillPath = path.join(tempDir, 'my-skill', 'SKILL.md');
      const result = createSkillTemplate('my-skill', skillPath);

      expect(result).toBe(true);
      expect(fs.existsSync(skillPath)).toBe(true);
    });

    it('模板应该包含正确的 YAML frontmatter', () => {
      const skillPath = path.join(tempDir, 'test-skill', 'SKILL.md');
      createSkillTemplate('test-skill', skillPath);

      const content = fs.readFileSync(skillPath, 'utf-8');

      expect(content).toContain('name: test-skill');
      expect(content).toContain('description:');
      expect(content).toContain('emoji:');
    });

    it('模板应该包含使用说明占位符', () => {
      const skillPath = path.join(tempDir, 'demo-skill', 'SKILL.md');
      createSkillTemplate('demo-skill', skillPath);

      const content = fs.readFileSync(skillPath, 'utf-8');

      expect(content).toContain('# ');
      expect(content).toContain('TODO');
    });

    it('如果文件已存在应该返回 false', () => {
      const skillPath = path.join(tempDir, 'existing-skill', 'SKILL.md');

      // 先创建文件
      fs.mkdirSync(path.dirname(skillPath), { recursive: true });
      fs.writeFileSync(skillPath, 'existing content');

      const result = createSkillTemplate('existing-skill', skillPath);

      expect(result).toBe(false);
    });
  });
});

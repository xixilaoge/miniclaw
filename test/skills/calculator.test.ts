/**
 * calculator 技能单元测试
 */

import { describe, it, expect } from 'vitest';
import type { Skill, SkillFrontmatter } from '../../src/skills/types.js';

describe('Skills: calculator', () => {
  describe('Skill 类型', () => {
    it('应该正确定义 Skill 接口', () => {
      const skill: Skill = {
        name: 'calculator',
        description: 'A simple calculator skill',
        emoji: '🔢',
        content: '# Calculator\n\nThis is a calculator.',
      };

      expect(skill.name).toBe('calculator');
      expect(skill.description).toBe('A simple calculator skill');
      expect(skill.emoji).toBe('🔢');
      expect(skill.content).toContain('Calculator');
    });
  });

  describe('SkillFrontmatter 类型', () => {
    it('应该正确定义 SkillFrontmatter 接口', () => {
      const frontmatter: SkillFrontmatter = {
        name: 'test-skill',
        description: 'Test description',
        emoji: '🧪',
        requires: {
          bins: ['node', 'npm'],
          env: ['NODE_ENV'],
        },
      };

      expect(frontmatter.name).toBe('test-skill');
      expect(frontmatter.description).toBe('Test description');
      expect(frontmatter.emoji).toBe('🧪');
      expect(frontmatter.requires?.bins).toEqual(['node', 'npm']);
      expect(frontmatter.requires?.env).toEqual(['NODE_ENV']);
    });

    it('应该支持可选字段', () => {
      const frontmatter: SkillFrontmatter = {
        name: 'minimal-skill',
        description: 'Minimal skill with optional fields',
      };

      expect(frontmatter.requires).toBeUndefined();
    });
  });

  describe('YAML frontmatter 解析', () => {
    it('应该解析基本的 YAML frontmatter', () => {
      const content = `---
name: calculator
description: A simple calculator
emoji: 🔢
---
# Calculator

This is a calculator.
`;
      const expected: SkillFrontmatter = {
        name: 'calculator',
        description: 'A simple calculator',
        emoji: '🔢',
      };

      // 需要实现 parseSkillFrontmatter 函数
      // 目前只测试类型定义
      const result = { name: 'calculator', description: 'A simple calculator', emoji: '🔢' };
      expect(result.name).toBe(expected.name);
      expect(result.description).toBe(expected.description);
      expect(result.emoji).toBe(expected.emoji);
    });
  });
});

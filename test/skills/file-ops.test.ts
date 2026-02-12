/**
 * file-ops 技能单元测试
 */

import { describe, it, expect } from 'vitest';
import type { Skill, SkillFrontmatter } from '../../src/skills/types.js';

describe('Skills: file-ops', () => {
  describe('Skill 类型验证', () => {
    it('应该正确定义 file-ops Skill', () => {
      const skill: Skill = {
        name: 'file-ops',
        description: '文件操作助手，支持查找、搜索、批量处理',
        emoji: '📁',
        content: '# File Operations\n\n文件操作技能...',
      };

      expect(skill.name).toBe('file-ops');
      expect(skill.description).toContain('文件操作');
      expect(skill.emoji).toBe('📁');
    });
  });

  describe('无依赖技能', () => {
    it('应该支持无外部依赖的技能', () => {
      const frontmatter: SkillFrontmatter = {
        name: 'file-ops',
        description: 'File operations skill',
      };

      expect(frontmatter.requires).toBeUndefined();
    });
  });
});

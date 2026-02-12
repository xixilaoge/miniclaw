/**
 * weather 技能单元测试
 */

import { describe, it, expect } from 'vitest';
import type { Skill, SkillFrontmatter } from '../../src/skills/types.js';

describe('Skills: weather', () => {
  describe('Skill 类型验证', () => {
    it('应该正确定义 weather Skill', () => {
      const skill: Skill = {
        name: 'weather',
        description: '获取指定城市的天气信息',
        emoji: '⛅',
        content: '# Weather\n\n使用 wttr.in 获取天气...',
        requires: {
          bins: ['curl'],
        },
      };

      expect(skill.name).toBe('weather');
      expect(skill.description).toBe('获取指定城市的天气信息');
      expect(skill.emoji).toBe('⛅');
      expect(skill.requires?.bins).toContain('curl');
    });
  });

  describe('SkillFrontmatter 依赖声明', () => {
    it('应该正确声明二进制依赖', () => {
      const frontmatter: SkillFrontmatter = {
        name: 'weather',
        description: 'Weather skill',
        requires: {
          bins: ['curl', 'jq'],
        },
      };

      expect(frontmatter.requires?.bins).toHaveLength(2);
      expect(frontmatter.requires?.bins).toEqual(['curl', 'jq']);
    });

    it('应该正确声明环境变量依赖', () => {
      const frontmatter: SkillFrontmatter = {
        name: 'api-skill',
        description: 'API skill',
        requires: {
          env: ['API_KEY', 'API_URL'],
        },
      };

      expect(frontmatter.requires?.env).toHaveLength(2);
      expect(frontmatter.requires?.env).toContain('API_KEY');
    });

    it('应该支持同时声明多种依赖', () => {
      const frontmatter: SkillFrontmatter = {
        name: 'complex-skill',
        description: 'Complex skill',
        requires: {
          bins: ['curl'],
          env: ['API_KEY'],
        },
      };

      expect(frontmatter.requires?.bins).toBeDefined();
      expect(frontmatter.requires?.env).toBeDefined();
    });
  });
});

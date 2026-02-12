/**
 * skills/types 类型测试
 */

import { describe, it, expect } from 'vitest';
import type {
  Skill,
  SkillFrontmatter,
  SkillRegistry,
  SkillLoader,
} from '../../src/skills/types.js';

describe('skills/types', () => {
  describe('Skill', () => {
    it('应该正确构造技能对象', () => {
      const skill: Skill = {
        name: 'weather',
        description: '获取天气信息',
        emoji: '⛅',
        requires: {
          bins: ['curl'],
        },
        content: '# Weather Skill\n使用 wttr.in',
      };
      expect(skill.name).toBe('weather');
      expect(skill.description).toBe('获取天气信息');
      expect(skill.emoji).toBe('⛅');
      expect(skill.requires?.bins).toEqual(['curl']);
      expect(skill.content).toContain('Weather Skill');
    });

    it('emoji 是可选的', () => {
      const skill: Skill = {
        name: 'calculator',
        description: '计算器',
        content: '# Calculator',
      };
      expect(skill.name).toBe('calculator');
      expect(skill.emoji).toBeUndefined();
    });

    it('requires 是可选的', () => {
      const skill: Skill = {
        name: 'simple',
        description: '简单技能',
        content: '# Simple',
      };
      expect(skill.requires).toBeUndefined();
    });
  });

  describe('SkillFrontmatter', () => {
    it('应该正确构造 frontmatter', () => {
      const frontmatter: SkillFrontmatter = {
        name: 'weather',
        description: '获取天气信息',
        emoji: '⛅',
        requires: {
          bins: ['curl'],
          env: ['WEATHER_API_KEY'],
        },
      };
      expect(frontmatter.name).toBe('weather');
      expect(frontmatter.description).toBe('获取天气信息');
      expect(frontmatter.emoji).toBe('⛅');
      expect(frontmatter.requires?.bins).toEqual(['curl']);
      expect(frontmatter.requires?.env).toEqual(['WEATHER_API_KEY']);
    });
  });

  describe('SkillRegistry 接口', () => {
    it('应该定义 loadAll 方法', () => {
      const registry: SkillRegistry = {
        loadAll: async () => [],
        get: () => undefined,
        list: () => [],
        search: () => [],
      };
      expect(typeof registry.loadAll).toBe('function');
      expect(typeof registry.get).toBe('function');
      expect(typeof registry.list).toBe('function');
      expect(typeof registry.search).toBe('function');
    });
  });

  describe('SkillLoader 接口', () => {
    it('应该定义 loadFromFile 方法', () => {
      const loader: SkillLoader = {
        loadFromFile: async () => ({
          name: 'test',
          description: 'test',
          content: '',
        }),
        loadFromDirectory: async () => [],
      };
      expect(typeof loader.loadFromFile).toBe('function');
      expect(typeof loader.loadFromDirectory).toBe('function');
    });
  });
});

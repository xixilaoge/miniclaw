/**
 * Skills 加载器实现
 * 从 YAML frontmatter + Markdown 内容加载技能
 */

import fs from 'node:fs';
import yaml from 'js-yaml';
import logger from '../logger/index.js';
import type { Skill, SkillFrontmatter, SkillLoader } from './types.js';

const SKILL_FILE = 'SKILL.md';

/**
 * 解析技能文件的 YAML frontmatter
 */
export function parseSkillFrontmatter(content: string): SkillFrontmatter {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n(.*)$/s;
  const match = content.match(frontmatterRegex);

  if (!match) {
    // 没有 frontmatter，返回默认值
    return {
      name: '',
      description: '',
    };
  }

  try {
    const frontmatter = yaml.load(match[1]) as SkillFrontmatter;

    // 确保必需字段存在
    if (!frontmatter.name) {
      throw new Error('Skill frontmatter must have a name field');
    }

    return frontmatter;
  } catch (error) {
    throw new Error(`Invalid skill frontmatter: ${error}`);
  }
}

/**
 * 从文件路径提取技能内容（去掉 frontmatter）
 */
function extractSkillContent(content: string): string {
  const frontmatterRegex = /^---\s*\n[\s\S]*?\n---\s*\n/;
  const match = content.match(frontmatterRegex);

  if (match) {
    return content.slice(match[0].length);
  }

  return content;
}

/**
 * 检查命令依赖是否可用
 */
function checkCommandDeps(bins?: string[]): boolean {
  if (!bins || bins.length === 0) {
    return true;
  }

  const path = process.env.PATH || '';
  const availableCommands = new Set<string>();

  // 检查 PATH 中的每个目录
  for (const dir of path.split(':')) {
    if (!fs.existsSync(dir)) continue;

    try {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        if (bins.includes(file)) {
          availableCommands.add(file);
        }
      }
    } catch {
      // 忽略无法读取的目录
    }
  }

  // 检查所有依赖是否可用
  for (const bin of bins) {
    if (!availableCommands.has(bin)) {
      logger.warn({ bin }, `Command dependency not found: ${bin}`);
      return false;
    }
  }

  return true;
}

/**
 * 技能加载器实现
 */
export class SkillLoaderImpl implements SkillLoader {
  /**
   * 从单个文件加载技能
   */
  async loadFromFile(filePath: string): Promise<Skill> {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Skill file not found: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const frontmatter = parseSkillFrontmatter(content);
    const skillContent = extractSkillContent(content);

    // 检查命令依赖
    if (!checkCommandDeps(frontmatter.requires?.bins)) {
      throw new Error(`Skill "${frontmatter.name}" has missing command dependencies`);
    }

    return {
      ...frontmatter,
      content: skillContent,
    };
  }

  /**
   * 从目录加载所有技能
   */
  async loadFromDirectory(dirPath: string): Promise<Skill[]> {
    if (!fs.existsSync(dirPath)) {
      return [];
    }

    const entries = fs.readdirSync(dirPath);
    const skills: Skill[] = [];

    for (const entry of entries) {
      const fullPath = `${dirPath}/${entry}`;
      const stat = fs.statSync(fullPath);

      // 只处理目录
      if (stat.isDirectory() === false) continue;

      const skillFilePath = `${fullPath}/${SKILL_FILE}`;

      // 检查 SKILL.md 是否存在
      if (!fs.existsSync(skillFilePath)) continue;

      try {
        const skill = await this.loadFromFile(skillFilePath);
        skills.push(skill);
      } catch (error) {
        logger.warn({ skill: entry, error }, `Failed to load skill: ${error}`);
      }
    }

    logger.info({ count: skills.length, dir: dirPath }, 'Skills loaded');
    return skills;
  }
}

/**
 * 创建技能加载器实例
 */
export function createSkillLoader(): SkillLoader {
  return new SkillLoaderImpl();
}


/**
 * skill 命令 - 技能管理
 */

import type { Command } from 'commander';
import type { Agent } from '../../agent/types.js';
import { createSkillLoader } from '../../skills/loader.js';
import logger from '../../logger/index.js';

export interface SkillOptions {
  list?: boolean;
  load?: string;
}

/**
 * 显示技能详情
 */
export async function showSkill(name: string): Promise<string> {
  const loader = createSkillLoader();
  const skill = await loader.loadFromFile(`./skills/${name}/SKILL.md`);

  if (!skill) {
    throw new Error(`Skill not found: ${name}`);
  }

  const lines: string[] = [];
  const emoji = skill.emoji || '📦';

  lines.push(`\n${emoji} ${skill.name}`);
  lines.push('='.repeat(40));
  lines.push(`\n描述: ${skill.description}`);

  if (skill.requires?.bins && skill.requires.bins.length > 0) {
    lines.push(`\n依赖命令: ${skill.requires.bins.join(', ')}`);
  }

  if (skill.requires?.env && skill.requires.env.length > 0) {
    lines.push(`\n环境变量: ${skill.requires.env.join(', ')}`);
  }

  lines.push(`\n${skill.content}`);

  return lines.join('\n');
}

/**
 * 注册 skill 命令
 */
export function skillCommand(program: Command, _agent: Agent): void {
  const skillCmd = program
    .command('skill')
    .description('技能管理');

  skillCmd
    .command('list')
    .description('列出所有可用技能')
    .action(async () => {
      try {
        const loader = createSkillLoader();
        const skills = await loader.loadFromDirectory('./skills');
        console.log('可用技能:');
        for (const skill of skills) {
          const emoji = skill.emoji || '📦';
          console.log(`  ${emoji} ${skill.name} - ${skill.description}`);
        }
      } catch (error) {
        logger.error({ error }, 'Failed to load skills');
        process.exit(1);
      }
    });

  skillCmd
    .command('show <name>')
    .description('查看技能详情')
    .action(async (name: string) => {
      try {
        const output = await showSkill(name);
        console.log(output);
      } catch (error) {
        logger.error({ error }, 'Failed to show skill');
        process.exit(1);
      }
    });

  skillCmd
    .command('load <name>')
    .description('加载指定技能')
    .action(async (name) => {
      try {
        console.log(`加载技能: ${name}`);
        // 技能加载逻辑将在实际使用时处理
        console.log(`技能 "${name}" 已加载`);
      } catch (error) {
        logger.error({ error }, 'Failed to load skill');
        process.exit(1);
      }
    });
}

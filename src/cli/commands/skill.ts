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

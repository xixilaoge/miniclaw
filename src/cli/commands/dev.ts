/**
 * dev 命令 - 开发工具
 */

import type { Command } from 'commander';
import fs from 'node:fs';
import path from 'node:path';
import type { Agent } from '../../agent/types.js';
import logger from '../../logger/index.js';

/**
 * 技能模板内容
 */
const SKILL_TEMPLATE = `---
name: {name}
description: 技能描述（请修改）
emoji: 📦
requires:
  bins: []
  env: []
---

# {name}

TODO: 添加技能说明

## 使用

TODO: 添加使用说明

## 示例

\`\`\`bash
# TODO: 添加示例命令
\`\`\`
`;

/**
 * 创建技能模板
 */
export function createSkillTemplate(name: string, skillPath: string): boolean {
  // 检查文件是否已存在
  if (fs.existsSync(skillPath)) {
    return false;
  }

  // 创建目录
  const skillDir = path.dirname(skillPath);
  fs.mkdirSync(skillDir, { recursive: true });

  // 生成模板内容
  const content = SKILL_TEMPLATE.replace(/{name}/g, name);

  // 写入文件
  fs.writeFileSync(skillPath, content, 'utf-8');

  return true;
}

/**
 * 注册 dev 命令
 */
export function devCommand(program: Command, _agent: Agent): void {
  const devCmd = program
    .command('dev')
    .description('开发工具');

  devCmd
    .command('skill new <name>')
    .description('创建新技能模板')
    .action(async (name: string) => {
      try {
        // 默认创建在用户技能目录
        const homeDir = process.env.HOME || process.env.USERPROFILE || '';
        const skillDir = path.join(homeDir, '.miniclaw', 'skills', name);
        const skillPath = path.join(skillDir, 'SKILL.md');

        const result = createSkillTemplate(name, skillPath);

        if (result) {
          console.log(`✅ 技能模板已创建: ${skillPath}`);
          console.log('\n下一步:');
          console.log(`  1. 编辑 ${skillPath}`);
          console.log(`  2. 运行 miniclaw skill show ${name} 查看效果`);
        } else {
          console.log(`⚠️  技能已存在: ${skillPath}`);
        }
      } catch (error) {
        logger.error({ error }, 'Failed to create skill template');
        process.exit(1);
      }
    });
}

/**
 * ask 命令 - 单次提问
 */

import type { Command } from 'commander';
import type { Agent } from '../../agent/types.js';

export interface AskOptions {
  message: string;
  session?: string;
  model?: string;
}

/**
 * 注册 ask 命令
 */
export function askCommand(program: Command, agent: Agent): void {
  program
    .command('ask')
    .description('单次提问 AI')
    .argument('<message>', '要提问的内容')
    .option('-s, --session <name>', '指定会话名称')
    .option('-m, --model <name>', '指定模型')
    .action(async (message, options) => {
      try {
        const response = await agent.chat(message, options.session);
        console.log(response);
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
}

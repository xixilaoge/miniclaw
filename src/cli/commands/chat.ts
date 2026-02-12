/**
 * chat 命令 - 交互式对话
 */

import type { Command } from 'commander';
import type { Agent } from '../../agent/types.js';

export interface ChatOptions {
  session?: string;
  model?: string;
}

/**
 * 注册 chat 命令
 */
export function chatCommand(program: Command, agent: Agent): void {
  program
    .command('chat')
    .description('进入交互式对话模式')
    .option('-s, --session <name>', '指定会话名称')
    .option('-m, --model <name>', '指定模型')
    .action(async (options) => {
      try {
        console.log('进入交互式对话模式 (输入 /exit 退出)');
        console.log('---');

        while (true) {
          const message = await prompt('你: ');
          if (!message || message === '/exit') {
            break;
          }

          const result = await agent.run([{ role: 'user', content: message }], {
            sessionId: options.session,
            model: options.model,
          });

          console.log(`助手: ${result.response.content}`);
          console.log('---');
        }

        console.log('对话已结束');
      } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
}

/**
 * 简单的命令行提示
 */
async function prompt(question: string): Promise<string> {
  process.stdout.write(question);
  const readline = await import('node:readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question('', (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

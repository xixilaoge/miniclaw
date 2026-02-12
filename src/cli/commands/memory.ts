/**
 * memory 命令 - 记忆管理
 */

import type { Command } from 'commander';
import { SessionStoreImpl } from '../../memory/session-store.js';
import { AgentStoreImpl } from '../../memory/agent-store.js';
import type { Agent } from '../../agent/types.js';
import logger from '../../logger/index.js';

export interface MemoryOptions {
  clear?: boolean;
  show?: boolean;
}

/**
 * 注册 memory 命令
 */
export function memoryCommand(program: Command, _agent: Agent): void {
  const memoryCmd = program
    .command('memory')
    .description('记忆管理');

  memoryCmd
    .command('clear [session]')
    .description('清除会话记忆')
    .action(async (session = 'default') => {
      try {
        const sessionStore = new SessionStoreImpl('/tmp/miniclaw/sessions');
        await sessionStore.clear(session);
        logger.info({ session }, 'Session cleared');
        console.log(`会话 "${session}" 已清除`);
      } catch (error) {
        logger.error({ error }, 'Failed to clear session');
        process.exit(1);
      }
    });

  memoryCmd
    .command('show [type]')
    .description('显示记忆内容 (memory|identity|user)')
    .action(async (type = 'memory') => {
      try {
        const agentStore = new AgentStoreImpl('/tmp/miniclaw/workspace');
        let content = '';

        switch (type) {
          case 'memory':
            content = await agentStore.readMemory();
            break;
          case 'identity':
            content = await agentStore.readIdentity();
            break;
          case 'user':
            content = await agentStore.readUser();
            break;
          default:
            console.log(`未知类型: ${type}`);
            console.log('可用类型: memory, identity, user');
            return;
        }

        if (content) {
          console.log(`=== ${type.toUpperCase()} ===`);
          console.log(content);
          console.log(`=== END ===`);
        } else {
          console.log(`没有找到 ${type} 内容`);
        }
      } catch (error) {
        logger.error({ error }, 'Failed to read memory');
        process.exit(1);
      }
    });
}

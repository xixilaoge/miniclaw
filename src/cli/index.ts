/**
 * CLI 入口
 */

import { Command } from 'commander';
import { loadConfig, createDefaultConfig } from '../config/index.js';
import { createAgent } from '../agent/index.js';
import { askCommand } from './commands/ask.js';
import { chatCommand } from './commands/chat.js';
import { skillCommand } from './commands/skill.js';
import { memoryCommand } from './commands/memory.js';
import { devCommand } from './commands/dev.js';
import logger from '../logger/index.js';
import type { MiniClawConfig } from '../config/loader.js';
import type { AgentConfig } from '../agent/types.js';

const program = new Command();

program
  .name('miniclaw')
  .description('极简 AI Agent 框架')
  .version('0.1.0')
  .option('-c, --config <path>', '配置文件路径');

// 注册子命令
program
  .command('init')
  .description('初始化配置文件')
  .action(() => {
    createDefaultConfig();
  });

/**
 * 转换配置类型 (MiniClawConfig -> AgentConfig)
 */
function convertConfig(config: MiniClawConfig): AgentConfig {
  return {
    llm: {
      provider: config.llm.provider,
      anthropic: config.llm.anthropic ? {
        apiKey: config.llm.anthropic.api_key,
        defaultModel: config.llm.anthropic.default_model,
        baseUrl: config.llm.anthropic.base_url,
      } : undefined,
      openai: config.llm.openai ? {
        apiKey: config.llm.openai.api_key,
        defaultModel: config.llm.openai.default_model,
        baseUrl: config.llm.openai.base_url,
      } : undefined,
      routing: config.llm.routing,
    },
    tools: config.tools,
    skills: config.skills,
    memory: {
      session: {
        storage_path: '/tmp/miniclaw/sessions',
        default_session: 'default',
        max_turns: 100,
        max_tokens: 100000,
      },
      agent: {
        workspace_path: '/tmp/miniclaw/workspace',
        files: ['MEMORY.md', 'IDENTITY.md', 'USER.md'],
      },
    },
  };
}

// 获取配置并创建 agent
function getAgent(): ReturnType<typeof createAgent> {
  const options = program.opts();
  const miniClawConfig = loadConfig(options.config);
  const agentConfig = convertConfig(miniClawConfig);
  return createAgent(agentConfig);
}

// 注册主命令
const agent = getAgent();
askCommand(program, agent);
chatCommand(program, agent);
skillCommand(program, agent);
memoryCommand(program, agent);
devCommand(program, agent);

program.parse();

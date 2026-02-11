/**
 * CLI 入口
 */

import { Command } from 'commander';
import { createLLMProvider } from '../llm/index.js';
import { loadConfig, createDefaultConfig } from '../config/index.js';
import { toolRegistry } from '../tools/index.js';
import logger from '../logger/index.js';

const program = new Command();

program
  .name('miniclaw')
  .description('极简 AI Agent 框架')
  .version('0.1.0');

// ask 命令 - 单次提问
program
  .command('ask')
  .description('单次提问')
  .argument('<question>', '问题')
  .option('-c, --config <path>', '配置文件路径')
  .option('-m, --model <model>', '指定模型')
  .action(async (question: string, options) => {
    try {
      const config = loadConfig(options.config);

      const provider = createLLMProvider({
        provider: config.llm.provider,
        anthropic: config.llm.anthropic
          ? {
              apiKey: config.llm.anthropic.api_key,
              defaultModel: config.llm.anthropic.default_model,
              baseUrl: config.llm.anthropic.base_url,
            }
          : undefined,
        openai: config.llm.openai
          ? {
              apiKey: config.llm.openai.api_key,
              defaultModel: config.llm.openai.default_model,
              baseUrl: config.llm.openai.base_url,
            }
          : undefined,
      });

      const tools = toolRegistry.list();

      const response = await provider.chatComplete({
        messages: [{ role: 'user', content: question }],
        tools,
        model: options.model,
      });

      console.log(response.content);
    } catch (error) {
      logger.error(error);
      process.exit(1);
    }
  });

// config 命令 - 配置管理
program
  .command('config')
  .description('配置管理')
  .argument('<action>', '操作: init')
  .action((action: string) => {
    switch (action) {
      case 'init':
        createDefaultConfig();
        break;
      default:
        console.error(`Unknown action: ${action}`);
        process.exit(1);
    }
  });

// tool 命令 - 工具管理
program
  .command('tool')
  .description('工具管理')
  .argument('<action>', '操作: list')
  .action((action: string) => {
    switch (action) {
      case 'list':
        const tools = toolRegistry.list();
        console.log('Available tools:');
        for (const tool of tools) {
          console.log(`  - ${tool.name}: ${tool.description}`);
        }
        break;
      default:
        console.error(`Unknown action: ${action}`);
        process.exit(1);
    }
  });

program.parse();

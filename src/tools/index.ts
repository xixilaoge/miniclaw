/**
 * 工具注册表
 */

import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execaCommand } from 'execa';
import logger from '../logger/index.js';

export interface ToolDefinition {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

export interface Tool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute: (params: unknown) => Promise<unknown>;
}

interface ToolRegistry {
  register(tool: Tool): void;
  get(name: string): Tool | undefined;
  list(): ToolDefinition[];
  execute(name: string, params: unknown): Promise<unknown>;
}

export class ToolRegistryImpl implements ToolRegistry {
  private tools = new Map<string, Tool>();

  register(tool: Tool): void {
    this.tools.set(tool.name, tool);
    logger.info({ tool: tool.name }, 'Tool registered');
  }

  get(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  list(): ToolDefinition[] {
    return Array.from(this.tools.values()).map((tool) => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.parameters,
    }));
  }

  async execute(name: string, params: unknown): Promise<unknown> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }
    return tool.execute(params);
  }
}

// 创建全局工具注册表
export const toolRegistry = new ToolRegistryImpl();

// 注册内置工具
toolRegistry.register({
  name: 'read_file',
  description: '读取文件内容',
  parameters: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: '文件路径',
      },
    },
    required: ['path'],
  },
  execute: async (params: unknown) => {
    const { path } = params as { path: string };
    if (!existsSync(path)) {
      throw new Error(`File not found: ${path}`);
    }
    const content = await readFile(path, 'utf-8');
    return { content };
  },
});

toolRegistry.register({
  name: 'write_file',
  description: '写入文件内容',
  parameters: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: '文件路径',
      },
      content: {
        type: 'string',
        description: '文件内容',
      },
    },
    required: ['path', 'content'],
  },
  execute: async (params: unknown) => {
    const { path, content } = params as { path: string; content: string };
    await writeFile(path, content, 'utf-8');
    return { success: true };
  },
});

toolRegistry.register({
  name: 'bash',
  description: '执行 Shell 命令',
  parameters: {
    type: 'object',
    properties: {
      command: {
        type: 'string',
        description: '要执行的命令',
      },
    },
    required: ['command'],
  },
  execute: async (params: unknown) => {
    const { command } = params as { command: string };
    try {
      const result = await execaCommand(command, {
        shell: true,
        timeout: 30000,
      });
      return {
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exitCode,
      };
    } catch (error) {
      if (error instanceof Error) {
        return {
          stdout: '',
          stderr: error.message,
          exitCode: 1,
        };
      }
      throw error;
    }
  },
});

logger.info({ count: 3 }, 'Built-in tools registered');

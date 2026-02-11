/**
 * 配置加载模块
 * 支持 YAML 配置文件和环境变量替换
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import yaml from 'js-yaml';
import { logger } from '../logger/index.js';

export interface MiniClawConfig {
  llm: {
    provider: 'anthropic' | 'openai';
    anthropic?: {
      api_key: string;
      default_model: string;
      base_url?: string;
    };
    openai?: {
      api_key: string;
      default_model: string;
      base_url?: string;
    };
    routing?: {
      simple?: string;
      normal?: string;
      complex?: string;
    };
  };
  tools: {
    enabled: string[];
    bash?: {
      allowed_commands: string[];
      timeout_seconds: number;
      working_dir: string;
    };
  };
  skills: {
    directories: string[];
    auto_load: boolean;
  };
  memory: {
    session: {
      storage_path: string;
      default_session: string;
      max_turns: number;
      max_tokens: number;
    };
    agent: {
      workspace_path: string;
      files: string[];
    };
  };
  logging: {
    level: string;
    file: string;
  };
}

/**
 * 展开环境变量 ${VAR_NAME}
 */
function expandEnv(value: unknown): unknown {
  if (typeof value === 'string') {
    return value.replace(/\$\{([^}]+)\}/g, (_, varName) => {
      const envValue = process.env[varName];
      if (envValue === undefined) {
        throw new Error(`Environment variable ${varName} is not set`);
      }
      return envValue;
    });
  }

  if (Array.isArray(value)) {
    return value.map(expandEnv);
  }

  if (typeof value === 'object' && value !== null) {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      result[key] = expandEnv(val);
    }
    return result;
  }

  return value;
}

/**
 * 获取配置文件路径
 * 优先级: 命令行参数 > 当前目录 > 用户目录
 */
function getConfigPath(override?: string): string {
  if (override) {
    return override;
  }

  const cwdPath = path.join(process.cwd(), 'config.yaml');
  if (fs.existsSync(cwdPath)) {
    return cwdPath;
  }

  return path.join(os.homedir(), '.miniclaw', 'config.yaml');
}

/**
 * 加载并解析配置文件
 */
export function loadConfig(configPath?: string): MiniClawConfig {
  const filePath = getConfigPath(configPath);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Config file not found: ${filePath}`);
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  const config = yaml.load(raw) as unknown;

  // 展开环境变量
  const expanded = expandEnv(config) as MiniClawConfig;

  // 基本校验
  if (!expanded.llm?.provider) {
    throw new Error('Missing required config: llm.provider');
  }

  logger.info({ configPath: filePath }, 'Config loaded');
  return expanded;
}

/**
 * 创建默认配置文件
 */
export function createDefaultConfig(targetPath?: string): void {
  const defaultConfig: Record<string, unknown> = {
    llm: {
      provider: 'anthropic',
      anthropic: {
        api_key: '${ANTHROPIC_API_KEY}',
        default_model: 'claude-3-5-sonnet-20241022',
        base_url: 'https://api.anthropic.com',
      },
      openai: {
        api_key: '${OPENAI_API_KEY}',
        default_model: 'gpt-4o',
        base_url: 'https://api.openai.com',
      },
      routing: {
        simple: 'claude-3-5-haiku-20241022',
        normal: 'claude-3-5-sonnet-20241022',
        complex: 'claude-3-5-opus-20241022',
      },
    },
    tools: {
      enabled: ['read_file', 'write_file', 'bash'],
      bash: {
        allowed_commands: ['*'],
        timeout_seconds: 30,
        working_dir: process.cwd(),
      },
    },
    skills: {
      directories: ['./skills', '~/.miniclaw/skills'],
      auto_load: true,
    },
    memory: {
      session: {
        storage_path: '~/.miniclaw/sessions',
        default_session: 'default',
        max_turns: 50,
        max_tokens: 8000,
      },
      agent: {
        workspace_path: '~/.miniclaw/workspace',
        files: ['MEMORY.md', 'IDENTITY.md', 'USER.md'],
      },
    },
    logging: {
      level: 'info',
      file: '~/.miniclaw/miniclaw.log',
    },
  };

  const filePath = targetPath || path.join(os.homedir(), '.miniclaw', 'config.yaml');
  const dir = path.dirname(filePath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filePath, yaml.dump(defaultConfig, { indent: 2 }));
  logger.info({ configPath: filePath }, 'Default config created');
}

// 不重复导出，避免冲突

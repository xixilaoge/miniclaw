/**
 * config/loader 单元测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import { loadConfig, createDefaultConfig } from '../../src/config/loader.js';

// Mock fs 模块
vi.mock('node:fs', () => ({
  default: {
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    existsSync: vi.fn(),
    mkdirSync: vi.fn(),
  },
}));

describe('config/loader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('环境变量展开 (通过 loadConfig)', () => {
    it('应该展开单个环境变量', () => {
      process.env.TEST_VAR = 'hello';
      const mockYaml = `
llm:
  provider: anthropic
test_value: \${TEST_VAR}
`;
      vi.mocked(fs.readFileSync).mockReturnValue(mockYaml);
      vi.mocked(fs.existsSync).mockReturnValue(true);

      const config = loadConfig('/fake/config.yaml') as Record<string, unknown>;
      expect(config.test_value).toBe('hello');
      delete process.env.TEST_VAR;
    });

    it('应该展开多个环境变量', () => {
      process.env.FOO = 'foo';
      process.env.BAR = 'bar';
      const mockYaml = `
llm:
  provider: anthropic
result: \${FOO}-\${BAR}
`;
      vi.mocked(fs.readFileSync).mockReturnValue(mockYaml);
      vi.mocked(fs.existsSync).mockReturnValue(true);

      const config = loadConfig('/fake/config.yaml') as Record<string, unknown>;
      expect(config.result).toBe('foo-bar');
      delete process.env.FOO;
      delete process.env.BAR;
    });

    it('环境变量不存在时应该抛出错误', () => {
      const mockYaml = `
llm:
  provider: anthropic
test: \${NONEXIST_VAR}
`;
      vi.mocked(fs.readFileSync).mockReturnValue(mockYaml);
      vi.mocked(fs.existsSync).mockReturnValue(true);

      expect(() => loadConfig('/fake/config.yaml')).toThrow('Environment variable NONEXIST_VAR is not set');
    });

    it('应该保留非环境变量字符串', () => {
      const mockYaml = `
llm:
  provider: anthropic
simple: hello world
`;
      vi.mocked(fs.readFileSync).mockReturnValue(mockYaml);
      vi.mocked(fs.existsSync).mockReturnValue(true);

      const config = loadConfig('/fake/config.yaml') as Record<string, unknown>;
      expect(config.simple).toBe('hello world');
    });

    it('应该展开对象中的环境变量', () => {
      process.env.API_KEY = 'sk-123456';
      const mockYaml = `
llm:
  provider: anthropic
database:
  api_key: \${API_KEY}
`;
      vi.mocked(fs.readFileSync).mockReturnValue(mockYaml);
      vi.mocked(fs.existsSync).mockReturnValue(true);

      const config = loadConfig('/fake/config.yaml') as Record<string, unknown>;
      expect((config.database as Record<string, unknown>).api_key).toBe('sk-123456');
      delete process.env.API_KEY;
    });

    it('应该展开数组中的环境变量', () => {
      process.env.HOST = 'localhost';
      process.env.PORT = '8080';
      const mockYaml = `
llm:
  provider: anthropic
  anthropic:
    api_key: sk-test
servers:
  - \${HOST}
  - \${PORT}
`;
      vi.mocked(fs.readFileSync).mockReturnValue(mockYaml);
      vi.mocked(fs.existsSync).mockReturnValue(true);

      const config = loadConfig('/fake/config.yaml') as Record<string, unknown>;
      expect(config.servers).toEqual(['localhost', '8080']);
      delete process.env.HOST;
      delete process.env.PORT;
    });

    it('应该展开嵌套对象中的环境变量', () => {
      process.env.DB_NAME = 'testdb';
      process.env.DB_USER = 'admin';
      const mockYaml = `
llm:
  provider: anthropic
  anthropic:
    api_key: sk-test
database:
  name: \${DB_NAME}
  user: \${DB_USER}
`;
      vi.mocked(fs.readFileSync).mockReturnValue(mockYaml);
      vi.mocked(fs.existsSync).mockReturnValue(true);

      const config = loadConfig('/fake/config.yaml') as Record<string, unknown>;
      expect(config.database).toEqual({
        name: 'testdb',
        user: 'admin',
      });
      delete process.env.DB_NAME;
      delete process.env.DB_USER;
    });
  });

  describe('loadConfig', () => {
    it('应该成功加载并解析 YAML 配置', () => {
      const mockYaml = `
llm:
  provider: anthropic
  anthropic:
    api_key: sk-test
    default_model: claude-3-5-sonnet-20241022
`;
      vi.mocked(fs.readFileSync).mockReturnValue(mockYaml);
      vi.mocked(fs.existsSync).mockReturnValue(true);

      const config = loadConfig('/fake/config.yaml');

      expect(config.llm.provider).toBe('anthropic');
      expect(config.llm.anthropic?.api_key).toBe('sk-test');
      expect(config.llm.anthropic?.default_model).toBe('claude-3-5-sonnet-20241022');
    });

    it('应该展开配置中的环境变量', () => {
      process.env.TEST_KEY = 'expanded-value';
      const mockYaml = `
llm:
  provider: anthropic
  anthropic:
    api_key: \${TEST_KEY}
`;
      vi.mocked(fs.readFileSync).mockReturnValue(mockYaml);
      vi.mocked(fs.existsSync).mockReturnValue(true);

      const config = loadConfig('/fake/config.yaml');

      expect(config.llm.anthropic?.api_key).toBe('expanded-value');
      delete process.env.TEST_KEY;
    });

    it('配置文件不存在时应该抛出错误', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      expect(() => loadConfig('/nonexistent/config.yaml')).toThrow('Config file not found');
    });

    it('缺少 llm.provider 应该抛出错误', () => {
      const mockYaml = 'tools:\n  enabled:\n    - test';
      vi.mocked(fs.readFileSync).mockReturnValue(mockYaml);
      vi.mocked(fs.existsSync).mockReturnValue(true);

      expect(() => loadConfig('/fake/config.yaml')).toThrow('Missing required config: llm.provider');
    });
  });

  describe('createDefaultConfig', () => {
    it('应该创建默认配置文件', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      vi.mocked(fs.mkdirSync).mockReturnValue('/mocked/dir');

      createDefaultConfig('/mocked/config.yaml');

      expect(vi.mocked(fs.mkdirSync)).toHaveBeenCalledWith(
        '/mocked',
        expect.objectContaining({ recursive: true })
      );
      expect(vi.mocked(fs.writeFileSync)).toHaveBeenCalledWith(
        '/mocked/config.yaml',
        expect.stringContaining('llm:')
      );
    });

    it('应该包含所有必需的配置项', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      vi.mocked(fs.mkdirSync).mockReturnValue('/mocked/dir');

      createDefaultConfig('/mocked/config.yaml');

      const writtenContent = vi.mocked(fs.writeFileSync).mock.calls[0]?.[1] as string;
      expect(writtenContent).toContain('provider:');
      expect(writtenContent).toContain('tools:');
      expect(writtenContent).toContain('skills:');
      expect(writtenContent).toContain('memory:');
      expect(writtenContent).toContain('logging:');
    });
  });
});

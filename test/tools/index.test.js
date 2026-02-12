/**
 * tools/index 单元测试
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { toolRegistry } from '../../src/tools/index.js';
// Mock fs 模块
vi.mock('node:fs/promises', () => ({
    readFile: vi.fn(),
    writeFile: vi.fn(),
}));
vi.mock('node:fs', () => ({
    existsSync: vi.fn(),
}));
// Mock execa
vi.mock('execa', () => ({
    execaCommand: vi.fn(),
}));
describe('tools/index', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    describe('toolRegistry', () => {
        it('应该注册三个内置工具', () => {
            const tools = toolRegistry.list();
            expect(tools).toHaveLength(3);
        });
        it('应该包含 read_file 工具', () => {
            const tools = toolRegistry.list();
            const readTool = tools.find((t) => t.name === 'read_file');
            expect(readTool).toBeDefined();
            expect(readTool?.description).toBe('读取文件内容');
        });
        it('应该包含 write_file 工具', () => {
            const tools = toolRegistry.list();
            const writeTool = tools.find((t) => t.name === 'write_file');
            expect(writeTool).toBeDefined();
            expect(writeTool?.description).toBe('写入文件内容');
        });
        it('应该包含 bash 工具', () => {
            const tools = toolRegistry.list();
            const bashTool = tools.find((t) => t.name === 'bash');
            expect(bashTool).toBeDefined();
            expect(bashTool?.description).toBe('执行 Shell 命令');
        });
        it('工具应该有正确的参数 schema', () => {
            const tools = toolRegistry.list();
            const readTool = tools.find((t) => t.name === 'read_file');
            expect(readTool?.input_schema).toEqual({
                type: 'object',
                properties: {
                    path: {
                        type: 'string',
                        description: '文件路径',
                    },
                },
                required: ['path'],
            });
        });
    });
    describe('read_file 工具', () => {
        it('应该读取文件内容', async () => {
            const { readFile } = await import('node:fs/promises');
            const { existsSync } = await import('node:fs');
            vi.mocked(readFile).mockResolvedValue('file content');
            vi.mocked(existsSync).mockReturnValue(true);
            const result = await toolRegistry.execute('read_file', { path: '/test/file.txt' });
            expect(vi.mocked(readFile)).toHaveBeenCalledWith('/test/file.txt', 'utf-8');
            expect(result).toEqual({ content: 'file content' });
        });
        it('文件不存在时应该抛出错误', async () => {
            const { existsSync } = await import('node:fs');
            vi.mocked(existsSync).mockReturnValue(false);
            await expect(toolRegistry.execute('read_file', { path: '/nonexistent.txt' })).rejects.toThrow('File not found');
        });
    });
    describe('write_file 工具', () => {
        it('应该写入文件内容', async () => {
            const { writeFile } = await import('node:fs/promises');
            vi.mocked(writeFile).mockResolvedValue(undefined);
            const result = await toolRegistry.execute('write_file', {
                path: '/test/file.txt',
                content: 'hello world',
            });
            expect(vi.mocked(writeFile)).toHaveBeenCalledWith('/test/file.txt', 'hello world', 'utf-8');
            expect(result).toEqual({ success: true });
        });
    });
    describe('bash 工具', () => {
        it('应该执行 shell 命令', async () => {
            const { execaCommand } = await import('execa');
            vi.mocked(execaCommand).mockResolvedValue({
                stdout: 'output',
                stderr: '',
                exitCode: 0,
            });
            const result = await toolRegistry.execute('bash', { command: 'echo hello' });
            expect(vi.mocked(execaCommand)).toHaveBeenCalledWith('echo hello', {
                shell: true,
                timeout: 30000,
            });
            expect(result).toEqual({
                stdout: 'output',
                stderr: '',
                exitCode: 0,
            });
        });
        it('命令执行失败时应该返回错误信息', async () => {
            const { execaCommand } = await import('execa');
            const error = new Error('Command failed');
            vi.mocked(execaCommand).mockRejectedValue(error);
            const result = await toolRegistry.execute('bash', { command: 'false' });
            expect(result).toEqual({
                stdout: '',
                stderr: 'Command failed',
                exitCode: 1,
            });
        });
    });
    describe('execute 未知工具', () => {
        it('应该抛出错误', async () => {
            await expect(toolRegistry.execute('unknown_tool', {})).rejects.toThrow('Tool not found');
        });
    });
});
//# sourceMappingURL=index.test.js.map
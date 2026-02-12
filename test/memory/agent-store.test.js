/**
 * memory/agent-store 单元测试
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { rmSync, mkdirSync } from 'node:fs';
import { AgentStoreImpl } from '../../src/memory/agent-store.js';
const TEST_DIR = '/tmp/miniclaw-test-agent-store';
describe('memory/agent-store', () => {
    let store;
    beforeEach(async () => {
        // 清理并创建测试目录
        rmSync(TEST_DIR, { recursive: true, force: true });
        mkdirSync(TEST_DIR, { recursive: true });
        store = new AgentStoreImpl(TEST_DIR);
    });
    afterEach(() => {
        // 清理测试目录
        rmSync(TEST_DIR, { recursive: true, force: true });
    });
    describe('readMemory', () => {
        it('应该读取空内容当文件不存在', async () => {
            const memory = await store.readMemory();
            expect(memory).toBe('');
        });
        it('应该读取 MEMORY.md 文件内容', async () => {
            // 先写入内容
            await store.writeMemory('# Core Memory\n\nUser likes TypeScript');
            const memory = await store.readMemory();
            expect(memory).toBe('# Core Memory\n\nUser likes TypeScript');
        });
    });
    describe('writeMemory', () => {
        it('应该写入 MEMORY.md', async () => {
            await store.writeMemory('new content');
            const memory = await store.readMemory();
            expect(memory).toBe('new content');
        });
    });
    describe('append', () => {
        it('应该追加内容到 memory', async () => {
            await store.writeMemory('Original content');
            await store.append('memory', 'New content');
            const memory = await store.readMemory();
            expect(memory).toBe('Original content\nNew content');
        });
        it('应该追加内容到 identity', async () => {
            await store.writeIdentity('Original identity');
            await store.append('identity', 'New identity');
            const identity = await store.readIdentity();
            expect(identity).toBe('Original identity\nNew identity');
        });
        it('应该追加内容到 user', async () => {
            await store.writeUser('Original user');
            await store.append('user', 'New user');
            const user = await store.readUser();
            expect(user).toBe('Original user\nNew user');
        });
    });
    describe('search', () => {
        beforeEach(async () => {
            await store.writeMemory('# Core Memory\n\nUser likes TypeScript and AI');
            await store.writeIdentity('# Identity\n\nYou are a helpful assistant');
            await store.writeUser('# User\n\nJohn Doe\njohn@example.com');
        });
        it('应该搜索匹配的内容', async () => {
            const results = await store.search('TypeScript');
            expect(results.length).toBeGreaterThan(0);
            expect(results[0].file).toBe('MEMORY.md');
            expect(results[0].content).toContain('TypeScript');
        });
        it('应该不区分大小写搜索', async () => {
            const results = await store.search('typescript');
            expect(results.length).toBeGreaterThan(0);
        });
        it('应该搜索所有文件', async () => {
            const results = await store.search('assistant');
            expect(results.length).toBeGreaterThan(0);
            expect(results[0].file).toBe('IDENTITY.md');
        });
    });
});
//# sourceMappingURL=agent-store.test.js.map
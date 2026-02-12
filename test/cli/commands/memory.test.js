/**
 * memory 命令单元测试
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { memoryCommand } from '../../../src/cli/commands/memory.js';
describe('CLI: memory 命令', () => {
    let mockAgent;
    beforeEach(() => {
        mockAgent = {
            chat: vi.fn(),
            run: vi.fn(),
        };
    });
    describe('命令导出', () => {
        it('应该导出 memoryCommand 函数', () => {
            expect(memoryCommand).toBeDefined();
            expect(typeof memoryCommand).toBe('function');
        });
    });
    describe('参数类型', () => {
        it('应该接受正确类型的参数', () => {
            const mockProgram = {
                command: vi.fn().mockReturnThis(),
                description: vi.fn().mockReturnThis(),
                option: vi.fn().mockReturnThis(),
                action: vi.fn().mockReturnThis(),
            };
            expect(() => memoryCommand(mockProgram, mockAgent)).not.toThrow();
        });
    });
    describe('基本功能', () => {
        it('应该存在导出', () => {
            expect(memoryCommand).toBeDefined();
        });
    });
});
//# sourceMappingURL=memory.test.js.map
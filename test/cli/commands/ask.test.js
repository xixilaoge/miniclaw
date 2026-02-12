/**
 * ask 命令单元测试
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { askCommand } from '../../../src/cli/commands/ask.js';
describe('CLI: ask 命令', () => {
    let mockAgent;
    let chatSpy;
    beforeEach(() => {
        chatSpy = vi.fn().mockResolvedValue('Test response');
        mockAgent = {
            chat: chatSpy,
            run: vi.fn(),
        };
    });
    describe('命令导出', () => {
        it('应该导出 askCommand 函数', () => {
            expect(askCommand).toBeDefined();
            expect(typeof askCommand).toBe('function');
        });
    });
    describe('参数类型', () => {
        it('应该接受正确类型的参数', () => {
            const mockProgram = {
                command: vi.fn().mockReturnThis(),
                argument: vi.fn().mockReturnThis(),
                description: vi.fn().mockReturnThis(),
                option: vi.fn().mockReturnThis(),
                action: vi.fn().mockReturnThis(),
            };
            // 这应该不会抛出类型错误
            expect(() => askCommand(mockProgram, mockAgent)).not.toThrow();
        });
    });
    describe('基本功能', () => {
        it('应该存在导出', () => {
            expect(askCommand).toBeDefined();
        });
    });
});
//# sourceMappingURL=ask.test.js.map
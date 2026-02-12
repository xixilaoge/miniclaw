/**
 * chat 命令单元测试
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { chatCommand } from '../../../src/cli/commands/chat.js';
describe('CLI: chat 命令', () => {
    let mockAgent;
    let runSpy;
    beforeEach(() => {
        runSpy = vi.fn().mockResolvedValue({
            response: { content: 'Test response', usage: { totalTokens: 10 } },
            sessionUsed: {
                session_id: 'test',
                created_at: '2024-01-01',
                updated_at: '2024-01-01',
                messages: [],
                metadata: { total_turns: 0, total_tokens: 0 },
            },
        });
        mockAgent = {
            chat: vi.fn(),
            run: runSpy,
        };
    });
    describe('命令导出', () => {
        it('应该导出 chatCommand 函数', () => {
            expect(chatCommand).toBeDefined();
            expect(typeof chatCommand).toBe('function');
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
            expect(() => chatCommand(mockProgram, mockAgent)).not.toThrow();
        });
    });
    describe('基本功能', () => {
        it('应该存在导出', () => {
            expect(chatCommand).toBeDefined();
        });
    });
});
//# sourceMappingURL=chat.test.js.map
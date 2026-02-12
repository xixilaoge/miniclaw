/**
 * agent/types 类型测试
 */
import { describe, it, expect } from 'vitest';
describe('agent/types', () => {
    describe('AgentConfig', () => {
        it('应该正确构造 Agent 配置', () => {
            const config = {
                llm: {
                    provider: 'anthropic',
                    anthropic: {
                        apiKey: 'sk-test',
                        defaultModel: 'claude-3-5-sonnet-20241022',
                    },
                },
                tools: {
                    enabled: ['read_file', 'write_file', 'bash'],
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
            };
            expect(config.llm.provider).toBe('anthropic');
            expect(config.tools.enabled).toContain('read_file');
            expect(config.memory.session.max_turns).toBe(50);
        });
    });
    describe('AgentContext', () => {
        it('应该正确构造 Agent 上下文', () => {
            const context = {
                session: {
                    session_id: 'test',
                    created_at: '2026-02-12T10:00:00Z',
                    updated_at: '2026-02-12T10:00:00Z',
                    messages: [],
                    metadata: { total_turns: 0, total_tokens: 0 },
                },
                tools: [],
                skills: new Map(),
            };
            expect(context.session.session_id).toBe('test');
            expect(context.tools).toEqual([]);
            expect(context.skills.size).toBe(0);
        });
    });
    describe('AgentRunOptions', () => {
        it('应该正确构造运行选项', () => {
            const options = {
                sessionId: 'my-session',
                model: 'claude-3-5-sonnet-20241022',
                system: 'You are a helpful assistant.',
            };
            expect(options.sessionId).toBe('my-session');
            expect(options.model).toBe('claude-3-5-sonnet-20241022');
            expect(options.system).toBe('You are a helpful assistant.');
        });
        it('所有选项都是可选的', () => {
            const options = {};
            expect(options.sessionId).toBeUndefined();
            expect(options.model).toBeUndefined();
            expect(options.system).toBeUndefined();
        });
    });
    describe('AgentResult', () => {
        it('应该正确构造运行结果', () => {
            const result = {
                response: {
                    content: '你好！',
                    usage: {
                        inputTokens: 10,
                        outputTokens: 5,
                        totalTokens: 15,
                    },
                },
                toolResults: [
                    { name: 'read_file', success: true, result: { content: 'hello' } },
                ],
                sessionUsed: {
                    session_id: 'test',
                    created_at: '2026-02-12T10:00:00Z',
                    updated_at: '2026-02-12T10:01:00Z',
                    messages: [],
                    metadata: { total_turns: 1, total_tokens: 15 },
                },
            };
            expect(result.response.content).toBe('你好！');
            expect(result.toolResults).toHaveLength(1);
            expect(result.sessionUsed.metadata.total_turns).toBe(1);
        });
    });
    describe('ToolResult', () => {
        it('应该正确构造成功结果', () => {
            const result = {
                name: 'read_file',
                success: true,
                result: { content: 'file content' },
            };
            expect(result.name).toBe('read_file');
            expect(result.success).toBe(true);
            expect(result.error).toBeUndefined();
        });
        it('应该正确构造失败结果', () => {
            const result = {
                name: 'bash',
                success: false,
                result: null,
                error: 'Command not found',
            };
            expect(result.success).toBe(false);
            expect(result.error).toBe('Command not found');
        });
    });
    describe('Agent 接口', () => {
        it('应该定义 run 方法', () => {
            const agent = {
                run: async () => ({
                    response: { content: '' },
                    sessionUsed: {
                        session_id: '',
                        created_at: '',
                        updated_at: '',
                        messages: [],
                        metadata: { total_turns: 0, total_tokens: 0 },
                    },
                }),
                chat: async () => '',
            };
            expect(typeof agent.run).toBe('function');
            expect(typeof agent.chat).toBe('function');
        });
    });
});
//# sourceMappingURL=types.test.js.map
/**
 * Memory 系统类型定义
 */

export interface SessionMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  tool_calls?: ToolCallInMessage[];
}

export interface ToolCallInMessage {
  name: string;
  params: Record<string, unknown>;
}

export interface SessionData {
  session_id: string;
  created_at: string;
  updated_at: string;
  messages: SessionMessage[];
  metadata: {
    total_turns: number;
    total_tokens: number;
  };
}

export interface SessionStore {
  load(sessionId: string): Promise<SessionData>;
  save(sessionId: string, data: SessionData): Promise<void>;
  listSessions(): Promise<SessionData[]>;
  delete(sessionId: string): Promise<void>;
  clear(sessionId: string): Promise<void>;
  create(sessionId?: string): Promise<SessionData>;
}

export interface AgentMemoryFile {
  name: string;
  path: string;
  content: string;
}

export interface AgentStore {
  readMemory(): Promise<string>;
  readIdentity(): Promise<string>;
  readUser(): Promise<string>;
  writeMemory(content: string): Promise<void>;
  writeIdentity(content: string): Promise<void>;
  writeUser(content: string): Promise<void>;
  append(category: 'memory' | 'user' | 'identity', content: string): Promise<void>;
  search(query: string): Promise<MemoryMatch[]>;
}

export interface MemoryMatch {
  file: string;
  line: number;
  content: string;
}

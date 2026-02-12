/**
 * Session Store 实现
 * 使用 JSON 文件存储会话数据
 */

import fs from 'node:fs';
import path from 'node:path';
import logger from '../logger/index.js';
import type { SessionData, SessionMessage, SessionStore } from './types.js';

/**
 * 生成 ISO 8601 时间戳
 */
function getISOTimestamp(): string {
  return new Date().toISOString();
}

/**
 * 确保目录存在
 */
function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    logger.info({ dir: dirPath }, 'Created directory');
  }
}

/**
 * Session Store 实现
 */
export class SessionStoreImpl implements SessionStore {
  private basePath: string;

  constructor(basePath: string) {
    this.basePath = basePath;
  }

  /**
   * 加载会话数据
   */
  async load(sessionId: string): Promise<SessionData> {
    const sessionPath = path.join(this.basePath, `${sessionId}/session.json`);

    if (!fs.existsSync(sessionPath)) {
      throw new Error(`Session file not found: ${sessionPath}`);
    }

    const content = fs.readFileSync(sessionPath, 'utf-8');
    return JSON.parse(content) as SessionData;
  }

  /**
   * 保存会话数据
   */
  async save(sessionId: string, data: SessionData): Promise<void> {
    const sessionDir = path.join(this.basePath, sessionId);
    ensureDir(sessionDir);

    const sessionPath = path.join(sessionDir, 'session.json');

    const updatedData: SessionData = {
      ...data,
      updated_at: getISOTimestamp(),
    };

    fs.writeFileSync(sessionPath, JSON.stringify(updatedData, null, 2), 'utf-8');
    logger.debug({ sessionId, messagesCount: data.messages.length }, 'Session saved');
  }

  /**
   * 列出所有会话
   */
  async listSessions(): Promise<SessionData[]> {
    if (!fs.existsSync(this.basePath)) {
      return [];
    }

    const entries = fs.readdirSync(this.basePath, { withFileTypes: true });
    const sessions: SessionData[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const sessionPath = path.join(this.basePath, entry.name, 'session.json');
      if (!fs.existsSync(sessionPath)) continue;

      try {
        const content = fs.readFileSync(sessionPath, 'utf-8');
        sessions.push(JSON.parse(content) as SessionData);
      } catch (error) {
        logger.warn({ session: entry.name, error }, `Failed to load session: ${error}`);
      }
    }

    return sessions;
  }

  /**
   * 删除会话
   */
  async delete(sessionId: string): Promise<void> {
    const sessionPath = path.join(this.basePath, sessionId, 'session.json');

    if (!fs.existsSync(sessionPath)) {
      // 会话不存在，直接返回
      return;
    }

    const sessionDir = path.join(this.basePath, sessionId);
    fs.rmSync(sessionDir, { recursive: true, force: true });
    logger.info({ sessionId }, 'Session deleted');
  }

  /**
   * 清空会话消息
   */
  async clear(sessionId: string): Promise<void> {
    const sessionDir = path.join(this.basePath, sessionId);
    const sessionPath = path.join(sessionDir, 'session.json');

    if (!fs.existsSync(sessionPath)) {
      // 会话不存在，直接返回
      return;
    }

    const data: SessionData = await this.load(sessionId);
    data.messages = [];
    data.updated_at = getISOTimestamp();

    await this.save(sessionId, data);
  }

  /**
   * 创建新会话
   */
  async create(sessionId?: string): Promise<SessionData> {
    const id = sessionId || 'default';
    const now = getISOTimestamp();

    const data: SessionData = {
      session_id: id,
      created_at: now,
      updated_at: now,
      messages: [],
      metadata: {
        total_turns: 0,
        total_tokens: 0,
      },
    };

    await this.save(id, data);
    return data;
  }

  /**
   * 添加消息到会话
   */
  async addMessage(sessionId: string, message: SessionMessage): Promise<void> {
    const data = await this.load(sessionId);

    data.messages.push({
      ...message,
      timestamp: message.timestamp || getISOTimestamp(),
    });

    // 更新元数据
    const turnCount = data.messages.filter((m) => m.role === 'user' || m.role === 'assistant').length;
    data.metadata.total_turns = turnCount;

    await this.save(sessionId, data);
  }

  /**
   * 获取 token 使用量
   */
  getTokenUsage(sessionId: string): { total_turns: number; total_tokens: number } {
    const data = this.loadSync(sessionId);
    return data.metadata;
  }

  /**
   * 同步加载会话（内部方法）
   */
  private loadSync(sessionId: string): SessionData {
    const sessionPath = path.join(this.basePath, `${sessionId}/session.json`);

    if (!fs.existsSync(sessionPath)) {
      throw new Error(`Session file not found: ${sessionPath}`);
    }

    const content = fs.readFileSync(sessionPath, 'utf-8');
    return JSON.parse(content) as SessionData;
  }
}

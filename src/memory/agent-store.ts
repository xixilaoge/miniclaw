/**
 * Agent Store 实现
 * 使用 Markdown 文件存储 Agent 长期记忆
 */

import fs from 'node:fs';
import path from 'node:path';
import logger from '../logger/index.js';
import type { AgentMemoryFile, AgentStore } from './types.js';

/**
 * 获取记忆文件路径
 */
function getMemoryFilePath(basePath: string, filename: string): string {
  return path.join(basePath, filename);
}

/**
 * Agent Store 实现
 */
export class AgentStoreImpl implements AgentStore {
  private workspacePath: string;

  constructor(workspacePath: string) {
    this.workspacePath = workspacePath;
  }

  /**
   * 读取记忆文件内容
   */
  private readFile(filename: string): string {
    const filePath = getMemoryFilePath(this.workspacePath, filename);
    if (!fs.existsSync(filePath)) {
      return '';
    }
    return fs.readFileSync(filePath, 'utf-8');
  }

  async readMemory(): Promise<string> {
    return this.readFile('MEMORY.md');
  }

  async readIdentity(): Promise<string> {
    return this.readFile('IDENTITY.md');
  }

  async readUser(): Promise<string> {
    return this.readFile('USER.md');
  }

  /**
   * 写入记忆文件
   */
  private writeFile(filename: string, content: string): Promise<void> {
    const filePath = getMemoryFilePath(this.workspacePath, filename);
    const dir = path.dirname(filePath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, content, 'utf-8');
    logger.debug({ file: filename }, 'Memory file written');
  }

  async writeMemory(content: string): Promise<void> {
    await this.writeFile('MEMORY.md', content);
  }

  async writeIdentity(content: string): Promise<void> {
    await this.writeFile('IDENTITY.md', content);
  }

  async writeUser(content: string): Promise<void> {
    await this.writeFile('USER.md', content);
  }

  /**
   * 追加内容到文件
   */
  async append(category: 'memory' | 'user' | 'identity', content: string): Promise<void> {
    const filename = category === 'memory' ? 'MEMORY.md' : category === 'identity' ? 'IDENTITY.md' : 'USER.md';
    const existingContent = this.readFile(filename);
    const newContent = existingContent + '\n' + content;
    await this.writeFile(filename, newContent);
  }

  /**
   * 搜索记忆内容
   */
  async search(query: string): Promise<AgentMemoryFile[]> {
    const results: AgentMemoryFile[] = [];
    const files = ['MEMORY.md', 'IDENTITY.md', 'USER.md'];

    for (const file of files) {
      const content = this.readFile(file);
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.toLowerCase().includes(query.toLowerCase())) {
          results.push({
            file,
            line: i + 1,
            content: line.trim(),
          });
        }
      }
    }

    return results;
  }
}

/**
 * Skills 系统类型定义
 */

export interface Skill {
  name: string;
  description: string;
  emoji?: string;
  requires?: {
    bins?: string[];
    env?: string[];
  };
  content: string;
}

export interface SkillFrontmatter {
  name: string;
  description: string;
  emoji?: string;
  requires?: {
    bins?: string[];
    env?: string[];
  };
}

export interface SkillRegistry {
  loadAll(): Promise<Skill[]>;
  get(name: string): Skill | undefined;
  list(): Skill[];
  search(query: string): Skill[];
}

export interface SkillLoader {
  loadFromFile(filePath: string): Promise<Skill>;
  loadFromDirectory(dirPath: string): Promise<Skill[]>;
}

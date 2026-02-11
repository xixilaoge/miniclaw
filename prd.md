# MiniClaw PRD - 极简 AI Agent 框架

## 项目概述

**项目代号**：MiniClaw
**版本**：v0.1.0
**参考架构**：[OpenClaw](https://github.com/openclaw/openclaw)

MiniClaw 是一个极简版的 AI Agent 框架，参考 OpenClaw 的架构设计，提供核心的 Tools 和 Skills 能力，支持本地运行、持久化记忆和可扩展的技能系统。

---

## 核心目标

1. **极简架构** - 只保留核心功能，避免过度设计
2. **本地优先** - 数据存储在本地，保护隐私
3. **可扩展** - 通过 Skills 系统支持无限扩展
4. **易开发** - 清晰的代码结构，便于二次开发

---

## 技术选型

| 组件 | 技术选择 | 说明 |
|------|----------|------|
| **运行时** | Node.js 18+ | LTS 版本 |
| **语言** | TypeScript | 类型安全 |
| **LLM 统一接口** | `litellm` | 支持多提供商 |
| **CLI 框架** | `commander` | 成熟的 CLI 框架 |
| **配置格式** | YAML | 人类可读 |
| **记忆存储** | 文件系统 | JSON + Markdown |

---

## 架构设计

```
┌─────────────────────────────────────────────────────────────────┐
│                        MiniClaw v0.1.0                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐      ┌─────────────────────────────────────┐   │
│  │   CLI       │─────▶│          Agent Engine               │   │
│  │  Commander  │      │  ┌─────────────────────────────────┐ │   │
│  └─────────────┘      │  │  LiteLLM Provider (统一接口)     │ │   │
│                       │  └────────────┬────────────────────┘ │   │
│                       │               │                       │   │
│                       │  ┌────────────▼────────────────────┐ │   │
│                       │  │    Tool Calling Loop            │ │   │
│                       │  └────────────┬────────────────────┘ │   │
│                       └───────────────┼───────────────────────┘   │
│                                       │                           │
│         ┌────────────────────────────┼───────────────────┐       │
│         ▼                            ▼                   ▼       │
│  ┌─────────────┐          ┌───────────────┐    ┌─────────────┐  │
│  │   Tools     │          │    Skills     │    │   Memory    │  │
│  │ ┌─────────┐ │          │  (YAML/MD)    │    │ ┌─────────┐ │  │
│  │ │file     │ │          │               │    │ │Session  │ │  │
│  │ │bash     │ │          │ weather/      │    │ │(JSON)   │ │  │
│  │ │execute  │ │          │ github/       │    │ ├─────────┤ │  │
│  │ └─────────┘ │          │ calculator/   │    │ │Agent    │ │  │
│  └─────────────┘          └───────────────┘    │ │(MD)     │ │  │
│                                               │ └─────────┘ │  │
│                                               └─────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 目录结构

```
miniclaw/
├── src/
│   ├── cli/                      # CLI 入口
│   │   ├── commands/             # 命令处理
│   │   │   ├── ask.ts
│   │   │   ├── chat.ts
│   │   │   ├── skill.ts
│   │   │   └── tool.ts
│   │   └── index.ts
│   ├── agent/                    # Agent 核心
│   │   ├── agent.ts              # 主执行器
│   │   ├── llm.ts                # LLM 调用
│   │   └── tool-loop.ts          # Tool 调用循环
│   ├── tools/                    # 基础工具
│   │   ├── file.ts               # 文件读写
│   │   ├── bash.ts               # Shell 执行
│   │   └── index.ts              # 工具注册表
│   ├── skills/                   # Skills 加载器
│   │   ├── loader.ts             # YAML/MD 解析
│   │   ├── registry.ts           # 技能注册表
│   │   └── types.ts
│   ├── memory/                   # 记忆系统
│   │   ├── session-store.ts      # Session 级别（JSON）
│   │   ├── agent-store.ts        # Agent 级别（MD）
│   │   └── types.ts
│   ├── config/                   # 配置管理
│   │   ├── loader.ts             # YAML 配置加载
│   │   └── types.ts
│   ├── llm/                      # LLM 抽象层
│   │   ├── litellm.ts            # LiteLLM 封装
│   │   └── types.ts
│   └── index.ts
├── skills/                       # 内置技能目录
│   ├── weather/
│   │   └── SKILL.md
│   └── calculator/
│       └── SKILL.md
├── test/
│   └── ...
├── package.json
├── tsconfig.json
├── README.md
└── config.example.yaml
```

---

## 用户目录结构

```
~/.miniclaw/
├── config.yaml                  # 主配置文件
├── workspace/                   # Agent 工作空间
│   ├── MEMORY.md                # 核心知识库（长期记忆）
│   ├── IDENTITY.md              # AI 身份定义
│   └── USER.md                  # 用户画像
├── sessions/                    # Session 级别记忆
│   ├── default/
│   │   └── session.json         # 默认会话
│   └── project-x/
│       └── session.json         # 命名会话
├── skills/                      # 用户技能目录
│   └── my-custom-skill/
│       └── SKILL.md
└── logs/
    └── miniclaw.log
```

---

## 核心模块

### 1. CLI 入口

**命令设计**：

```bash
# 交互式对话
miniclaw
miniclaw chat

# 单次提问
miniclaw ask "你的问题"

# 管理命令
miniclaw skill list              # 列出所有技能
miniclaw skill show <name>       # 查看技能详情
miniclaw tool list               # 列出所有工具
miniclaw memory clear            # 清除会话记忆
miniclaw memory search "关键词"  # 搜索长期记忆
miniclaw config init             # 初始化配置
miniclaw config set <key> <val>  # 设置配置项

# 开发命令
miniclaw dev skill new <name>    # 创建新技能模板
```

### 2. Agent 引擎

**核心职责**：
- LLM 调用与流式响应
- Tool Calling 循环执行
- 上下文管理（Session + Agent 记忆）

**接口设计**：

```typescript
interface AgentConfig {
  llm: {
    provider: 'litellm';
    defaultModel: string;
    routing?: {
      simple?: string;
      normal?: string;
      complex?: string;
    };
  };
  tools: ToolConfig;
  skills: SkillsConfig;
  memory: MemoryConfig;
}

interface AgentContext {
  session: SessionData;
  agentMemory: AgentMemory;
  tools: ToolRegistry;
  skills: SkillRegistry;
}

interface AgentResponse {
  content: string;
  toolCalls?: ToolCall[];
  usage?: TokenUsage;
}
```

### 3. Tools - 基础工具集

| Tool | 功能 | 参数 | 返回值 |
|------|------|------|--------|
| `read_file` | 读取文件内容 | `path: string` | `content: string` |
| `write_file` | 写入文件 | `path: string, content: string` | `success: boolean` |
| `bash` | 执行 Shell 命令 | `command: string, timeout?: number` | `stdout: string, stderr: string, exitCode: number` |

**Tool 接口**：

```typescript
interface Tool {
  name: string;
  description: string;
  parameters: JSONSchema;
  execute: (params: any) => Promise<any>;
}

interface ToolRegistry {
  register(tool: Tool): void;
  get(name: string): Tool | undefined;
  list(): Tool[];
  execute(name: string, params: any): Promise<any>;
}
```

### 4. Skills - 技能系统

**SKILL.md 格式**：

```yaml
---
name: weather
description: 获取天气信息，支持城市查询和预报
emoji: ⛅
requires:
  bins: [curl]
---

# Weather Skill

使用 wttr.in 获取天气，无需 API Key。

## 快速查询

\`\`\`bash
# 当前天气
curl -s "wttr.in/Beijing?format=3"

# 详细预报
curl -s "wttr.in/Beijing"
\`\`\`

## 参数说明

- `location`: 城市名称（英文或拼音）
- `format`: 输出格式
```

**技能加载优先级**：

1. `~/.miniclaw/skills/` - 用户技能（最高优先级）
2. `./skills/` - 项目内置技能
3. 额外配置目录

**Skill 接口**：

```typescript
interface Skill {
  name: string;
  description: string;
  emoji?: string;
  requires?: {
    bins?: string[];
    env?: string[];
  };
  content: string;  // Markdown 内容
}

interface SkillRegistry {
  loadAll(): Promise<Skill[]>;
  get(name: string): Skill | undefined;
  list(): Skill[];
  search(query: string): Skill[];
}
```

### 5. Memory - 记忆系统

**双层记忆架构**：

| 层级 | 类型 | 存储方式 | 文件格式 | 保留时间 | 用途 |
|------|------|----------|----------|----------|------|
| **Session** | 短期 | `sessions/{name}/session.json` | JSON | 会话结束 | 对话连贯性 |
| **Agent** | 长期 | `workspace/*.md` | Markdown | 永久 | 用户偏好、历史决策 |

**Session 格式** (`sessions/{name}/session.json`)：

```json
{
  "session_id": "default",
  "created_at": "2026-02-11T10:00:00Z",
  "updated_at": "2026-02-11T14:30:00Z",
  "messages": [
    {
      "role": "user",
      "content": "帮我整理下载文件夹",
      "timestamp": "2026-02-11T14:25:00Z"
    },
    {
      "role": "assistant",
      "content": "好的，我来帮你...",
      "timestamp": "2026-02-11T14:25:05Z",
      "tool_calls": [
        {
          "name": "bash",
          "params": {"command": "ls ~/Downloads"}
        }
      ]
    }
  ],
  "metadata": {
    "total_turns": 15,
    "total_tokens": 3500
  }
}
```

**Agent 记忆文件**：

**`workspace/MEMORY.md`** - 核心知识库

```markdown
# 核心记忆

## 用户偏好

### 工作习惯
- 首选编辑器：VS Code
- 代码风格：2 空格缩进
- 喜欢早上 9-11 点处理深度工作

### 技术偏好
- 前端：React + TypeScript
- 后端：Node.js/Express
- 数据库：PostgreSQL

## 重要决策记录

### 2026-02-11: MiniClaw 项目启动
- 决定使用文件系统作为记忆存储
- 选择 litellm 作为 LLM 统一接口
- 技术栈：Node.js + TypeScript
```

**`workspace/IDENTITY.md`** - AI 身份定义

```markdown
# 身份定义

## 基本信息
- 名称：MiniClaw
- 版本：v0.1.0
- 签名表情：🦞

## 性格特点
- 简洁务实，不过度设计
- 优先考虑实用性和可维护性
- 喜欢代码示例而非长篇解释

## 沟通风格
- 使用中文回复
- 技术术语保持英文
- 代码块使用语法高亮
```

**`workspace/USER.md`** - 用户画像

```markdown
# 用户画像

## 基本信息
- 姓名：[待补充]
- 时区：Asia/Shanghai
- 职业：[待补充]

## 喜好
- ✅ 喜欢：简洁的代码、清晰的文档
- ❌ 讨厌：过度抽象、不必要的复杂度

## 当前项目
1. MiniClaw - 极简 AI Agent 框架
2. [待补充]
```

**Memory 接口**：

```typescript
interface SessionData {
  session_id: string;
  created_at: string;
  updated_at: string;
  messages: SessionMessage[];
  metadata: {
    total_turns: number;
    total_tokens: number;
  };
}

interface SessionStore {
  load(sessionId: string): Promise<SessionData>;
  save(sessionId: string, data: SessionData): Promise<void>;
  listSessions(): Promise<SessionData[]>;
  delete(sessionId: string): Promise<void>;
  clear(sessionId: string): Promise<void>;
}

interface AgentStore {
  readMemory(): Promise<string>;
  readIdentity(): Promise<string>;
  readUser(): Promise<string>;
  append(category: 'memory' | 'user' | 'identity', content: string): Promise<void>;
  search(query: string): Promise<MemoryMatch[]>;
}
```

---

## 配置文件

**`config.yaml`**：

```yaml
# MiniClaw 配置文件

# LLM 配置
llm:
  provider: litellm
  default_model: claude/claude-3-5-sonnet-20241022
  # 模型路由策略（可选）
  routing:
    simple: claude/claude-3-haiku-20240307
    normal: claude/claude-3-5-sonnet-20241022
    complex: claude/claude-3-5-opus-20241022

# Tools 配置
tools:
  enabled:
    - read_file
    - write_file
    - bash
  bash:
    allowed_commands: ["*"]  # 或白名单
    timeout_seconds: 30
    working_dir: ~/.miniclaw/workspace

# Skills 配置
skills:
  directories:
    - ./skills
    - ~/.miniclaw/skills
  auto_load: true

# 记忆配置（文件系统）
memory:
  # Session 级别（短期）
  session:
    storage_path: ~/.miniclaw/sessions
    default_session: default
    max_turns: 50
    max_tokens: 8000

  # Agent 级别（长期）
  agent:
    workspace_path: ~/.miniclaw/workspace
    files:
      - MEMORY.md      # 核心知识库
      - IDENTITY.md    # AI 身份
      - USER.md        # 用户画像

# 日志配置
logging:
  level: info
  file: ~/.miniclaw/miniclaw.log
```

---

## 技术依赖

```json
{
  "dependencies": {
    "litellm": "^1.x",
    "commander": "^12.x",
    "js-yaml": "^4.x",
    "chalk": "^5.x",
    "ora": "^8.x",
    "inquirer": "^10.x",
    "glob": "^11.x"
  },
  "devDependencies": {
    "@types/node": "^20.x",
    "typescript": "^5.x",
    "tsx": "^4.x",
    "vitest": "^2.x"
  }
}
```

---

## 开发路线

| 阶段 | 内容 | 优先级 |
|------|------|--------|
| **P0** | 核心框架 + CLI + 3个基础工具 + LiteLLM 集成 | 🔴 高 |
| **P1** | Skills 加载器 + YAML 配置 | 🔴 高 |
| **P2** | 双层记忆系统（Session JSON + Agent MD） | 🟡 中 |
| **P3** | 技能模板 + 开发工具 | 🟢 低 |

---

## 非功能需求

### 安全性
- Shell 执行需有超时限制
- 支持命令白名单/黑名单
- 敏感信息不记录到日志

### 可靠性
- 命令执行失败不影响 Agent 继续运行
- 记忆文件损坏时自动恢复

### 可维护性
- 清晰的模块划分
- 完善的类型定义
- 充分的代码注释

### 可扩展性
- Tools 可动态注册
- Skills 可热加载
- LLM 提供商可切换

---

## 参考

- [OpenClaw](https://github.com/openclaw/openclaw) - 原始架构参考
- [LiteLLM](https://github.com/BerriAI/litellm) - 统一 LLM 接口
- [MCP Protocol](https://modelcontextprotocol.io/) - 模型上下文协议

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

MiniClaw 是一个极简 AI Agent 框架，参考 [OpenClaw](https://github.com/openclaw/openclaw) 架构设计。项目目前处于早期设计阶段，核心实现尚未完成。

**核心目标**：
- 极简架构 - 只保留核心功能，避免过度设计
- 本地优先 - 数据存储在本地，保护隐私
- 可扩展 - 通过 Skills 系统支持无限扩展

## 技术栈

| 组件 | 技术选择 |
|------|----------|
| 运行时 | Node.js 18+ |
| 语言 | TypeScript |
| LLM 统一接口 | `litellm` |
| CLI 框架 | `commander` |
| 配置格式 | YAML |
| 记忆存储 | 文件系统（JSON + Markdown） |

## 核心架构

```
CLI (Commander)
    │
    ▼
Agent Engine
    │
    ├── LiteLLM Provider (LLM 统一接口)
    ├── Tool Calling Loop
    │
    ▼
├──────────┬──────────┬──────────┐
Tools      Skills    Memory    Config
(内置工具)  (YAML/MD) (双层记忆) (YAML)
```

## 双层记忆系统

| 层级 | 存储位置 | 格式 | 用途 |
|------|----------|------|------|
| Session | `~/.miniclaw/sessions/{name}/session.json` | JSON | 短期对话连贯性 |
| Agent | `~/.miniclaw/workspace/*.md` | Markdown | 长期知识、用户偏好 |

Agent 层记忆包含三个核心文件：
- `MEMORY.md` - 核心知识库、重要决策
- `IDENTITY.md` - AI 身份定义、沟通风格
- `USER.md` - 用户画像、喜好

## Skills 系统

技能通过 YAML frontmatter + Markdown 内容定义，存储为 `SKILL.md`：

```yaml
---
name: weather
description: 获取天气信息
emoji: ⛅
requires:
  bins: [curl]
---

# Weather Skill

使用 wttr.in 获取天气...
```

加载优先级：`~/.miniclaw/skills/` > `./skills/`

## 内置工具 (Tools)

| Tool | 功能 |
|------|------|
| `read_file` | 读取文件内容 |
| `write_file` | 写入文件 |
| `bash` | 执行 Shell 命令 |

## 计划中的 CLI 命令

```bash
miniclaw                    # 交互式对话
miniclaw ask "问题"         # 单次提问
miniclaw skill list         # 列出技能
miniclaw memory clear       # 清除会话记忆
miniclaw config init        # 初始化配置
```

## 项目结构（计划中）

```
miniclaw/
├── src/
│   ├── cli/              # CLI 入口
│   ├── agent/            # Agent 核心
│   ├── tools/            # 基础工具
│   ├── skills/           # Skills 加载器
│   ├── memory/           # 记忆系统
│   ├── config/           # 配置管理
│   └── llm/              # LLM 抽象层
├── skills/               # 内置技能
└── ~/.miniclaw/          # 用户数据目录
```

## 开发路线

| 阶段 | 内容 | 优先级 |
|------|------|--------|
| P0 | 核心框架 + CLI + 3个基础工具 + LiteLLM | 高 |
| P1 | Skills 加载器 + YAML 配置 | 高 |
| P2 | 双层记忆系统 | 中 |
| P3 | 技能模板 + 开发工具 | 低 |

## 参考资源

- [OpenClaw](https://github.com/openclaw/openclaw) - 原始架构参考
- [LiteLLM](https://github.com/BerriAI/litellm) - 统一 LLM 接口
- PRD 文档：`prd.md`

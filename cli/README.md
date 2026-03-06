# 🏹 Chiron CLI — Optional Integration Layer

> This directory is the optional integration layer for the main Chiron skill repository.

Use `cli/` only when you want local tooling around the skill:

- MCP server integration
- external prompt-enhancement scripts
- Gemini CLI in-place enhancement experiments

If you only want the Chiron skill, return to the root [README.md](../README.md) and skip this directory.

## What Lives Here

| Path | Purpose |
|------|---------|
| `bin/chiron-enhance.mjs` | External enhancement script for CLI integrations |
| `src/server.mjs` | MCP server entrypoint |
| `src/context-engine.mjs` | Project scanning and relevance lookup |
| `src/enhancer.mjs` | Prompt enhancement logic |
| `patches/gemini-cli/` | Patch files and notes for Gemini CLI integration |
| `tui/` | Ink-based standalone TUI experiment |

## Quick Setup (2 minutes)

### 1. Install dependencies

```bash
cd cli && npm install
```

### 2. Add MCP Server to Claude Code

Add to your `~/.claude/settings.json` (global) or project `.claude/settings.json`:

```json
{
  "mcpServers": {
    "chiron": {
      "command": "node",
      "args": ["/absolute/path/to/chiron/cli/src/server.mjs"]
    }
  }
}
```

### 3. Copy the slash command

The `/e` command is already in `.claude/commands/e.md`. When you use this project, it's available automatically.

For other projects, copy it:

```bash
mkdir -p /path/to/your-project/.claude/commands
cp .claude/commands/e.md /path/to/your-project/.claude/commands/
```

---

## Usage

### Slash Command (recommended inside Claude Code)

In Claude Code, type:

```
/e 修复登录API的性能问题
/e Add pagination to the user list endpoint
/e Refactor the auth middleware for better error handling
```

The `/e` command uses a visible 4-step pipeline:

1. 🔍 **Scan Project** — detects tech stack, framework, structure
2. 📂 **Find Relevant Code** — locates files related to your request
3. 🧠 **Enhance Prompt** — generates expert-grade specification
4. 🚀 **Execute** — performs the task using the enhanced spec

### Direct MCP Tool Calls

Claude can also call the tools directly when it detects an underspecified request:

- `enhance_prompt` — Full pipeline: scan + search + enhance
- `scan_project` — Just project analysis
- `find_relevant_code` — Just file search

---

## How It Works

```
┌─────────────────────────────────────────────────┐
│  User types: /e <prompt>                        │
└──────────────────┬──────────────────────────────┘
                   │
    ┌──────────────▼──────────────┐
    │  🔍 Context Engine          │
    │  • Detect project type      │
    │  • Parse package.json       │
    │  • Scan directory tree      │
    │  • Read key config files    │
    └──────────────┬──────────────┘
                   │
    ┌──────────────▼──────────────┐
    │  📂 Relevance Search        │
    │  • Extract keywords         │
    │  • Score files by relevance │
    │  • Read top matches         │
    └──────────────┬──────────────┘
                   │
    ┌──────────────▼──────────────┐
    │  🔀 Git Context             │
    │  • Current branch           │
    │  • Recent commits           │
    │  • Uncommitted changes      │
    └──────────────┬──────────────┘
                   │
    ┌──────────────▼──────────────┐
    │  🧠 Prompt Enhancer         │
    │  • Auto-detect strategy     │
    │  • Build enhanced spec      │
    │  • Add execution guidance   │
    └──────────────┬──────────────┘
                   │
    ┌──────────────▼──────────────┐
    │  🚀 Claude executes with    │
    │     full context & spec     │
    └─────────────────────────────┘
```

## MCP Tools Reference

| Tool | Input | Output |
|------|-------|--------|
| `enhance_prompt` | `prompt`, `strategy?`, `include_snippets?` | Enhanced specification with project context |
| `scan_project` | `depth?` | JSON: tech stack, structure, key files |
| `find_relevant_code` | `query`, `max_results?`, `include_content?` | Ranked list of relevant files with content |

### Strategies

| Strategy | Auto-detected when… |
|----------|---------------------|
| `detailed` | Default for underspecified requests |
| `concise` | "summarize", "brief", "简洁" |
| `creative` | "idea", "brainstorm", "创意" |
| `professional` | "business", "report", "演示" |
| `analytical` | "analyze", "compare", "分析" |
| `educational` | "explain", "teach", "解释" |
| `action` | "setup", "deploy", "how to", "配置" |

## Positioning

This directory is not the main product by itself.

- The main product is the Chiron skill at the repository root.
- `cli/` exists so the same repository can also ship integration experiments and local tooling.
- If the CLI becomes a product with its own release lifecycle later, it can be split into a separate repo then. For now, keeping it here reduces maintenance cost.

## Comparison: Before vs After

| Aspect | Skill Only (v1) | CLI + MCP (v2) |
|--------|----------------|----------------|
| **Trigger** | Vague phrases | `/e` command |
| **Visibility** | Silent (internal) | Every step shown |
| **Code awareness** | None | Full repo scan |
| **Git context** | None | Branch, commits, changes |
| **Tech stack** | None | Auto-detected |
| **File relevance** | None | Keyword-scored search |
| **Enhancement** | Prompt rewriting | Structured specification |

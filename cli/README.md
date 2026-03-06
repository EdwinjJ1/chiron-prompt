# Chiron CLI Integration Guide

Chiron's CLI layer is the part of the project that makes prompt enhancement feel native inside terminal agents.

If the root [README.md](../README.md) explains what Chiron is, this file explains how the CLI-facing pieces fit together.

## What This Layer Is For

Use `cli/` when you want one of these:

- repository-aware prompt enhancement from a command
- a visible `/e` workflow in Gemini CLI or Claude Code
- in-place input enhancement for patched Gemini CLI
- a local MCP server that exposes the enhancer as tools

If you only want the reusable skill behavior, go back to [SKILL.md](../SKILL.md).

## The Core Pieces

| Path | Purpose |
|------|---------|
| `bin/chiron-enhance.mjs` | main enhancer entrypoint for CLI integrations |
| `bin/chiron.mjs` | small CLI wrapper for local server usage |
| `src/context-engine.mjs` | scans the repo, stack, files, and git context |
| `src/enhancer.mjs` | builds the enhanced prompt from raw input + context |
| `src/server.mjs` | MCP server entrypoint |
| `patches/gemini-cli/` | Gemini CLI patch files and usage notes |
| `tui/` | standalone TUI experiment |

## Best Current Workflows

### 1. Gemini CLI `/e`

This repo ships a project-level command in [.gemini/commands/e.toml](../.gemini/commands/e.toml).

```text
gemini
/e explain why this auth middleware fails on refresh
```

What happens:

1. `chiron-enhance.mjs` reads your request.
2. The context engine scans the repo.
3. Relevant files are scored and selected.
4. Chiron builds a stronger prompt.
5. Gemini continues with the enhanced prompt.

This is the most practical default setup.

### 2. Gemini CLI in-place enhancement

If you want to enhance the current input box instead of using `/e`, use the patch notes in [patches/gemini-cli/README.md](patches/gemini-cli/README.md).

This mode is closer to an Augment-style loop:

- type rough request
- trigger enhancement inside the input box
- review or edit the rewritten text
- press `Enter` only when ready

### 3. Claude Code `/e`

The project also ships [.claude/commands/e.md](../.claude/commands/e.md).

With the MCP server configured, Claude Code can run the same repo-aware enhancement flow through a visible slash command.

## Quick Setup

### Install dependencies

```bash
cd cli
npm install
```

### Run the MCP server locally

```bash
node ./bin/chiron.mjs serve
```

### Add the MCP server to Claude Code

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

## How The Enhancer Thinks

The enhancer should be dynamic, not template-locked.

It can use:

- package metadata and framework signals
- directory structure and key config files
- keyword-based relevant file search
- branch name and local git changes
- task-type heuristics for the final rewrite

Implementation references:

- [src/context-engine.mjs](src/context-engine.mjs)
- [src/enhancer.mjs](src/enhancer.mjs)
- [bin/chiron-enhance.mjs](bin/chiron-enhance.mjs)

## Status

What is stable today:

- project-local `/e` command flow
- Claude Code command + MCP integration
- repo-aware enhancement scripts

What is still experimental:

- patched Gemini CLI input replacement
- standalone Ink TUI under `tui/`

## Related Docs

- [README.md](../README.md)
- [README.zh-CN.md](../README.zh-CN.md)
- [patches/gemini-cli/README.md](patches/gemini-cli/README.md)
- [docs/examples.md](../docs/examples.md)
- [docs/testing.md](../docs/testing.md)

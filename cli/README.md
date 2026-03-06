# Chiron CLI Integration Guide

Chiron's CLI layer is the part of the project that makes prompt enhancement feel native inside terminal agents.

If the root [README.md](../README.md) explains what Chiron is, this file explains how the CLI-facing pieces fit together.

## Install Into Your Existing Gemini CLI

If your machine already has a working `gemini` command, this is the fastest real-user setup:

```bash
git clone https://github.com/EdwinjJ1/chiron-prompt.git ~/.chiron
node ~/.chiron/cli/bin/install-gemini-command.mjs --name chiron
```

Then use it directly inside normal Gemini CLI:

```text
gemini
/chiron refactor this auth middleware and explain the regression risk
```

You do not need:

- a `/tmp/gemini-cli` development clone
- `npm run start --workspace @google/gemini-cli`
- a separate launcher just to use Chiron

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
| `bin/install-gemini-command.mjs` | installs Chiron as a slash command into your existing global Gemini CLI |
| `bin/install-gemini-overlay.mjs` | **one-command installer**: copies Gemini CLI into `~/.chiron/gemini-cli`, patches it with double `Ctrl+E`, writes `~/.local/bin/gemini` wrapper |
| `bin/install-gemini-inplace-enhance.mjs` | patches your **global** Gemini CLI in place with double `Ctrl+E` (backs up original) |
| `bin/chiron-enhance.mjs` | main enhancer entrypoint for CLI integrations |
| `bin/chiron.mjs` | small CLI wrapper for local server usage |
| `src/context-engine.mjs` | scans the repo, stack, files, and git context |
| `src/enhancer.mjs` | builds the enhanced prompt from raw input + context |
| `src/server.mjs` | MCP server entrypoint |
| `patches/gemini-cli/` | Gemini CLI patch files and usage notes |
| `tui/` | standalone TUI experiment |

## Best Current Workflows

### 1. Existing Gemini CLI `/chiron`

Install once:

```bash
node ~/.chiron/cli/bin/install-gemini-command.mjs --name chiron
```

Then:

```text
gemini
/chiron explain why this auth middleware fails on refresh
```

### 2. Gemini CLI `/e`

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

This is useful when the repository itself is already present inside the current project.

### 3. Gemini CLI overlay installer (Augment-style, recommended)

This is the easiest way to get double `Ctrl+E` enhance-in-place without touching the global Gemini CLI:

```bash
node cli/bin/install-gemini-overlay.mjs
```

What it does:

1. Copies your global Gemini CLI into `~/.chiron/gemini-cli` (user-owned)
2. Copies Chiron runtime into `~/.chiron/cli`
3. Patches the overlay with double `Ctrl+E` enhancement
4. Writes `~/.local/bin/gemini` → launches the patched overlay everywhere

Usage:

1. Open a new terminal (or `hash -r`)
2. Enter any project directory
3. Run `gemini`
4. Type a rough request
5. Press `Ctrl+E` once → move to end of line
6. Press `Ctrl+E` again within 500 ms → **replace input with enhanced prompt**

Rollback:

```bash
rm -f ~/.local/bin/gemini
rm -rf ~/.chiron
hash -r
```

### 4. Gemini CLI in-place patch (no overlay)

If you'd rather patch your global Gemini CLI directly (root-owned), instead of creating an overlay:

```bash
node cli/bin/install-gemini-inplace-enhance.mjs
```

This patches the **original** Gemini CLI's `InputPrompt.js` in place (a backup is saved under `~/.chiron/backups/`).

Behavior is the same double `Ctrl+E` flow described above.

You can also apply the patch manually:

```bash
# inside your gemini-cli clone
git apply cli/patches/gemini-cli/double-ctrl-e-enhance-in-place.patch
```

Full details: [patches/gemini-cli/README.md](patches/gemini-cli/README.md)

### 5. Claude Code `/e`

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
- `install-gemini-overlay.mjs` — user-owned overlay, no root needed
- `install-gemini-inplace-enhance.mjs` — global patch with backup

What is still experimental:

- manual `git apply` patch workflow
- standalone Ink TUI under `tui/`

## Related Docs

- [README.md](../README.md)
- [README.zh-CN.md](../README.zh-CN.md)
- [patches/gemini-cli/README.md](patches/gemini-cli/README.md)
- [docs/examples.md](../docs/examples.md)
- [docs/testing.md](../docs/testing.md)

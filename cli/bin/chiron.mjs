#!/usr/bin/env node
/**
 * Chiron CLI entry point
 * Usage:
 *   chiron serve    Start MCP server (default)
 *   chiron help     Show usage
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const cmd = process.argv[2];

if (!cmd || cmd === 'serve') {
    const child = spawn('node', [join(__dirname, '..', 'src', 'server.mjs')], {
        stdio: 'inherit',
        env: { ...process.env },
    });
    child.on('exit', (code) => process.exit(code ?? 0));
} else if (cmd === 'help' || cmd === '--help' || cmd === '-h') {
    console.log(`
🏹 Chiron Prompt Enhancer v2.0.0

Usage:
  chiron serve      Start MCP server (default)
  chiron help       Show this help

Claude Code Integration:
  Add to ~/.claude/settings.json or project .claude/settings.json:

  {
    "mcpServers": {
      "chiron": {
        "command": "node",
        "args": ["/absolute/path/to/cli/src/server.mjs"]
      }
    }
  }

Slash Command:
  Type /e <your prompt> in Claude Code to enhance with codebase context.
`);
} else {
    console.error(`Unknown command: ${cmd}. Run 'chiron help' for usage.`);
    process.exit(1);
}

#!/usr/bin/env node

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');
const enhancerPath = path.join(repoRoot, 'cli', 'bin', 'chiron-enhance.mjs');

function parseArgs(argv) {
  const options = {
    name: 'chiron',
    force: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--force') {
      options.force = true;
      continue;
    }

    if (arg === '--name') {
      options.name = argv[i + 1] ?? '';
      i += 1;
      continue;
    }

    if (arg === '--help' || arg === '-h') {
      options.help = true;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function validateCommandName(name) {
  if (!name || !/^[a-zA-Z0-9_-]+$/.test(name)) {
    throw new Error('Command name must match /^[a-zA-Z0-9_-]+$/');
  }
}

function shellQuote(value) {
  return `'${value.replace(/'/g, `'"'"'`)}'`;
}

function buildToml(enhancerAbsolutePath) {
  const quotedEnhancerPath = shellQuote(enhancerAbsolutePath);

  return `description = "Chiron: enhance the request with repository context before execution"
prompt = """
You are the current project's implementation agent. Use the following Chiron Enhanced Spec as the real task input and execute the work directly.

User request:
{{args}}

Chiron Enhanced Spec:
!{node ${quotedEnhancerPath} {{args}}}

Execution requirements:
1. Work against the actual repository state.
2. If the enhanced spec conflicts with the real codebase, prefer the codebase and explain why.
3. Return: files changed, verification, and remaining risks.
"""
`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    console.log(`Chiron Gemini Command Installer

Usage:
  node cli/bin/install-gemini-command.mjs [--name chiron] [--force]

Options:
  --name <value>   Global Gemini slash command name. Default: chiron
  --force          Overwrite an existing command file
`);
    return;
  }

  validateCommandName(options.name);

  await fs.access(enhancerPath);

  const commandsDir = path.join(os.homedir(), '.gemini', 'commands');
  const commandPath = path.join(commandsDir, `${options.name}.toml`);

  await fs.mkdir(commandsDir, { recursive: true });

  try {
    await fs.access(commandPath);
    if (!options.force) {
      throw new Error(
        `Command already exists at ${commandPath}. Re-run with --force to overwrite.`,
      );
    }
  } catch (error) {
    if (error && error.code !== 'ENOENT') {
      throw error;
    }
  }

  await fs.writeFile(commandPath, buildToml(enhancerPath), 'utf8');

  console.log(`Installed Gemini command: /${options.name}`);
  console.log(`Command file: ${commandPath}`);
  console.log('');
  console.log('Next steps:');
  console.log('1. Start gemini in any project directory.');
  console.log(`2. Run /${options.name} <your request>.`);
}

main().catch((error) => {
  console.error(`Failed to install Gemini command: ${error.message}`);
  process.exit(1);
});

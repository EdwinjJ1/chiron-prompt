#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');
const sourceCliDir = path.join(repoRoot, 'cli');
const patchPath = path.join(
  repoRoot,
  'cli',
  'patches',
  'codex',
  'double-ctrl-e-enhance-in-place.patch',
);
const defaultInstallRoot = path.join(os.homedir(), '.chiron');

function parseArgs(argv) {
  const options = {
    installRoot: defaultInstallRoot,
    codexRoot: null,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--codex-root') {
      options.codexRoot = path.resolve(argv[i + 1] ?? '');
      i += 1;
      continue;
    }

    if (arg === '--install-root') {
      options.installRoot = path.resolve(argv[i + 1] ?? '');
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

function printHelp() {
  console.log(`Chiron Codex Source Installer

Usage:
  node cli/bin/install-codex-source-enhance.mjs --codex-root /path/to/openai-codex [--install-root ~/.chiron]

What it does:
  1. Copies Chiron runtime into a stable install directory
  2. Applies the Codex TUI double Ctrl+E patch to your local openai/codex source checkout
  3. Leaves build/run of Codex in your control
`);
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function normalizeCodexRoot(inputRoot) {
  const directRoot = inputRoot;
  const codexRsRoot = path.join(inputRoot, 'codex-rs');

  if (requireFile(path.join(directRoot, 'codex-rs', 'tui', 'src', 'bottom_pane', 'chat_composer.rs'))) {
    return directRoot;
  }

  if (requireFile(path.join(codexRsRoot, 'tui', 'src', 'bottom_pane', 'chat_composer.rs'))) {
    return inputRoot;
  }

  throw new Error(
    `Could not find codex-rs/tui/src/bottom_pane/chat_composer.rs under ${inputRoot}`,
  );
}

function requireFile(filePath) {
  return existsSync(filePath);
}

async function copyCliRuntime(installRoot) {
  const targetCliDir = path.join(installRoot, 'cli');
  await fs.mkdir(installRoot, { recursive: true });
  await fs.cp(path.join(sourceCliDir, 'bin'), path.join(targetCliDir, 'bin'), {
    recursive: true,
    force: true,
  });
  await fs.cp(path.join(sourceCliDir, 'src'), path.join(targetCliDir, 'src'), {
    recursive: true,
    force: true,
  });

  await fs.chmod(path.join(targetCliDir, 'bin', 'chiron-enhance.mjs'), 0o755);
  return targetCliDir;
}

function applyPatch(codexRoot) {
  try {
    execFileSync('git', ['apply', '--check', patchPath], {
      cwd: codexRoot,
      stdio: 'pipe',
    });
  } catch (error) {
    try {
      execFileSync('git', ['apply', '--reverse', '--check', patchPath], {
        cwd: codexRoot,
        stdio: 'pipe',
      });
      return 'already-applied';
    } catch {
      throw new Error(
        `Patch does not apply cleanly in ${codexRoot}. Rebase your codex clone or apply manually.`,
      );
    }
  }

  execFileSync('git', ['apply', patchPath], {
    cwd: codexRoot,
    stdio: 'inherit',
  });
  return 'applied';
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printHelp();
    return;
  }

  if (!options.codexRoot) {
    throw new Error('Missing required argument: --codex-root /path/to/openai-codex');
  }

  if (!(await exists(patchPath))) {
    throw new Error(`Missing patch file: ${patchPath}`);
  }

  const codexRoot = normalizeCodexRoot(options.codexRoot);
  const targetCliDir = await copyCliRuntime(options.installRoot);
  const patchStatus = applyPatch(codexRoot);

  console.log(`Chiron runtime: ${targetCliDir}`);
  console.log(`Codex source: ${codexRoot}`);
  console.log(`Patch status: ${patchStatus}`);
  console.log('');
  console.log('Next steps:');
  console.log(`1. cd ${path.join(codexRoot, 'codex-rs')}`);
  console.log('2. cargo test -p codex-tui ctrl_e_');
  console.log('3. cargo build -p codex-tui');
  console.log('4. export CHIRON_ENHANCER_PATH=~/.chiron/cli/bin/chiron-enhance.mjs');
  console.log('5. cargo run --bin codex');
}

main().catch((error) => {
  console.error(`Failed to install Codex source patch: ${error.message}`);
  process.exit(1);
});

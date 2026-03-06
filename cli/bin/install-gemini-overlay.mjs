#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');
const sourceCliDir = path.join(repoRoot, 'cli');
const defaultInstallRoot = path.join(os.homedir(), '.chiron');
const defaultBinDir = path.join(os.homedir(), '.local', 'bin');

function parseArgs(argv) {
  const options = {
    installRoot: defaultInstallRoot,
    binDir: defaultBinDir,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--install-root') {
      options.installRoot = path.resolve(argv[i + 1] ?? '');
      i += 1;
      continue;
    }

    if (arg === '--bin-dir') {
      options.binDir = path.resolve(argv[i + 1] ?? '');
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
  console.log(`Chiron Gemini Overlay Installer

Usage:
  node cli/bin/install-gemini-overlay.mjs [--install-root ~/.chiron] [--bin-dir ~/.local/bin]

What it does:
  1. Copies your current global Gemini CLI into a user-owned overlay directory
  2. Copies Chiron enhancer runtime into the same install root
  3. Patches the overlay Gemini CLI with double Ctrl+E in-place enhancement
  4. Writes ~/.local/bin/gemini to launch the patched overlay everywhere
`);
}

function findGeminiRoot() {
  const geminiBin = execFileSync('which', ['gemini'], {
    encoding: 'utf8',
  }).trim();

  if (!geminiBin) {
    throw new Error('`gemini` command not found in PATH');
  }

  const realEntry = execFileSync(
    'node',
    ['-p', `require('fs').realpathSync(${JSON.stringify(geminiBin)})`],
    { encoding: 'utf8' },
  ).trim();

  const parsedWrapperRoot = (() => {
    try {
      const wrapperSource = readFileSync(realEntry, 'utf8');
      const match = wrapperSource.match(/exec node ["'](.+?\/gemini-cli)\/dist\/index\.js["'] "\$@"/);
      return match?.[1] ?? null;
    } catch {
      return null;
    }
  })();

  const candidates = [
    path.join(os.homedir(), '.npm-global', 'lib', 'node_modules', '@google', 'gemini-cli'),
    parsedWrapperRoot,
    path.dirname(path.dirname(realEntry)),
  ].filter(Boolean);

  const geminiRoot = candidates.find((candidate) => {
    return (
      existsSync(path.join(candidate, 'package.json')) &&
      existsSync(path.join(candidate, 'dist', 'src', 'ui', 'components', 'InputPrompt.js'))
    );
  });

  if (!geminiRoot) {
    throw new Error(`Could not resolve a Gemini CLI package root from ${geminiBin}`);
  }

  return {
    geminiBin,
    realEntry,
    geminiRoot,
  };
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
  return targetCliDir;
}

function patchInputPrompt(source, enhancerPath) {
  if (source.includes('CHIRON_DOUBLE_CTRL_E_TIMEOUT_MS')) {
    throw new Error('Overlay Gemini CLI already appears to be patched with Chiron');
  }

  const importAnchor = "import { useUIActions } from '../contexts/UIActionsContext.js';";
  const importBlock = `${importAnchor}
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const execFileAsync = promisify(execFile);
const CHIRON_DOUBLE_CTRL_E_TIMEOUT_MS = 500;
const CHIRON_ENHANCER_PATH = ${JSON.stringify(enhancerPath)};`;

  const refsAnchor = "    const [expandedSuggestionIndex, setExpandedSuggestionIndex] = useState(-1);";
  const refsBlock = `${refsAnchor}
    const ctrlEPressCount = useRef(0);
    const ctrlETimerRef = useRef(null);
    const ctrlEEnhancingRef = useRef(false);`;

  const callbackAnchor = `    const resetEscapeState = useCallback(() => {
        if (escapeTimerRef.current) {
            clearTimeout(escapeTimerRef.current);
            escapeTimerRef.current = null;
        }
        escPressCount.current = 0;
        setShowEscapePrompt(false);
    }, []);`;

  const callbackBlock = `${callbackAnchor}
    const resetCtrlEState = useCallback(() => {
        if (ctrlETimerRef.current) {
            clearTimeout(ctrlETimerRef.current);
            ctrlETimerRef.current = null;
        }
        ctrlEPressCount.current = 0;
    }, []);
    const runChironEnhancer = useCallback(async (rawInput) => {
        const { stdout: enhancedText } = await execFileAsync('node', [CHIRON_ENHANCER_PATH, rawInput], {
            cwd: config.getTargetDir(),
            env: { ...process.env },
            maxBuffer: 10 * 1024 * 1024,
        });
        return enhancedText.trim();
    }, [config]);
    const handleCtrlEEnhanceInPlace = useCallback(async () => {
        if (ctrlEEnhancingRef.current) {
            return;
        }
        const rawInput = buffer.text.trim();
        if (!rawInput) {
            return;
        }
        ctrlEEnhancingRef.current = true;
        const savedInput = rawInput;
        buffer.setText('🏹 Chiron enhancing... (' + savedInput + ')');
        buffer.move('end');
        try {
            const enhancedText = await runChironEnhancer(savedInput);
            if (!enhancedText) {
                buffer.setText(savedInput);
                buffer.move('end');
                return;
            }
            buffer.setText(enhancedText);
            buffer.move('end');
            resetCompletionState();
            resetReverseSearchCompletionState();
            resetCommandSearchCompletionState();
            setExpandedSuggestionIndex(-1);
        }
        catch (error) {
            buffer.setText(savedInput);
            buffer.move('end');
            const message = error instanceof Error ? error.message : 'Chiron enhancement failed';
            setQueueErrorMessage(\`Chiron enhance failed: \${message}\`);
        }
        finally {
            ctrlEEnhancingRef.current = false;
        }
    }, [
        buffer,
        resetCompletionState,
        resetReverseSearchCompletionState,
        resetCommandSearchCompletionState,
        runChironEnhancer,
        setQueueErrorMessage,
    ]);`;

  const cleanupAnchor = `    useEffect(() => () => {
        if (escapeTimerRef.current) {
            clearTimeout(escapeTimerRef.current);
        }
        if (pasteTimeoutRef.current) {
            clearTimeout(pasteTimeoutRef.current);
        }
    }, []);`;

  const cleanupBlock = `    useEffect(() => () => {
        if (escapeTimerRef.current) {
            clearTimeout(escapeTimerRef.current);
        }
        if (pasteTimeoutRef.current) {
            clearTimeout(pasteTimeoutRef.current);
        }
        if (ctrlETimerRef.current) {
            clearTimeout(ctrlETimerRef.current);
        }
    }, []);`;

  const keyResetAnchor = `        // Reset ESC count and hide prompt on any non-ESC key
        if (key.name !== 'escape') {
            if (escPressCount.current > 0 || showEscapePrompt) {
                resetEscapeState();
            }
        }`;

  const keyResetBlock = `${keyResetAnchor}
        const isChironCtrlE = key.name === 'e' && key.ctrl === true && !key.meta && !key.shift;
        if (!isChironCtrlE && ctrlEPressCount.current > 0) {
            resetCtrlEState();
        }`;

  const endAnchor = `        if (keyMatchers[Command.END](key)) {
            buffer.move('end');
            return;
        }`;

  const endBlock = `        if (isChironCtrlE) {
            if (ctrlEPressCount.current === 0) {
                ctrlEPressCount.current = 1;
                buffer.move('end');
                if (ctrlETimerRef.current) {
                    clearTimeout(ctrlETimerRef.current);
                }
                ctrlETimerRef.current = setTimeout(() => {
                    resetCtrlEState();
                }, CHIRON_DOUBLE_CTRL_E_TIMEOUT_MS);
            }
            else {
                resetCtrlEState();
                void handleCtrlEEnhanceInPlace();
            }
            return;
        }
        if (keyMatchers[Command.END](key)) {
            buffer.move('end');
            return;
        }`;

  let patched = source;
  for (const [anchor, replacement] of [
    [importAnchor, importBlock],
    [refsAnchor, refsBlock],
    [callbackAnchor, callbackBlock],
    [cleanupAnchor, cleanupBlock],
    [keyResetAnchor, keyResetBlock],
    [endAnchor, endBlock],
  ]) {
    if (!patched.includes(anchor)) {
      throw new Error(`Unable to patch overlay Gemini CLI: missing anchor\n${anchor}`);
    }
    patched = patched.replace(anchor, replacement);
  }

  return patched;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printHelp();
    return;
  }

  const installRoot = options.installRoot;
  const binDir = options.binDir;
  const overlayGeminiRoot = path.join(installRoot, 'gemini-cli');

  const { geminiRoot } = findGeminiRoot();
  await fs.mkdir(installRoot, { recursive: true });
  await fs.rm(overlayGeminiRoot, { recursive: true, force: true });
  await fs.cp(geminiRoot, overlayGeminiRoot, { recursive: true, force: true });

  const overlayCliDir = await copyCliRuntime(installRoot);
  const enhancerPath = path.join(overlayCliDir, 'bin', 'chiron-enhance.mjs');
  const inputPromptPath = path.join(
    overlayGeminiRoot,
    'dist',
    'src',
    'ui',
    'components',
    'InputPrompt.js',
  );

  const originalSource = await fs.readFile(inputPromptPath, 'utf8');
  const patchedSource = patchInputPrompt(originalSource, enhancerPath);
  await fs.writeFile(inputPromptPath, patchedSource, 'utf8');

  execFileSync('node', ['--check', inputPromptPath], { stdio: 'inherit' });

  await fs.mkdir(binDir, { recursive: true });
  const wrapperPath = path.join(binDir, 'gemini');
  const wrapper = `#!/bin/sh
exec node ${JSON.stringify(path.join(overlayGeminiRoot, 'dist', 'index.js'))} "$@"
`;
  await fs.writeFile(wrapperPath, wrapper, { mode: 0o755 });
  await fs.chmod(wrapperPath, 0o755);

  const version = JSON.parse(
    await fs.readFile(path.join(overlayGeminiRoot, 'package.json'), 'utf8'),
  ).version;

  console.log('Installed Chiron Gemini overlay.');
  console.log(`Overlay root: ${overlayGeminiRoot}`);
  console.log(`Chiron runtime: ${overlayCliDir}`);
  console.log(`Wrapper command: ${wrapperPath}`);
  console.log(`Gemini CLI version: ${version}`);
  console.log('');
  console.log('Usage in any directory:');
  console.log('1. Start `gemini`.');
  console.log('2. Type a rough request.');
  console.log('3. Press Ctrl+E once to move to end of line.');
  console.log('4. Press Ctrl+E again within 500ms to replace the input with an enhanced prompt.');
}

main().catch((error) => {
  console.error(`Failed to install Chiron Gemini overlay: ${error.message}`);
  process.exit(1);
});

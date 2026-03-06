#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');
const sourceCliDir = path.join(repoRoot, 'cli');
const defaultInstallRoot = path.join(os.homedir(), '.chiron');

function parseArgs(argv) {
  const options = {
    installRoot: defaultInstallRoot,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

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
  console.log(`Chiron Gemini In-Place Enhancer Installer

Usage:
  node cli/bin/install-gemini-inplace-enhance.mjs [--install-root ~/.chiron]

What it does:
  1. Copies Chiron enhancer files into a stable install directory
  2. Backs up your global Gemini CLI InputPrompt.js
  3. Patches Gemini CLI so double Ctrl+E enhances the current input in place

After install:
  - Ctrl+E once: normal move-to-end
  - Ctrl+E twice within 500ms: replace the current input with an enhanced prompt
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

function findGeminiRoot() {
  const geminiBin = execFileSync('which', ['gemini'], {
    encoding: 'utf8',
  }).trim();

  if (!geminiBin) {
    throw new Error('`gemini` command not found in PATH');
  }

  const realEntry = execFileSync('node', ['-p', `require('fs').realpathSync(${JSON.stringify(geminiBin)})`], {
    encoding: 'utf8',
  }).trim();

  const geminiRoot = path.dirname(path.dirname(realEntry));
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
    throw new Error('Gemini CLI already appears to be patched with Chiron in-place enhancement');
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
        try {
            const enhancedText = await runChironEnhancer(rawInput);
            if (!enhancedText) {
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
      throw new Error(`Unable to patch Gemini CLI: missing anchor\n${anchor}`);
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
  const targetCliDir = await copyCliRuntime(installRoot);
  const enhancerPath = path.join(targetCliDir, 'bin', 'chiron-enhance.mjs');

  const { geminiRoot } = findGeminiRoot();
  const inputPromptPath = path.join(
    geminiRoot,
    'dist',
    'src',
    'ui',
    'components',
    'InputPrompt.js',
  );

  if (!(await exists(inputPromptPath))) {
    throw new Error(`Could not find Gemini CLI InputPrompt.js at ${inputPromptPath}`);
  }

  const originalSource = await fs.readFile(inputPromptPath, 'utf8');
  const patchedSource = patchInputPrompt(originalSource, enhancerPath);

  const packageJsonPath = path.join(geminiRoot, 'package.json');
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
  const backupDir = path.join(
    installRoot,
    'backups',
    `gemini-cli-${packageJson.version}-${Date.now()}`,
  );

  await fs.mkdir(backupDir, { recursive: true });
  await fs.writeFile(path.join(backupDir, 'InputPrompt.js.original'), originalSource, 'utf8');
  await fs.writeFile(inputPromptPath, patchedSource, 'utf8');

  execFileSync('node', ['--check', inputPromptPath], { stdio: 'inherit' });

  console.log('Installed Chiron in-place enhancement into global Gemini CLI.');
  console.log(`Gemini root: ${geminiRoot}`);
  console.log(`Chiron runtime: ${targetCliDir}`);
  console.log(`Backup saved: ${backupDir}`);
  console.log('');
  console.log('Usage in any directory:');
  console.log('1. Start `gemini`.');
  console.log('2. Type a rough request.');
  console.log('3. Press Ctrl+E once to move to end of line.');
  console.log('4. Press Ctrl+E again within 500ms to replace the input with an enhanced prompt.');
}

main().catch((error) => {
  console.error(`Failed to install Chiron in-place enhancement: ${error.message}`);
  process.exit(1);
});

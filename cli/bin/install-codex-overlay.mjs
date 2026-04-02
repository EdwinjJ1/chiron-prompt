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
    'double-ctrl-e-enhance-in-place.patch'
);
const codexPatchedCommit = '5ceff6588ef67aaac34f9461411b90f65e42b4f9';
const defaultInstallRoot = path.join(os.homedir(), '.chiron');
const localBinDir = path.join(os.homedir(), '.local', 'bin');

async function exists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

function checkDependencies() {
    try {
        execFileSync('git', ['--version'], { stdio: 'ignore' });
    } catch {
        throw new Error('git is not installed or not in PATH');
    }

    try {
        execFileSync('cargo', ['--version'], { stdio: 'ignore' });
    } catch {
        throw new Error('cargo (Rust toolchain) is not installed or not in PATH. Please install from https://rustup.rs/');
    }
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

function cloneAndPatchCodex(targetDir) {
    console.log(`Fetching openai/codex at compatible commit ${codexPatchedCommit}...`);
    execFileSync('git', ['init', targetDir], {
        stdio: 'inherit',
    });
    execFileSync('git', ['remote', 'add', 'origin', 'https://github.com/openai/codex.git'], {
        cwd: targetDir,
        stdio: 'inherit',
    });
    execFileSync('git', ['fetch', '--depth=1', 'origin', codexPatchedCommit], {
        cwd: targetDir,
        stdio: 'inherit',
    });
    execFileSync('git', ['checkout', '--detach', 'FETCH_HEAD'], {
        cwd: targetDir,
        stdio: 'inherit',
    });

    console.log('Applying Chiron patch for double Ctrl+E...');
    try {
        execFileSync('git', ['apply', '--check', patchPath], {
            cwd: targetDir,
            stdio: 'pipe',
        });
    } catch (error) {
        try {
            execFileSync('git', ['apply', '--reverse', '--check', patchPath], {
                cwd: targetDir,
                stdio: 'pipe',
            });
            console.log('Patch already applied.');
            return;
        } catch {
            throw new Error(`Patch does not apply cleanly in ${targetDir}.`);
        }
    }

    execFileSync('git', ['apply', patchPath], {
        cwd: targetDir,
        stdio: 'inherit',
    });
}

function buildCodex(targetDir) {
    const codexRsDir = path.join(targetDir, 'codex-rs');
    console.log('Building Codex binary (this may take a few minutes)...');
    execFileSync('cargo', ['build', '--release', '--bin', 'codex'], {
        cwd: codexRsDir,
        stdio: 'inherit',
    });

    return path.join(codexRsDir, 'target', 'release', 'codex');
}

async function installWrapperScript(installRoot, codexBinaryPath) {
    await fs.mkdir(localBinDir, { recursive: true });
    const wrapperPath = path.join(localBinDir, 'codex');

    const chironEnhancePath = path.join(installRoot, 'cli', 'bin', 'chiron-enhance.mjs');

    const scriptContent = `#!/usr/bin/env bash
export CHIRON_ENHANCER_PATH="${chironEnhancePath}"
export CHIRON_ENHANCE_BACKEND="\${CHIRON_ENHANCE_BACKEND:-gemini}"
exec "${codexBinaryPath}" "$@"
`;

    await fs.writeFile(wrapperPath, scriptContent, 'utf8');
    await fs.chmod(wrapperPath, 0o755);

    return wrapperPath;
}

async function main() {
    console.log('Installing Chiron Codex Overlay...');

    if (!(await exists(patchPath))) {
        throw new Error(`Missing patch file: ${patchPath}`);
    }

    checkDependencies();

    const installRoot = defaultInstallRoot;
    const targetCliDir = await copyCliRuntime(installRoot);

    // Create a temporary directory for building codex
    const tempBuildDir = await fs.mkdtemp(path.join(os.tmpdir(), 'codex-build-'));
    console.log(`Using temporary build directory: ${tempBuildDir}`);

    try {
        cloneAndPatchCodex(tempBuildDir);
        const compiledBinaryPath = buildCodex(tempBuildDir);

        // Copy the compiled binary permanently to ~/.chiron/bin/codex
        const targetBinDir = path.join(installRoot, 'bin');
        await fs.mkdir(targetBinDir, { recursive: true });

        // the target binary path is where it will live forever
        const finalCodexBinary = path.join(targetBinDir, 'codex');
        await fs.cp(compiledBinaryPath, finalCodexBinary);
        await fs.chmod(finalCodexBinary, 0o755);

        // Create the wrapper script in ~/.local/bin/codex
        const wrapperPath = await installWrapperScript(installRoot, finalCodexBinary);

        console.log('\\n✅ Installation successful!');
        console.log(`Codex patched binary installed to: ${finalCodexBinary}`);
        console.log(`Chiron runtime installed to: ${targetCliDir}`);
        console.log(`Wrapper installed to: ${wrapperPath}`);
        console.log('\\nNext steps:');
        console.log('1. Open a new terminal (or run `hash -r`)');
        console.log('2. Type `codex` in any project');
        console.log('3. Type your prompt and press Ctrl+E twice quickly to enhance it in-place.');
    } finally {
        // Clean up temporary build directory
        console.log(`Cleaning up temporary build directory...`);
        await fs.rm(tempBuildDir, { recursive: true, force: true });
    }
}

main().catch((error) => {
    console.error(`\\n❌ Failed to install Codex overlay: ${error.message}`);
    process.exit(1);
});

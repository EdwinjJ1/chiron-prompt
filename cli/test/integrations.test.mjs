/**
 * Integration-shape tests for chiron-enhance.
 *
 * Each test invokes cli/bin/chiron-enhance.mjs EXACTLY the way a real host
 * CLI integration does, so regressions that would freeze or break the
 * Ctrl+E enhance-in-place flow are caught here:
 *
 *   1. Gemini CLI overlay  — execFile('node', [enhancer, rawInput]) with an
 *      open stdin pipe that is never written or closed (promisified execFile).
 *   2. claw-code (Rust)    — `chiron-enhance --inline` with the prompt piped
 *      to stdin, then stdin closed.
 *   3. Codex TUI (Rust)    — Command::output(): argv prompt, stdin is null.
 *
 * All tests use CHIRON_ENHANCE_BACKEND=local for determinism; the backend
 * choice does not change the argv/stdin handling under test.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);
const BIN = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'bin', 'chiron-enhance.mjs');
const ENV = { ...process.env, CHIRON_ENHANCE_BACKEND: 'local' };
const HANG_GUARD_MS = 8000;

function withHangGuard(promise, what) {
    return Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`${what} hung — Ctrl+E would freeze in the host CLI`)), HANG_GUARD_MS),
        ),
    ]);
}

test('gemini overlay shape: execFile + argv + silent open stdin pipe', async () => {
    // Mirrors ~/.chiron/gemini-cli InputPrompt.js runChironEnhancer().
    const { stdout } = await withHangGuard(
        execFileAsync('node', [BIN, 'fix login bug'], {
            cwd: process.cwd(),
            env: ENV,
            maxBuffer: 10 * 1024 * 1024,
        }),
        'gemini overlay invocation',
    );
    assert.equal(stdout.trim(), 'fix login bug.');
});

test('claw-code shape: --inline with prompt piped to stdin then closed', async () => {
    // Mirrors integrations/claw-code Command::new("chiron-enhance").arg("--inline")
    const result = await withHangGuard(
        new Promise((resolve, reject) => {
            const child = spawn('node', [BIN, '--inline'], { env: ENV, stdio: ['pipe', 'pipe', 'pipe'] });
            let stdout = '';
            let stderr = '';
            child.stdout.on('data', (c) => (stdout += c));
            child.stderr.on('data', (c) => (stderr += c));
            child.on('error', reject);
            child.on('close', (code) => resolve({ code, stdout, stderr }));
            child.stdin.write('修复登录问题');
            child.stdin.end();
        }),
        'claw-code invocation',
    );
    assert.equal(result.code, 0);
    assert.equal(result.stdout, '修复登录问题。');
});

test('codex shape: argv prompt with stdin null', async () => {
    // Mirrors codex-rs Command::new(enhancer).arg(raw_input).output()
    const result = await withHangGuard(
        new Promise((resolve, reject) => {
            const child = spawn('node', [BIN, '解释这个鉴权流程'], { env: ENV, stdio: ['ignore', 'pipe', 'pipe'] });
            let stdout = '';
            child.stdout.on('data', (c) => (stdout += c));
            child.on('error', reject);
            child.on('close', (code) => resolve({ code, stdout }));
        }),
        'codex invocation',
    );
    assert.equal(result.code, 0);
    assert.equal(result.stdout, '解释这个鉴权流程。');
});

test('host CLIs get a non-empty single-line-safe enhancement for multiword prompts', async () => {
    const { stdout } = await withHangGuard(
        execFileAsync('node', [BIN, 'add', 'rate', 'limiting', 'to', 'the', 'api'], {
            env: ENV,
            maxBuffer: 10 * 1024 * 1024,
        }),
        'multi-argv invocation',
    );
    assert.equal(stdout.trim(), 'add rate limiting to the api.');
});

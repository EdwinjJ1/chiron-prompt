import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BIN = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'bin', 'chiron-enhance.mjs');

function run(args, { input = null, env = {} } = {}) {
    return new Promise((resolve, reject) => {
        const child = spawn('node', [BIN, ...args], {
            env: { ...process.env, CHIRON_ENHANCE_BACKEND: 'local', ...env },
            stdio: ['pipe', 'pipe', 'pipe'],
        });
        let stdout = '';
        let stderr = '';
        child.stdout.on('data', (c) => (stdout += c));
        child.stderr.on('data', (c) => (stderr += c));
        child.on('error', reject);
        child.on('close', (code) => resolve({ code, stdout, stderr }));
        child.stdin.on('error', () => {});
        if (input !== null) child.stdin.write(input);
        child.stdin.end();
    });
}

test('enhances an argv prompt with the local backend', async () => {
    const { code, stdout } = await run(['--inline', 'fix login bug']);
    assert.equal(code, 0);
    assert.equal(stdout, 'fix login bug.');
});

test('enhances a stdin prompt when no argv prompt is given', async () => {
    const { code, stdout } = await run(['--inline'], { input: '修复登录问题' });
    assert.equal(code, 0);
    assert.equal(stdout, '修复登录问题。');
});

test('does not hang when argv prompt given and stdin pipe stays silent', async () => {
    // spawn without ending stdin to simulate an agent holding the pipe open
    const result = await new Promise((resolve, reject) => {
        const child = spawn('node', [BIN, '--inline', 'quick check'], {
            env: { ...process.env, CHIRON_ENHANCE_BACKEND: 'local' },
            stdio: ['pipe', 'pipe', 'pipe'],
        });
        let stdout = '';
        child.stdout.on('data', (c) => (stdout += c));
        const timer = setTimeout(() => {
            child.kill('SIGKILL');
            reject(new Error('chiron-enhance hung waiting for stdin'));
        }, 8000);
        child.on('close', (code) => {
            clearTimeout(timer);
            resolve({ code, stdout });
        });
    });
    assert.equal(result.code, 0);
    assert.equal(result.stdout, 'quick check.');
});

test('strips repeated task prefixes including Chinese', async () => {
    const { code, stdout } = await run(['--inline', '任务：task: 修复登录']);
    assert.equal(code, 0);
    assert.equal(stdout, '修复登录。');
});

test('exits non-zero with usage on empty input', async () => {
    const { code, stderr } = await run(['--inline']);
    assert.equal(code, 1);
    assert.match(stderr, /Usage: chiron-enhance/);
});

test('rejects unknown backend with non-zero exit', async () => {
    const { code, stderr } = await run(['--inline', 'hello'], { env: { CHIRON_ENHANCE_BACKEND: 'nope' } });
    assert.equal(code, 1);
    assert.match(stderr, /Unsupported CHIRON_ENHANCE_BACKEND/);
});

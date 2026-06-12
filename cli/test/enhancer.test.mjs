import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Enhancer } from '../src/enhancer.mjs';

const enhancer = new Enhancer();

test('detectStrategy matches English whole words', () => {
    assert.equal(enhancer.detectStrategy('explain this function'), 'educational');
    assert.equal(enhancer.detectStrategy('review the auth module'), 'analytical');
    assert.equal(enhancer.detectStrategy('deploy the service'), 'action');
});

test('detectStrategy matches English stem variants (regression: trailing \\b)', () => {
    assert.equal(enhancer.detectStrategy('analyze the cache layer'), 'analytical');
    assert.equal(enhancer.detectStrategy('summarize this file'), 'concise');
    assert.equal(enhancer.detectStrategy('configure the linter'), 'action');
});

test('detectStrategy matches Chinese keywords (regression: \\b vs CJK)', () => {
    assert.equal(enhancer.detectStrategy('解释一下这个函数'), 'educational');
    assert.equal(enhancer.detectStrategy('分析这个性能问题'), 'analytical');
    assert.equal(enhancer.detectStrategy('部署到生产环境'), 'action');
    assert.equal(enhancer.detectStrategy('总结这次改动'), 'concise');
});

test('detectStrategy falls back to detailed', () => {
    assert.equal(enhancer.detectStrategy('fix login bug'), 'detailed');
});

test('enhance returns a full specification', () => {
    const out = enhancer.enhance({
        rawPrompt: 'fix login bug',
        strategy: 'detailed',
        projectContext: { techStack: ['Node.js'], language: 'node' },
        relevantFiles: [{ path: 'src/auth.ts', score: 12, lines: 80 }],
        gitContext: { branch: 'main', status: [], commits: [] },
    });
    assert.match(out, /Original Request/);
    assert.match(out, /fix login bug/);
    assert.match(out, /src\/auth\.ts/);
    assert.match(out, /Execution Guidance/);
});

test('enhanceInline keeps prompt intact and adds terminal punctuation', () => {
    assert.equal(enhancer.enhanceInline({ rawPrompt: 'fix login bug' }), 'fix login bug.');
    assert.equal(enhancer.enhanceInline({ rawPrompt: '修复登录问题' }), '修复登录问题。');
    assert.equal(enhancer.enhanceInline({ rawPrompt: 'done already.' }), 'done already.');
    assert.equal(enhancer.enhanceInline({ rawPrompt: '  ' }), '');
});

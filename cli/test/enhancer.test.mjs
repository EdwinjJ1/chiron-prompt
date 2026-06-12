import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Enhancer } from '../src/enhancer.mjs';

const enhancer = new Enhancer();

test('detectTaskType matches English whole words', () => {
    assert.equal(enhancer.detectTaskType('write a unit test for auth'), 'test');
    assert.equal(enhancer.detectTaskType('fix the broken redirect'), 'debug');
    assert.equal(enhancer.detectTaskType('refactor the cache layer'), 'refactor');
    assert.equal(enhancer.detectTaskType('review this module'), 'review');
    assert.equal(enhancer.detectTaskType('explain the session flow'), 'explain');
});

test('detectTaskType matches English word variants (regression: trailing \\b on stems)', () => {
    assert.equal(enhancer.detectTaskType('the request keeps failing'), 'debug');
    assert.equal(enhancer.detectTaskType('app crashes on startup'), 'debug');
    assert.equal(enhancer.detectTaskType('reviewing the changes'), 'review');
});

test('detectTaskType matches Chinese keywords (regression: \\b vs CJK)', () => {
    assert.equal(enhancer.detectTaskType('给登录写测试'), 'test');
    assert.equal(enhancer.detectTaskType('修复登录跳转'), 'debug');
    assert.equal(enhancer.detectTaskType('重构缓存模块'), 'refactor');
    assert.equal(enhancer.detectTaskType('解释一下这个函数'), 'explain');
});

test('detectTaskType falls back to general', () => {
    assert.equal(enhancer.detectTaskType('login flow'), 'general');
});

test('enhanceInline keeps prompt intact and adds terminal punctuation', () => {
    assert.equal(enhancer.enhanceInline('fix login bug'), 'fix login bug.');
    assert.equal(enhancer.enhanceInline('修复登录问题'), '修复登录问题。');
    assert.equal(enhancer.enhanceInline('done already.'), 'done already.');
    assert.equal(enhancer.enhanceInline('  '), '');
});

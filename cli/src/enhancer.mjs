/**
 * Chiron Prompt Enhancer
 * Detects task type from the raw prompt to bias context file selection.
 * Enhancement itself is delegated to Gemini (or a local no-op fallback).
 */

// ── Task type detection ───────────────────────────────────
// Used only to prioritize which repo files get sent as context.
// Never sent to Gemini as a label or strategy name.
// NOTE: \b does not work next to CJK characters (they are not \w in JS
// regex), so Chinese keywords are matched without word boundaries.
const TASK_PATTERNS = {
    test:      /\b(test\w*|spec|coverage|mock\w*|fixture|vitest|jest|pytest|e2e)\b|测试|单测/i,
    implement: /\b(add|implement\w*|build|create|write|feature)\b|实现|添加|新增/i,
    debug:     /\b(fix\w*|bug\w*|error\w*|broken|crash\w*|fail\w*|not.?working)\b|修复|报错|失败/i,
    refactor:  /\b(refactor\w*|clean\w*|reorganize|simplify)\b|重构|整理|优化/i,
    review:    /\b(review\w*|audit\w*|check\w*|look.?at)\b|审查|检查|看看/i,
    explain:   /\b(explain\w*|understand\w*|why|how.?does|what.?is)\b|解释|理解|为什么/i,
};

export class Enhancer {
    /**
     * Detect the task type from the raw prompt.
     * Returns one of: test | implement | debug | refactor | review | explain | general
     */
    detectTaskType(prompt) {
        for (const [type, regex] of Object.entries(TASK_PATTERNS)) {
            if (regex.test(prompt)) return type;
        }
        return 'general';
    }

    /**
     * Local fallback — used when CHIRON_ENHANCE_BACKEND=local.
     * Does not attempt to rewrite; just ensures the prompt has terminal punctuation.
     */
    enhanceInline(rawPrompt) {
        const locale = this._detectLocale(rawPrompt);
        return this._ensureTerminalPunctuation(rawPrompt.trim(), locale);
    }

    // ── Private helpers ────────────────────────────────────

    _detectLocale(prompt) {
        return /[\u3400-\u9fff]/.test(prompt) ? 'zh' : 'en';
    }

    _ensureTerminalPunctuation(value, locale) {
        if (!value) return value;
        if (/[.!?。！？]$/.test(value)) return value;
        return locale === 'zh' ? `${value}。` : `${value}.`;
    }
}

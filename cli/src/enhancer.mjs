/**
 * Chiron Prompt Enhancer
 * Detects task type from the raw prompt to bias context file selection.
 * Enhancement itself is delegated to Gemini (or a local no-op fallback).
 */

// ── Task type detection ───────────────────────────────────
// Used only to prioritize which repo files get sent as context.
// Never sent to Gemini as a label or strategy name.
const TASK_PATTERNS = {
    test:      /\b(test|spec|coverage|mock|fixture|vitest|jest|pytest|e2e|测试|单测)\b/i,
    implement: /\b(add|implement|build|create|write|feature|实现|添加|新增)\b/i,
    debug:     /\b(fix|bug|error|broken|crash|fail|not.?working|修复|报错|失败)\b/i,
    refactor:  /\b(refactor|clean|reorganize|simplify|重构|整理|优化)\b/i,
    review:    /\b(review|audit|check|look.?at|审查|检查|看看)\b/i,
    explain:   /\b(explain|understand|why|how.?does|what.?is|解释|理解|为什么)\b/i,
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

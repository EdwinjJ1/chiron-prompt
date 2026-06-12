/**
 * Chiron Prompt Enhancer
 * Transforms raw prompts into structured, context-rich specifications
 * using repository intelligence from the ContextEngine.
 */

// ── Strategy detection patterns ──────────────────────────
// NOTE: \b word boundaries do not work next to CJK characters (they are not
// \w in JS regex), so Chinese keywords are matched without boundaries.
const STRATEGY_PATTERNS = {
    educational: /\b(explain|teach|learn|understand|tutorial)\b|概念|教学|学习|理解|解释|原理/i,
    analytical: /\b(analyz\w*|evaluat\w*|compar\w*|assess|review|audit)\b|分析|评估|比较|审查|审计/i,
    action: /\b(setup|install|deploy|config\w*|implement|migrate|upgrade|how.?to)\b|搭建|安装|部署|配置|实现|迁移/i,
    creative: /\b(idea|brain.?storm|innovat\w*|design|prototype)\b|探索|创意|想法|头脑风暴|设计方案/i,
    professional: /\b(business|report|presentation|executive|proposal)\b|商业|报告|演示|汇报|提案/i,
    concise: /\b(summar\w*|brief|tldr|quick)\b|简洁|总结|概括|简述|精简/i,
};

// ── Strategy-specific enhancement frameworks ─────────────
const FRAMEWORKS = {
    detailed: {
        label: '📋 Detailed',
        focus: [
            'Clarify the precise goal and expected outcome',
            'Consider existing codebase patterns and conventions',
            'Identify edge cases, error scenarios, and boundary conditions',
            'Define clear acceptance criteria and deliverables',
            'Note dependencies on existing code/libraries to reuse',
        ],
        exec: 'Implement comprehensively with proper error handling, types, and tests.',
    },
    concise: {
        label: '✂️ Concise',
        focus: [
            'Strip to the essential requirement',
            'Focus only on the most relevant files',
            'Identify the smallest effective change',
        ],
        exec: 'Make the minimum viable change with clean, focused code.',
    },
    creative: {
        label: '🎨 Creative',
        focus: [
            'Consider 3+ different solution approaches',
            'Draw inspiration from patterns in other domains',
            'Identify creative constraints that spark better solutions',
            'Explore novel combinations of existing components',
        ],
        exec: 'Explore multiple approaches, prototype the most promising, explain trade-offs.',
    },
    professional: {
        label: '💼 Professional',
        focus: [
            'Identify stakeholders and business objectives',
            'Ensure industry/team quality standards are met',
            'Plan required documentation and changelog',
            'Prepare for code review expectations',
        ],
        exec: 'Follow industry standards, add documentation, prepare for code review.',
    },
    analytical: {
        label: '📊 Analytical',
        focus: [
            'Gather all relevant data and metrics first',
            'Define evaluation criteria and success metrics',
            'Compare alternative approaches systematically',
            'Provide evidence-based recommendations',
        ],
        exec: 'Analyze systematically, present findings with evidence, provide recommendations.',
    },
    educational: {
        label: '📚 Educational',
        focus: [
            'Define clear learning objectives',
            'Identify prerequisite knowledge',
            'Build complexity progressively',
            'Include practical, runnable examples',
        ],
        exec: 'Explain clearly with examples, build understanding progressively.',
    },
    action: {
        label: '🚀 Action-Oriented',
        focus: [
            'List prerequisites and pre-conditions',
            'Define clear, ordered implementation steps',
            'Add verification checkpoints after each step',
            'Include rollback/undo plan if something goes wrong',
        ],
        exec: 'Execute step by step, verify each step, report progress.',
    },
};

const INLINE_FOCUS = {
    zh: {
        detailed: [
            '先定位根因，再做最小必要改动',
            '复用现有结构、命名和项目约定',
            '处理边界情况、失败路径和回归风险',
            '完成后说明验证方式与影响范围',
        ],
        concise: [
            '只做满足目标的最小改动',
            '优先关注最相关文件和调用链',
            '避免无关重构，保持实现简单',
        ],
        creative: [
            '先比较多种可行方案再决定实现',
            '结合现有模块寻找更自然的组合方式',
            '说明方案取舍和风险',
        ],
        professional: [
            '兼顾可维护性、可审查性和团队规范',
            '明确影响范围和交付结果',
            '补充必要说明，便于代码评审',
        ],
        analytical: [
            '先定位现状和根因，再给出结论',
            '用证据比较方案或问题来源',
            '明确验证标准和判断依据',
        ],
        educational: [
            '解释关键原理和上下文',
            '按从易到难的顺序展开',
            '给出可运行或可验证的示例',
        ],
        action: [
            '按顺序执行并逐步验证',
            '先确认前置条件和依赖',
            '出现问题时给出回退或排查方向',
        ],
    },
    en: {
        detailed: [
            'Find the root cause first, then make the smallest necessary change',
            'Reuse existing architecture, naming, and project conventions',
            'Handle edge cases, failure paths, and regression risk',
            'Explain verification steps and impact after the change',
        ],
        concise: [
            'Make the smallest change that satisfies the request',
            'Focus on the most relevant files and call path',
            'Avoid unrelated refactors and keep the implementation tight',
        ],
        creative: [
            'Compare multiple viable approaches before choosing one',
            'Look for a natural solution using existing modules',
            'Call out trade-offs and risks',
        ],
        professional: [
            'Keep maintainability, reviewability, and team standards in mind',
            'Clarify scope and expected deliverable',
            'Add the context reviewers will need',
        ],
        analytical: [
            'Establish the current state and root cause before concluding',
            'Compare alternatives with evidence',
            'Define clear verification criteria',
        ],
        educational: [
            'Explain the key concepts and local context',
            'Build the explanation progressively',
            'Include concrete examples where useful',
        ],
        action: [
            'Execute in order and verify each step',
            'Check prerequisites and dependencies first',
            'Include a rollback or debugging direction if something fails',
        ],
    },
};

export class Enhancer {
    /**
     * Auto-detect the best strategy for a prompt.
     */
    detectStrategy(prompt) {
        for (const [strategy, regex] of Object.entries(STRATEGY_PATTERNS)) {
            if (regex.test(prompt)) return strategy;
        }
        return 'detailed';
    }

    /**
     * Build a fully enhanced prompt specification.
     */
    enhance({ rawPrompt, strategy, projectContext, relevantFiles, gitContext }) {
        const fw = FRAMEWORKS[strategy] || FRAMEWORKS.detailed;
        const lines = [];

        // ── Header ──
        lines.push('# 🏹 Chiron Enhanced Prompt');
        lines.push(`> **Strategy**: ${fw.label} · **Time**: ${new Date().toLocaleString()}`);
        lines.push('');

        // ── Original ──
        lines.push('## 📝 Original Request');
        lines.push('```');
        lines.push(rawPrompt);
        lines.push('```');
        lines.push('');

        // ── Project Context ──
        if (projectContext) {
            lines.push('## 🏗️ Project Context');
            lines.push(this._fmtProject(projectContext));
            lines.push('');
        }

        // ── Relevant Files ──
        if (relevantFiles?.length) {
            lines.push(`## 📂 Relevant Files (${relevantFiles.length} found)`);
            lines.push(this._fmtFiles(relevantFiles));
            lines.push('');
        }

        // ── Git Context ──
        if (gitContext?.branch) {
            lines.push('## 🔀 Git Context');
            lines.push(this._fmtGit(gitContext));
            lines.push('');
        }

        // ── Enhanced Spec ──
        lines.push('## ✨ Enhanced Specification');
        lines.push('');
        lines.push(`**Objective**: ${rawPrompt}`);
        lines.push('');
        lines.push('**Enhancement framework applied:**');
        for (const item of fw.focus) {
            lines.push(`- ${item}`);
        }
        lines.push('');

        if (relevantFiles?.length) {
            lines.push('**Key files to work with:**');
            for (const f of relevantFiles.slice(0, 5)) {
                lines.push(`- \`${f.path}\` (${f.lines || '?'} lines, relevance: ${f.score})`);
            }
            lines.push('');
        }

        if (projectContext?.techStack?.length) {
            lines.push(`**Follow ${projectContext.techStack.join(' + ')} best practices.**`);
            lines.push('');
        }

        // ── Execution Guidance ──
        lines.push('## 🎯 Execution Guidance');
        lines.push('');
        lines.push(fw.exec);
        lines.push('');
        lines.push('**Verification checklist:**');
        lines.push('- [ ] Code compiles/runs without errors');
        lines.push('- [ ] Edge cases are handled');
        lines.push('- [ ] Existing tests still pass');
        lines.push('- [ ] Changes follow project conventions');

        return lines.join('\n');
    }

    enhanceInline({ rawPrompt }) {
        // The user explicitly requested not to inject template-like context metadata
        // (stack, files, focus areas) into the inline output.
        // For the local fallback, we now simply return the original prompt nicely.
        // For actual rewriting, CHIRON_ENHANCE_BACKEND=gemini should be used to 
        // organically rewrite the prompt.
        const locale = this._detectLocale(rawPrompt);
        return this._ensureTerminalPunctuation(rawPrompt, locale);
    }

    // ── Private formatters ─────────────────────────────────

    _detectLocale(prompt) {
        return /[\u3400-\u9fff]/.test(prompt) ? 'zh' : 'en';
    }

    _ensureTerminalPunctuation(prompt, locale) {
        const value = prompt.trim();
        if (!value) return value;
        if (/[.!?。！？]$/.test(value)) return value;
        return locale === 'zh' ? `${value}。` : `${value}.`;
    }

    _getInlineStack(ctx) {
        if (ctx?.techStack?.length) {
            return ctx.techStack.join(' + ');
        }

        const values = [ctx?.framework, ctx?.language].filter(Boolean);
        return values.length > 0 ? values.join(' + ') : null;
    }

    _getInlineFocus(strategy, locale) {
        const copy = INLINE_FOCUS[locale] || INLINE_FOCUS.en;
        return copy[strategy] || copy.detailed;
    }

    _fmtProject(ctx) {
        const l = [];
        if (ctx.language) l.push(`- **Language**: ${ctx.language}`);
        if (ctx.framework) l.push(`- **Framework**: ${ctx.framework}`);
        if (ctx.techStack?.length) l.push(`- **Stack**: ${ctx.techStack.join(', ')}`);

        const pkg = ctx.keyFiles?.['package.json'];
        if (pkg) {
            l.push(`- **Package**: ${pkg.name || '?'}@${pkg.version || '?'}`);
            if (pkg.scripts?.length) l.push(`- **Scripts**: \`${pkg.scripts.join('`, `')}\``);
        }

        if (ctx.structure?.length) {
            l.push('');
            l.push('<details><summary><strong>Directory structure</strong></summary>');
            l.push('');
            l.push('```');
            const dirs = ctx.structure.filter(e => e.type === 'dir').slice(0, 25);
            const files = ctx.structure.filter(e => e.type === 'file').slice(0, 25);
            for (const d of dirs) l.push(`📁 ${d.path}/  (${d.children} items)`);
            for (const f of files) l.push(`📄 ${f.path}`);
            if (ctx.structure.length > 50) l.push(`… and ${ctx.structure.length - 50} more`);
            l.push('```');
            l.push('');
            l.push('</details>');
        }

        return l.join('\n');
    }

    _fmtFiles(files) {
        const l = [];
        for (const f of files) {
            l.push(`### \`${f.path}\` (score: ${f.score})`);
            if (f.content) {
                l.push('```');
                l.push(f.content);
                l.push('```');
            }
            l.push('');
        }
        return l.join('\n');
    }

    _fmtGit(git) {
        const l = [];
        l.push(`- **Branch**: \`${git.branch}\``);
        if (git.status?.length) {
            l.push(`- **Dirty files**: ${git.status.length}`);
            for (const s of git.status.slice(0, 5)) l.push(`  - \`${s.trim()}\``);
        }
        if (git.commits?.length) {
            l.push('- **Recent commits**:');
            for (const c of git.commits.slice(0, 5)) l.push(`  - ${c}`);
        }
        return l.join('\n');
    }
}

import type {
  EnhanceInput,
  EnhancementFramework,
  EnhancementStrategy,
  RelevantFile
} from './types.js';

const STRATEGY_PATTERNS: Record<Exclude<EnhancementStrategy, 'detailed'>, RegExp> = {
  educational: /\b(explain|teach|learn|understand|tutorial|概念|教学|学习|理解|解释|原理)\b/i,
  analytical: /\b(analyz|evaluat|compar|assess|review|audit|分析|评估|比较|审查|审计)\b/i,
  action: /\b(setup|install|deploy|config|implement|migrate|upgrade|搭建|安装|部署|配置|实现|迁移|how.?to)\b/i,
  creative: /\b(idea|brain.?storm|innovat|design|prototype|探索|创意|想法|头脑风暴|设计方案)\b/i,
  professional: /\b(business|report|presentation|executive|proposal|商业|报告|演示|汇报|提案)\b/i,
  concise: /\b(summar|brief|tldr|quick|简洁|总结|概括|简述|精简)\b/i
};

const FRAMEWORKS: Record<EnhancementStrategy, EnhancementFramework> = {
  detailed: {
    label: 'Detailed',
    focus: [
      'Clarify precise outcome and acceptance criteria',
      'Reuse existing architecture and patterns',
      'Handle edge cases and failure paths',
      'Preserve security, types, and maintainability'
    ],
    executionHint: 'Implement comprehensively and include verification steps.'
  },
  concise: {
    label: 'Concise',
    focus: [
      'Keep only the essential requirement',
      'Touch the smallest set of files',
      'Prefer low-risk minimal changes'
    ],
    executionHint: 'Deliver minimal diff with direct impact.'
  },
  creative: {
    label: 'Creative',
    focus: [
      'Generate multiple solution approaches',
      'Select the best trade-off for this codebase',
      'Justify non-obvious design decisions'
    ],
    executionHint: 'Explore options quickly, then commit to one clear path.'
  },
  professional: {
    label: 'Professional',
    focus: [
      'Align with business and team standards',
      'Make review-ready, documented changes',
      'Reduce regression risk'
    ],
    executionHint: 'Implement with production-quality standards.'
  },
  analytical: {
    label: 'Analytical',
    focus: [
      'Gather evidence before changing code',
      'Compare alternatives with constraints',
      'State assumptions explicitly'
    ],
    executionHint: 'Provide evidence-driven implementation choices.'
  },
  educational: {
    label: 'Educational',
    focus: [
      'Explain rationale in plain language',
      'Move from concept to implementation gradually',
      'Include clear verification guidance'
    ],
    executionHint: 'Teach through implementation without sacrificing quality.'
  },
  action: {
    label: 'Action-Oriented',
    focus: [
      'Sequence the execution into explicit steps',
      'Validate after each step',
      'Provide rollback awareness'
    ],
    executionHint: 'Execute as a checklist with checkpoints.'
  }
};

export class Enhancer {
  public detectStrategy(prompt: string): EnhancementStrategy {
    for (const [strategy, pattern] of Object.entries(STRATEGY_PATTERNS)) {
      if (pattern.test(prompt)) {
        return strategy as EnhancementStrategy;
      }
    }

    return 'detailed';
  }

  public enhance(input: EnhanceInput): string {
    const framework = FRAMEWORKS[input.strategy] ?? FRAMEWORKS.detailed;
    const lines: string[] = [];

    lines.push(this.buildObjective(input.rawPrompt));

    if (input.projectContext?.techStack.length) {
      lines.push(`Project stack: ${input.projectContext.techStack.join(' + ')}.`);
    }

    if (input.projectContext?.framework) {
      lines.push(`Primary framework: ${input.projectContext.framework}.`);
    }

    if (input.relevantFiles?.length) {
      lines.push(`Relevant files: ${this.formatFiles(input.relevantFiles)}.`);
    }

    if (input.gitContext?.branch) {
      lines.push(`Current branch: ${input.gitContext.branch}.`);
    }

    lines.push('Focus areas:');
    for (const focus of framework.focus) {
      lines.push(`- ${focus}`);
    }

    lines.push('Execution requirements:');
    lines.push(`- Strategy: ${framework.label}`);
    lines.push(`- ${framework.executionHint}`);
    lines.push('- Preserve existing conventions and avoid unrelated refactors.');
    lines.push('- Verify changed flows and edge cases before completion.');

    return lines.join('\n');
  }

  private buildObjective(rawPrompt: string): string {
    let normalized = rawPrompt.trim();
    while (/^task:\s*/i.test(normalized)) {
      normalized = normalized.replace(/^task:\s*/i, '').trim();
    }

    if (!normalized) {
      return 'Task: Improve this request into an actionable engineering specification.';
    }

    return `Task: ${normalized}`;
  }

  private formatFiles(files: RelevantFile[]): string {
    return files
      .slice(0, 6)
      .map((file) => `${file.path} (score ${file.score})`)
      .join(', ');
  }
}

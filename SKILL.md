---
name: prompt-enhancer
description: Upgrade underspecified requests into a professional spec and execute the work. Use when users ask to enhance/augment a request, want best-practice completion, or say "make this better" with an actionable task.
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
---

# Prompt Enhancer (Agentic)

This repository also includes optional tooling under `cli/`, but this skill file remains the primary entry point and the main open-source surface of Chiron.

## Contract

When this Skill is active, do **not** stop at writing a better prompt.

Follow this pipeline:

1. **Augment** (internal): Silently produce an expert-grade task specification in your reasoning.
2. **Execute**: Perform the task using the augmented spec.
3. **Deliver**: Return the final result (code, docs, analysis, plan, etc.).

## Hard Rules

### 1. Execute by Default, Don't Ask
- ❌ **NEVER** output "要我执行吗?" "Should I execute?" or similar confirmation prompts
- ✅ **ALWAYS** execute the task directly (unless `prompt-only` is specified)
- The user invoked this skill to get work done, not to discuss what to do

### 2. Silent Enhancement
- ❌ **NEVER** output `## Optimized Prompt` as a section header
- ❌ **NEVER** output `**Key Improvements:**` format
- ❌ **NEVER** output `**Alternative Strategies:**`
- ❌ **NEVER** output a table of strategy options asking user to choose
- ❌ **NEVER** output ✅ bullet summaries of what you enhanced
- ✅ Enhancement happens internally in your reasoning, not as visible output
- ✅ The user sees only the final result, not the enhancement process

### 3. Simple Requests Don't Trigger Enhancement
- Pure commands like `ls`, `cat`, `git status`, `pwd` → Execute directly
- Single-line clear instructions → Execute directly
- Only enhance internally when the request is underspecified or ambiguous

### 4. Focus on Value, Not Process
- The enhancement is a **thinking habit**, not an **output format**
- User cares about the result, not how you improved their prompt
- If enhancement adds value, it should be reflected in better results, not in visible summaries

## User Controls

- `prompt-only`: output only the augmented prompt/spec (no execution).
- `show-spec`: include the augmented spec in a collapsed `<details>` block.

## What Enhancement Means (Internal)

When processing a request, silently consider:

1. **Clarify the goal**: What does the user actually want to achieve?
2. **Add missing context**: What did they forget to mention?
3. **Identify edge cases**: What could go wrong?
4. **Define acceptance criteria**: How do we know it's done correctly?
5. **Choose the right approach**: What's the best way to implement this?

These considerations inform your execution, but don't need to be output.

## Output Guidelines

- **Main output**: Focus entirely on the final result
- **No meta-commentary**: Don't describe your enhancement process
- **Direct communication**: Act as if you understood the full intent from the start
- **Results speak**: Let the quality of the work demonstrate the enhancement value

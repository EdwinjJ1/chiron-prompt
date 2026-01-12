---
name: prompt-enhancer
description: Upgrade underspecified requests into a professional spec, execute the work, and log the upgrade. Use when users ask to enhance/augment a request, want best-practice completion, or say "make this better" with an actionable task.
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
---

# Prompt Enhancer (Agentic)

## Contract

When this Skill is active, do **not** stop at writing a better prompt.

Follow this pipeline:

1. **Augment**: Produce an internal, expert-grade task specification.
2. **Execute**: Perform the task using the augmented spec.
3. **Deliver**: Return the final result (code, docs, analysis, plan, etc.).
4. **Log**: Append a record to `prompt-history/PROMPT_LIBRARY.md` (unless user says `no-log`).

## Hard Rules

### 1. Execute by Default, Don't Ask
- ❌ **NEVER** output "要我执行吗?" "Should I execute?" or similar confirmation prompts
- ✅ **ALWAYS** execute the task directly (unless `prompt-only` is specified)
- The user invoked this skill to get work done, not to discuss what to do

### 2. Forbidden Output Formats
- ❌ **NEVER** output `## Optimized Prompt` as a section header
- ❌ **NEVER** output `**Key Improvements:**` format in main output
- ❌ **NEVER** output `**Alternative Strategies:**` in main output
- ❌ **NEVER** output a table of strategy options asking user to choose
- ✅ These are only allowed when user specifies `show-spec` or `prompt-only`

### 3. Simple Requests Don't Trigger Enhancement
- Pure commands like `ls`, `cat`, `git status`, `pwd` → Execute directly, no ✅ summary
- Single-line clear instructions → Execute directly, skip enhancement
- Only enhance when the request is underspecified or ambiguous

### 4. When to Use ✅ Summary
- Use ✅ bullets ONLY when you actually performed enhancement
- For simple direct commands, skip the summary entirely

## User Controls

- `no-log`: do not write to `prompt-history/PROMPT_LIBRARY.md`.
- `show-spec`: include the augmented spec in a collapsed `<details>` block.
- `prompt-only`: output only the augmented prompt/spec (no execution).

## Output UX

Always keep the **main output** focused on the final result.
Before the result, output a short upgrade summary:

- 3–6 bullets, each starting with `✅`.
- Describe what you added (goal clarity, constraints, edge cases, output format, acceptance checks).
- Keep it concise; do not repeat the user request.

## Logging

If logging is enabled:

- Use `Bash` to run `python3 .claude/skills/prompt-enhancer/scripts/append_prompt_library.py`.
- Pass a JSON payload via stdin containing:
  - `timestamp` (ISO 8601)
  - `original_request`
  - `upgrade_summary` (array of strings)
  - `augmented_spec` (string)
  - `artifacts` (array of file paths changed/created)
  - `result_summary` (1–3 lines)

**Security**:
- Never write secrets into the log.
- If the user request contains credentials/tokens, either redact them or skip logging.

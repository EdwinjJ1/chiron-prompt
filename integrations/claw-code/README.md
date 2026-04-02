# Chiron x Claw Code — Double Ctrl+E Prompt Enhancement

Integrate Chiron's prompt enhancement into [claw-code](https://github.com/instructkr/claw-code) (an open-source Claude Code alternative) via a **double Ctrl+E** keybinding in the REPL.

## How It Works

```
User types a prompt in claw REPL
         │
         ├── Enter ────────────────► Submit as-is
         │
         └── Ctrl+E Ctrl+E ───────► Enhance via chiron-enhance
                    │                   (repo context + strategy)
                    │
                    ▼
            Enhanced prompt submitted to Claude
```

1. **First Ctrl+E**: Clears the current input (same as Ctrl+C)
2. **Second Ctrl+E** (within 500ms): Captures the input text, pipes it through `chiron-enhance --inline`, and submits the enhanced version

## Install

### Prerequisites

- [claw-code](https://github.com/instructkr/claw-code) cloned and built
- [Chiron CLI](../../cli/) installed and `chiron-enhance` in PATH

### Step 1: Install chiron-enhance

```bash
cd chiron-prompt/cli
npm link
# Verify:
chiron-enhance --help
```

### Step 2: Apply the patch

```bash
cd /path/to/claw-code
git apply /path/to/chiron-prompt/integrations/claw-code/ctrl-e-enhance.patch
```

### Step 3: Build

```bash
cd rust
cargo build --package rusty-claude-cli --release
```

### Step 4: Run

```bash
./target/release/claw
# Type a prompt, then press Ctrl+E twice quickly to enhance it
```

## Configuration

Set the enhancement backend via environment variable:

```bash
# Use Gemini CLI for rewriting (default, recommended)
export CHIRON_ENHANCE_BACKEND=gemini

# Use local strategy detection only (no LLM call)
export CHIRON_ENHANCE_BACKEND=local
```

## Architecture

The patch modifies two files in `rusty-claude-cli`:

| File | Change |
|------|--------|
| `src/input.rs` | Bind Ctrl+E to `Cmd::Interrupt`, detect double-press via timing state machine |
| `src/main.rs` | Handle `ReadOutcome::Enhance`, call external `chiron-enhance` binary |

### Double-Press Detection

```
Ctrl+E (first) ──► Cancel current input, record timestamp
                         │
    Ctrl+E within 500ms ─┤
                         ▼
              ReadOutcome::Enhance(text)
                         │
                         ▼
              chiron-enhance --inline
                         │
                         ▼
              Enhanced prompt → Submit
```

The integration is **loosely coupled** — claw-code only calls `chiron-enhance` as an external binary. If it's not in PATH, the original prompt is submitted unchanged.

## Keybinding Reference

| Key | Action |
|-----|--------|
| `Enter` | Submit prompt |
| `Ctrl+C` | Clear input / Exit on empty |
| `Ctrl+J` / `Shift+Enter` | Insert newline |
| `Ctrl+E` `Ctrl+E` | Enhance prompt with Chiron |

## License

MIT — same as Chiron and claw-code.

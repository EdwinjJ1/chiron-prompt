# Chiron x Claw Code — Ctrl+E Prompt Enhancement

Add prompt enhancement to [claw-code](https://github.com/instructkr/claw-code) (open-source Claude Code) via **Ctrl+E** in the REPL.

## How It Works

```
User types a prompt in claw REPL
         │
         ├── Enter ───────► Submit as-is
         │
         └── Ctrl+E ──────► Enhance via chiron-enhance
                │               (repo context + strategy)
                ▼
        Enhanced prompt pre-filled in input box
        User can keep editing → Enter to submit
```

**Single Ctrl+E** — no double-press needed. The enhanced text replaces your input so you can review and edit before submitting.

## One-Line Install

```bash
curl -fsSL https://raw.githubusercontent.com/EdwinjJ1/chiron-prompt/main/integrations/claw-code/install.sh | bash
```

This will:
1. Clone claw-code (or use your existing clone with `--claw-dir`)
2. Apply the Ctrl+E enhancement patch
3. Build with `cargo`
4. Install `claw-chiron` launcher to `~/.local/bin/`

### Prerequisites

- [Rust](https://rustup.rs/) (`cargo` in PATH)
- [chiron-enhance](../../cli/) (`npm link` from `chiron-prompt/cli/`)

```bash
# Install chiron-enhance first
git clone https://github.com/EdwinjJ1/chiron-prompt.git ~/.chiron
cd ~/.chiron/cli && npm link
```

### Using an Existing Clone

If you already have claw-code cloned:

```bash
./install.sh --claw-dir /path/to/claw-code
```

### Update After Upstream Changes

```bash
claw-chiron-update
```

Or re-run with `--update`:

```bash
./install.sh --claw-dir /path/to/claw-code --update
```

## Usage

```bash
claw-chiron
```

Inside the REPL:

| Key | Action |
|-----|--------|
| `Enter` | Submit prompt |
| `Ctrl+E` | Enhance prompt, pre-fill result for editing |
| `Ctrl+C` | Exit (on empty input) |
| `Ctrl+J` / `Shift+Enter` | Insert newline |

## Configuration

```bash
# Use Gemini CLI for rewriting (default, recommended)
export CHIRON_ENHANCE_BACKEND=gemini

# Use local strategy only (no LLM call)
export CHIRON_ENHANCE_BACKEND=local
```

## Architecture

The patch modifies three files:

| File | Change |
|------|--------|
| `input.rs` | Bind Ctrl+E → `Cmd::Interrupt`, capture input as `ReadOutcome::Enhance` |
| `main.rs` | Handle `Enhance` → call `chiron-enhance --inline` → re-open input with `readline_with_initial` |
| `config.rs` | Skip non-string hook entries (compatibility with new Claude Code settings format) |

The integration is **loosely coupled** — claw-code calls `chiron-enhance` as an external binary. If it's not installed, Ctrl+E falls back to the original prompt.

## License

MIT — same as Chiron and claw-code.

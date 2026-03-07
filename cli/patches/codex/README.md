# Codex CLI Patch: Double Ctrl+E Enhance In Place

This patch targets the open-source `openai/codex` TUI source tree and adds the same in-place prompt enhancement flow that Chiron already supports for Gemini CLI.

## Behavior

- `Ctrl+E` once: keep Codex's normal move-to-end behavior
- `Ctrl+E` twice within 500ms: run Chiron against the current draft and replace the composer text in place
- `Enter`: still submits normally

Current scope:

- works for plain text drafts
- refuses to enhance drafts that currently contain mentions or image attachments, to avoid silently dropping structured input
- defaults the enhancer backend to `local`, so Codex can use Chiron without requiring Gemini

## Install

From this repository:

```bash
node cli/bin/install-codex-source-enhance.mjs --codex-root /path/to/openai-codex
```

That will:

1. copy Chiron runtime into `~/.chiron/cli`
2. apply the patch to your local `openai/codex` clone

Then build Codex from source:

```bash
cd /path/to/openai-codex/codex-rs
cargo test -p codex-tui ctrl_e_
cargo build -p codex-tui
export CHIRON_ENHANCER_PATH=~/.chiron/cli/bin/chiron-enhance.mjs
cargo run --bin codex
```

## Manual Apply

```bash
git -C /path/to/openai-codex apply /path/to/chiron/cli/patches/codex/double-ctrl-e-enhance-in-place.patch
```

## Notes

- The patch was developed against `openai/codex` commit `5ceff6588ef67aaac34f9461411b90f65e42b4f9`.
- If the patch fails to apply, rebase your local Codex clone or port the same logic manually into `codex-rs/tui/src/bottom_pane/chat_composer.rs`.
- The in-place enhancer runs the executable at `CHIRON_ENHANCER_PATH` first, then falls back to `~/.chiron/cli/bin/chiron-enhance.mjs`.
- The bundled Chiron runtime sets `CHIRON_ENHANCE_BACKEND=local` for Codex-triggered enhancement.

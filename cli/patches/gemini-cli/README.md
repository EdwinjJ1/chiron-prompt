# Gemini CLI Patch: Double Ctrl+E Enhance In Place

Most users should start with the normal installed `gemini` plus Chiron's slash command installer:

```bash
git clone https://github.com/EdwinjJ1/chiron-prompt.git ~/.chiron
node ~/.chiron/cli/bin/install-gemini-command.mjs --name chiron
```

That gives you `/chiron` inside your existing Gemini CLI without patching Gemini itself.

This document is only for the more experimental path where you want to replace the Gemini input box text in place.

This patch keeps Gemini CLI behavior unchanged, and adds an enhancement trigger on top of the existing `Ctrl+E` behavior:

- `Ctrl+E` once: move cursor to end of line, same as Gemini CLI today.
- `Ctrl+E` twice within 500ms: enhance current input and replace the input box text in place.
- `Enter`: still normal submit.
- Existing shortcuts like `Ctrl+O` remain unchanged.

## What the patch changes

1. Adds in-place enhancement logic to `InputPrompt`.
2. In `InputPrompt`, pressing `Ctrl+E` twice quickly:
   - reads current input text,
   - runs enhancer script,
   - replaces the same input box content with enhanced text,
   - does **not** auto-submit.
3. A direct `Ctrl+Alt+O` binding is also left in place as an optional fallback for terminals that support multi-modifier chords reliably.
4. Enhancer path resolution:
   - first: `CHIRON_ENHANCER_PATH` env var,
   - fallback: `<projectRoot>/cli/bin/chiron-enhance.mjs`.
5. Adds tests for the double-press behavior and matcher.

## Apply patch

```bash
# inside your gemini-cli clone
git apply /path/to/chiron/cli/patches/gemini-cli/double-ctrl-e-enhance-in-place.patch
```

## Verify

```bash
# from gemini-cli repo root
npm ci
npm run build --workspace @google/gemini-cli-core
npm run typecheck --workspace @google/gemini-cli
npm run test --workspace @google/gemini-cli -- src/config/keyBindings.test.ts src/ui/keyMatchers.test.ts src/ui/components/InputPrompt.test.tsx
npm run build --workspace @google/gemini-cli
```

## Run manually

```bash
export CHIRON_ENHANCER_PATH=/path/to/chiron/cli/bin/chiron-enhance.mjs
npm run start --workspace @google/gemini-cli
```

In Gemini CLI:

1. Type any prompt in input box.
2. Press `Ctrl+E` once if you want the normal move-to-end behavior.
3. Press `Ctrl+E` again within 500ms to enhance in place.
4. Confirm input text is replaced in place.
5. Press `Enter` to submit normally.

## Notes

- `Ctrl+O` remains Gemini CLI's original paste-expansion shortcut.
- The double-press `Ctrl+E` path is more reliable than `Ctrl+Alt+O` in terminal environments.
- If enhancer is not found, Gemini CLI shows a warning and keeps your original input.

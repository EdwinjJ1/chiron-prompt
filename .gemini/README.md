# Chiron Gemini Command

This repository supports two Gemini CLI paths:

- global install into your existing `gemini` via `node cli/bin/install-gemini-command.mjs --name chiron`
- project-level command via `.gemini/commands/e.toml`

The project-level command provided here is:

- `/e <request>`: Enhance the request with repository context, then execute.

## How it works

The command file `.gemini/commands/e.toml` runs:

```bash
node ./cli/bin/chiron-enhance.mjs <request>
```

Then injects the enhanced spec into Gemini prompt context.

## Usage

### Existing global Gemini CLI

```bash
node cli/bin/install-gemini-command.mjs --name chiron
gemini
/chiron 修复登录流程 bug
```

### Project-local command

From this project directory:

```bash
gemini
/e 修复登录流程 bug
```

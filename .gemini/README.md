# Chiron Gemini Command

This project provides a project-level Gemini CLI custom command:

- `/e <request>`: Enhance the request with repository context, then execute.

## How it works

The command file `.gemini/commands/e.toml` runs:

```bash
node ./cli/bin/chiron-enhance.mjs <request>
```

Then injects the enhanced spec into Gemini prompt context.

## Usage

From this project directory:

```bash
gemini
/e 修复登录流程 bug
```


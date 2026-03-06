# Contributing to Chiron Prompt Enhancer

First off, thank you for considering contributing to Chiron! Every contribution helps make this tool better for everyone.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/chiron-prompt.git
   cd chiron-prompt
   ```
3. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates.

When reporting a bug, include:
- A clear, descriptive title
- Steps to reproduce the behavior
- Expected behavior vs actual behavior
- Your environment (OS, Claude Code version)
- Screenshots or logs if applicable

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When suggesting:
- Use a clear, descriptive title
- Explain the use case and why this enhancement would be useful
- Provide examples of how the feature would work

### Contributing Code

1. Check the [issues](../../issues) for tasks labeled `good first issue` or `help wanted`
2. Comment on the issue to let others know you're working on it
3. Submit a PR when ready

### Contributing Examples

We love new examples! If you've used Chiron for an interesting prompt transformation:
1. Add your example to `docs/examples.md`
2. Follow the existing format
3. Include both the original and enhanced versions

### Improving Documentation

Documentation improvements are always welcome:
- Fix typos or unclear explanations
- Add missing information
- Translate to other languages

## Development Setup

### Prerequisites

- Python 3.10+
- Claude Code CLI

### Project Structure

```
chiron-prompt/
├── .claude/skills/prompt-enhancer/
│   ├── SKILL.md           # Runtime skill definition
│   └── scripts/
│       └── append_prompt_library.py
├── README.md              # Main documentation
├── SKILL.md               # Design documentation
├── docs/
│   ├── examples.md        # Usage examples
│   ├── testing.md         # Test cases
│   └── reference/
└── prompt-history/
    └── PROMPT_LIBRARY.md  # Generated prompt history
```

### Running Tests

```bash
# Install development dependencies
pip install -e ".[dev]"

# Run the full test suite
pytest tests/ -v

# Run with coverage report
pytest tests/ -v --cov=.claude/skills/prompt-enhancer/scripts --cov-report=html

# Run a specific test file
pytest tests/test_append_prompt_library.py -v

# Run tests matching a pattern
pytest tests/ -v -k "redact"
```

### Linting

```bash
# Check code style
ruff check .claude/skills/prompt-enhancer/scripts/

# Auto-fix issues
ruff check --fix .claude/skills/prompt-enhancer/scripts/

# Format code
ruff format .claude/skills/prompt-enhancer/scripts/
```

### Manual Testing

```bash
# Test the logging script directly
echo '{"original_request": "test", "upgrade_summary": ["test"]}' | \
  PROMPT_LIBRARY_PATH=./test-output.md \
  python3 .claude/skills/prompt-enhancer/scripts/append_prompt_library.py

# Manual testing in Claude Code
# 1. Copy .claude/skills/prompt-enhancer/ to your project
# 2. Run: /prompt-enhancer "your test prompt"
```

## Pull Request Process

1. **Update documentation** if you're changing functionality
2. **Add tests** for new features when applicable
3. **Follow the style guidelines** below
4. **Write a clear PR description** explaining:
   - What changes you made
   - Why you made them
   - How to test them
5. **Request review** from maintainers
6. **Address feedback** promptly

### PR Title Format

Use conventional commit format:
- `feat: Add new strategy for technical writing`
- `fix: Correct language detection for mixed input`
- `docs: Improve installation instructions`
- `refactor: Simplify strategy selection logic`

## Style Guidelines

### Markdown

- Use ATX-style headers (`#` not underlines)
- Use fenced code blocks with language specifiers
- Keep lines under 100 characters when possible
- Use reference-style links for repeated URLs

### Python

- Follow PEP 8
- Use type hints
- Add docstrings for functions
- Run `ruff check` before committing

### Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters
- Reference issues and PRs in the body

## Questions?

Feel free to open an issue with the `question` label or reach out to the maintainers.

---

Thank you for contributing!

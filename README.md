<div align="center">

# 🏹 Chiron Prompt Enhancer

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE.txt)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](CHANGELOG.md)
[![Claude Code Skill](https://img.shields.io/badge/Claude%20Code-Skill-purple.svg)]()
[![CI](https://github.com/EdwinjJ1/chiron-prompt/actions/workflows/ci.yml/badge.svg)](https://github.com/EdwinjJ1/chiron-prompt/actions/workflows/ci.yml)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

**Transform basic prompts into powerful, AI-optimized queries — then execute the work.**

将基础提示词转化为强大、精准的 AI 优化查询 — 并自动执行任务。

[Installation](#installation) · [Quick Start](#quick-start) · [Strategies](#optimization-strategies) · [Contributing](CONTRIBUTING.md)

</div>

---

## 💡 Why "Chiron"?

> In Greek mythology, **Chiron** (Χείρων) was the wisest of all centaurs — a mentor to heroes like Achilles, Hercules, and Jason. Unlike other centaurs, Chiron was known for his intelligence, teaching, and ability to elevate others to greatness.
>
> This skill embodies that spirit: **taking your rough ideas and elevating them to expert-grade specifications**.

---

## Overview

Chiron Prompt Enhancer is an open-source **Claude Code project skill** that upgrades underspecified requests into an expert-grade spec and then **executes the work**. It also keeps an optional, local prompt history so users can reuse what worked.

### How It Works

```mermaid
flowchart LR
    A["📝 Your Request"] --> B["⚡ Augment\n(Upgrade intent)"]
    B --> C["🛠 Execute\n(Do the work)"]
    C --> D["📦 Deliver\n(Final result)"]
    D --> E["🗂 Log\n(PROMPT_LIBRARY)"]
```

Default behavior is **Augment → Execute**. Use `prompt-only` if you want just the upgraded prompt/spec.

---

## Features

| Feature | Description |
|---------|-------------|
| **Agentic execution** | Upgrades the request and completes the task (not just prompt rewriting) |
| **7 strategies** | Concise / Detailed / Creative / Professional / Analytical / Educational / Action-Oriented |
| **Smart auto-detection** | Picks the right strategy for the task and language |
| **Bilingual support** | Works seamlessly with English and Chinese (中英双语) |
| **Prompt library (optional)** | Logs upgrades to `prompt-history/PROMPT_LIBRARY.md` (disable with `no-log`) |
| **Security-first logging** | Automatic redaction of 15+ secret patterns (API keys, tokens, passwords) |
| **Log rotation** | Automatic compression and rotation when logs exceed 1MB |

---

## Installation

### For Claude Code Users

Add this skill to your Claude Code project:

```bash
# Navigate to your project root
cd your-project

# Clone into .claude/skills directory
mkdir -p .claude/skills
git clone https://github.com/EdwinjJ1/chiron-prompt.git .claude/skills/chiron-prompt
```

### Global Installation (All Projects)

```bash
# Clone to your global skills directory
mkdir -p ~/.claude/skills
git clone https://github.com/EdwinjJ1/chiron-prompt.git ~/.claude/skills/chiron-prompt
```

### Manual Installation

1. Download or clone this repository
2. Copy the `SKILL.md` file to your `.claude/skills/prompt-enhancer/` directory
3. Restart Claude Code to activate the skill

---

## Quick Start

### Trigger Phrases

Simply use natural language to activate the skill:

```
"Optimize my prompt"
"Enhance this prompt"
"Make this prompt better"
"Help me write a better prompt for..."
```

### Basic Example

**Request:**
```
Write a function to sort data
```

**What you get (default):** an upgraded spec + the implemented function.

If you only want the upgraded prompt/spec (no execution), prefix with `prompt-only`.

### Controls

| Control | Description |
|---------|-------------|
| `prompt-only` | Output only the upgraded spec (no execution) |
| `show-spec` | Include the augmented spec in a collapsed `<details>` block |
| `no-log` | Don't write to `prompt-history/PROMPT_LIBRARY.md` |

---

## Optimization Strategies

<details>
<summary><strong>📋 Detailed (详细模式)</strong> — Add context and structure</summary>

### When to Use
- Prompt lacks necessary context
- Complex tasks requiring comprehensive output
- Need structured, thorough results

### What It Adds
- Relevant context and background
- Specific output format requirements
- Technical constraints and specifications
- Clear section structure

### Example
| Before | After |
|--------|-------|
| "Write about climate change" | Comprehensive article structure with 5 sections, word count, source requirements, and target audience specification |

</details>

<details>
<summary><strong>✂️ Concise (简洁模式)</strong> — Simplify while keeping essentials</summary>

### When to Use
- Prompt is verbose or redundant
- Quick, direct communication needed
- Want clarity without losing information

### What It Does
- Removes filler words and phrases
- Eliminates repetition
- Preserves all essential information
- Maintains logical flow

### Example
| Before | After |
|--------|-------|
| "I was wondering if you could possibly help me by taking a look at the code..." (47 words) | "Review my code for bugs and potential issues." (9 words) |

</details>

<details>
<summary><strong>🎨 Creative (创意模式)</strong> — Spark innovation and diverse thinking</summary>

### When to Use
- Brainstorming or ideation tasks
- Want innovative, unexpected approaches
- Creative writing, design, or problem-solving

### What It Adds
- Diverse perspectives and angles
- Constraints that spark creativity
- Cross-domain inspiration
- Multiple approach requests

### Example
| Before | After |
|--------|-------|
| "Give me ideas for a mobile app" | Domain fusion framework with 6 evaluation criteria, inspiration from 5 unexpected combinations |

</details>

<details>
<summary><strong>💼 Professional (专业模式)</strong> — Business-grade quality</summary>

### When to Use
- Business or professional contexts
- Need industry-standard language
- Formal communication or documentation

### What It Adds
- Appropriate industry terminology
- Professional tone and structure
- Stakeholder considerations
- Deliverable specifications

### Example
| Before | After |
|--------|-------|
| "Help me with a presentation about sales" | Q4 executive sales review deck with 10-12 slides, data visualization requirements, and speaker notes |

</details>

<details>
<summary><strong>📊 Analytical (分析模式)</strong> — Systematic evaluation framework</summary>

### When to Use
- Data analysis or research tasks
- Need systematic breakdown
- Complex decision-making

### What It Adds
- Multi-phase analytical framework
- Evaluation criteria and scoring
- Evidence-based reasoning structure
- Conclusions and recommendations format

### Example
| Before | After |
|--------|-------|
| "Analyze this data" | 5-phase analysis framework covering data quality, descriptive stats, pattern discovery, inference, and strategic insights |

</details>

<details>
<summary><strong>📚 Educational (教学模式)</strong> — Optimize for learning</summary>

### When to Use
- Teaching or learning scenarios
- Need explanations, not just answers
- Knowledge sharing or documentation

### What It Adds
- Step-by-step explanations
- Real-world analogies
- Progressive learning structure
- Practice exercises

### Example
| Before | After |
|--------|-------|
| "Explain recursion" | 7-part teaching structure with analogy, call stack visualization, common pitfalls, and practice exercise |

</details>

<details>
<summary><strong>🚀 Action-Oriented (行动模式)</strong> — Step-by-step implementation</summary>

### When to Use
- Practical implementation tasks
- Need step-by-step guidance
- Tutorial or how-to scenarios

### What It Adds
- Prerequisites checklist
- Numbered action steps
- Verification checkpoints
- Troubleshooting tips

### Example
| Before | After |
|--------|-------|
| "Set up a React project" | 5-step guide with prerequisites, commands, folder structure, verification checkpoints, and troubleshooting |

</details>

---

## Strategy Selection

The skill automatically recommends strategies based on your prompt:

| Pattern Detected | Recommended Strategy |
|-----------------|---------------------|
| "explain", "teach", "learn" | Educational |
| "analyze", "evaluate", "compare" | Analytical |
| "how to", "setup", "configure" | Action-Oriented |
| "idea", "creative", "brainstorm" | Creative |
| Business terms (presentation, executive) | Professional |
| Very long/verbose (>200 words) | Concise |
| No specific pattern | Detailed (default) |

You can also explicitly request a strategy:
```
"Optimize this prompt using creative mode"
"Make this more professional"
```

---

## Background

This open-source skill is adapted from **[Axon](https://promptenhenceraxon.top)**, a professional desktop application for AI prompt engineering. While Axon provides a complete desktop experience with advanced features like:

- One-click system-wide prompt optimization
- Multi-provider AI support (OpenAI, Anthropic, Google)
- Prompt library management with analytics
- Usage tracking and optimization history

This skill brings the core optimization intelligence directly into Claude Code conversations, making prompt enhancement accessible without leaving your development workflow.

---

## Project Structure

```
chiron-prompt/
├── README.md                 # This file
├── SKILL.md                  # Skill documentation (design + behavior)
├── CONTRIBUTING.md           # Contribution guidelines
├── CODE_OF_CONDUCT.md        # Community standards
├── CHANGELOG.md              # Version history
├── LICENSE.txt               # MIT License
├── SECURITY.md               # Security policy
├── MAINTAINERS.md            # Maintainer information
├── pyproject.toml            # Python package configuration
├── examples.md               # Examples (prompt-only + agentic execution)
├── tests.md                  # Manual test cases
├── tests/                    # Automated pytest tests
│   └── test_append_prompt_library.py
├── assets/                   # Demo materials
├── .github/
│   ├── workflows/
│   │   └── ci.yml            # CI/CD pipeline
│   ├── labels.yml            # Issue labels configuration
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── PULL_REQUEST_TEMPLATE.md
├── .claude/
│   └── skills/
│       └── prompt-enhancer/
│           ├── SKILL.md      # Claude Code project skill (runtime)
│           └── scripts/
│               └── append_prompt_library.py
├── prompt-history/
│   └── PROMPT_LIBRARY.md
└── reference/
    └── axon-implementation-notes.md
```

---

## Development

### Running Tests

```bash
# Install dev dependencies
pip install -e ".[dev]"

# Run tests
pytest tests/ -v

# Run with coverage
pytest tests/ -v --cov=.claude/skills/prompt-enhancer/scripts --cov-report=html
```

### Linting

```bash
# Check code style
ruff check .claude/skills/prompt-enhancer/scripts/

# Format code
ruff format .claude/skills/prompt-enhancer/scripts/
```

---

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) first.

### Quick Links

- 🐛 [Report a Bug](https://github.com/EdwinjJ1/chiron-prompt/issues/new?template=bug_report.md)
- ✨ [Request a Feature](https://github.com/EdwinjJ1/chiron-prompt/issues/new?template=feature_request.md)
- 🔒 [Security Policy](SECURITY.md)
- 📖 [View Examples](examples.md)
- 🧪 [Run Tests](tests.md)

---

## License

This project is licensed under the MIT License - see the [LICENSE.txt](LICENSE.txt) file for details.

---

## Acknowledgments

- Core optimization strategies adapted from the [Axon](https://promptenhenceraxon.top) project
- Inspired by research on effective prompt engineering patterns
- Built for the Claude Code community

---

<div align="center">

**[Try Axon Desktop App](https://promptenhenceraxon.top)** · **[Report Bug](../../issues)** · **[Request Feature](../../issues)**

Made with care for better AI interactions ✨

</div>

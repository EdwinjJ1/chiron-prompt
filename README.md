# Prompt Enhancer

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE.txt)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)]()
[![Claude Code Skill](https://img.shields.io/badge/Claude%20Code-Skill-purple.svg)]()

> **Transform basic prompts into powerful, AI-optimized queries.**
>
> 将基础提示词转化为强大、精准的 AI 优化查询。

---

## Overview

Prompt Enhancer is an open-source **Claude Code project skill** that upgrades underspecified requests into an expert-grade spec and then **executes the work**. It also keeps an optional, local prompt history so users can reuse what worked.

## How It Works

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

## Output Format

Every optimization includes:

```markdown
## Optimized Prompt (Strategy: [Name])

[The enhanced prompt]

---

**Key Improvements:**
- What was added
- Why it helps
- What changed from original

**Alternative Strategies:** [Other strategies that might work]
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
prompt-enhancer-skill/
├── README.md           # This file
├── SKILL.md            # Skill documentation (design + behavior)
├── examples.md         # Examples (prompt-only + agentic execution)
├── tests.md            # Test cases and validation
├── LICENSE.txt         # MIT License
├── .claude/
│   └── skills/
│       └── prompt-enhancer/
│           ├── SKILL.md  # Claude Code project skill (runtime)
│           └── scripts/
│               └── append_prompt_library.py
├── prompt-history/
│   └── PROMPT_LIBRARY.md
└── reference/
    └── axon-implementation-notes.md  # Technical reference
```

---

## Contributing

Contributions are welcome! Here's how you can help:

1. **Report Issues**: Found a bug or have a suggestion? [Open an issue](../../issues)
2. **Submit Examples**: Share interesting prompt transformations
3. **Improve Strategies**: Suggest new optimization approaches
4. **Documentation**: Help improve clarity and coverage

### Development

```bash
# Clone the repository
git clone https://github.com/[username]/prompt-enhancer-skill.git

# Review the skill docs
cat SKILL.md

# (Claude Code) Project skill is under:
# .claude/skills/prompt-enhancer/SKILL.md

# Check examples
cat examples.md
```

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

Made with care for better AI interactions

</div>

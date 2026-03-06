# Prompt Enhancer - Contribution Submission Guide

## Target Repository

**VoltAgent/awesome-claude-code-subagents**
- URL: https://github.com/VoltAgent/awesome-claude-code-subagents
- Category: `06-developer-experience` (Developer Experience)

## Submission Steps

### 1. Fork the Repository

```bash
# Go to https://github.com/VoltAgent/awesome-claude-code-subagents
# Click "Fork" button in the top right
```

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR_USERNAME/awesome-claude-code-subagents.git
cd awesome-claude-code-subagents
```

### 3. Create Feature Branch

```bash
git checkout -b feat/add-prompt-enhancer
```

### 4. Add the Agent File

```bash
# Copy the prepared agent file to the correct category
cp /path/to/prompt-enhancer.md categories/06-developer-experience/prompt-enhancer.md
```

### 5. Update Category README (if required)

Add an entry to `categories/06-developer-experience/README.md`:

```markdown
| prompt-enhancer | Transform underspecified requests into professional specs and execute | Prompt engineering, intent detection, bilingual (EN/ZH) |
```

### 6. Verify Links and Format

- Check that all markdown renders correctly
- Ensure YAML frontmatter is valid
- Verify tool names match available tools

### 7. Commit Changes

```bash
git add categories/06-developer-experience/prompt-enhancer.md
git commit -m "feat: Add prompt-enhancer agent for intelligent request transformation"
```

### 8. Push and Create PR

```bash
git push origin feat/add-prompt-enhancer
```

Then go to GitHub and create a Pull Request with:

**Title:** `feat: Add prompt-enhancer agent`

**Description:**
```markdown
## Summary

Adds a new subagent for intelligent prompt enhancement and task execution.

## Agent Details

- **Name:** prompt-enhancer
- **Category:** 06-developer-experience
- **Purpose:** Transform underspecified requests into professional-grade specifications and execute tasks

## Key Features

- 7 optimization strategies (Educational, Analytical, Action-Oriented, Creative, Professional, Concise, Detailed)
- Automatic intent detection
- Bilingual support (English/Chinese)
- Silent enhancement (results-focused, not process-focused)
- Agentic execution by default

## Use Cases

- Upgrading vague coding requests into precise specifications
- Auto-detecting learning vs. implementation intent
- Handling bilingual development environments
- Improving prompt quality without user intervention

## Related Project

This agent is adapted from [Chiron Prompt Enhancer](https://github.com/EdwinjJ1/chiron-prompt), an open-source Claude Code skill.

## Checklist

- [x] Agent file follows repository format
- [x] YAML frontmatter is valid
- [x] Tools specified correctly
- [x] Description is clear and concise
- [x] Use cases documented
```

## File Location Summary

| File | Location |
|------|----------|
| Agent definition | `categories/06-developer-experience/prompt-enhancer.md` |
| Source project | https://github.com/EdwinjJ1/chiron-prompt |

## Notes

- The agent follows the established format in the repository
- Category 06 (Developer Experience) is chosen because prompt enhancement improves developer productivity
- The agent complements existing agents like `dx-optimizer` and `documentation-engineer`

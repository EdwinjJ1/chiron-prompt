---
name: prompt-enhancer
version: 1.0.0
description: "Optimize and enhance prompts for better AI responses. Use when users need help refining their prompts to get more specific, effective, or better-structured results from AI."
license: MIT
---

# Prompt Enhancer

## Overview

Transform basic prompts into powerful, well-structured prompts that yield better AI responses. This skill helps users think through what they really want, add missing context, and structure their requests for optimal results.

**Based on**: Axon's prompt optimization system, adapted for Claude Code conversations.

## When to Use This Skill

Use this skill when:
- User says "optimize my prompt", "enhance this prompt", "make this better"
- User provides a basic prompt that lacks detail, structure, or context
- User wants to improve prompt quality for any AI task
- User is working with prompts for coding, writing, analysis, creative work, or any AI interaction

**Auto-trigger**: Detects phrases like "optimize prompt", "enhance prompt", "improve prompt", "make this prompt better", "help me write a better prompt", "refine this prompt"

## Available Strategies

### Base Strategies (from Axon)

#### 1. Concise (简洁模式)
**Goal**: Simplify while keeping key details

**When to use**:
- Prompt is verbose or redundant
- User wants clarity without losing information
- Quick, direct communication needed

**Optimization guidelines**:
- Remove redundant words and phrases
- Keep all essential information
- Use clear, direct language
- Maintain logical flow
- Preserve technical accuracy

**Example**:
```
Original: "I was wondering if you could possibly help me by taking a look at the code that I wrote yesterday and maybe tell me if there are any problems or issues that you might be able to find."

Optimized: "Review my code for bugs and potential issues. [Paste code]"
```

#### 2. Detailed (详细模式)
**Goal**: Add context, structure, and professional terminology

**When to use**:
- Prompt lacks necessary context
- User needs comprehensive, thorough results
- Complex task requiring detail

**Optimization guidelines**:
- Add relevant context and background
- Specify desired output format
- Include constraints and requirements
- Use professional/technical terminology
- Structure with clear sections

**Example**:
```
Original: "Write a function to sort data"

Optimized: "Write a JavaScript function that sorts an array of objects by a specified property. Requirements:
- Handle nested properties (e.g., 'user.name')
- Support ascending and descending order
- Include TypeScript type definitions
- Add error handling for invalid inputs
- Provide usage examples
- Time complexity: O(n log n)"
```

#### 3. Creative (创意模式)
**Goal**: Add creative elements and diverse perspectives

**When to use**:
- Brainstorming or ideation tasks
- User wants innovative, unexpected approaches
- Creative writing, design, or problem-solving

**Optimization guidelines**:
- Add diverse perspectives and angles
- Encourage thinking outside boundaries
- Include constraints that spark creativity
- Request multiple approaches or alternatives
- Add inspiration from different domains

**Example**:
```
Original: "Give me ideas for a mobile app"

Optimized: "Brainstorm innovative mobile app ideas that combine two unrelated domains to solve everyday problems. For each idea:
- Identify the two domains being merged
- Explain the core value proposition
- Describe the target user and use case
- Suggest three unique features
- Consider potential challenges and solutions
- Draw inspiration from: nature, gaming, social media, productivity tools"
```

#### 4. Professional (专业模式)
**Goal**: Business-grade quality with accurate terminology

**When to use**:
- Business or professional contexts
- User needs industry-standard language
- Formal communication or documentation

**Optimization guidelines**:
- Use appropriate industry terminology
- Maintain professional tone
- Include business context and objectives
- Specify deliverables and success criteria
- Add stakeholder considerations

**Example**:
```
Original: "Help me with a presentation about sales"

Optimized: "Create a professional sales presentation deck for Q4 review meeting. Audience: Executive leadership team.
Requirements:
- 10-12 slides maximum
- Include: executive summary, key metrics, year-over-year comparison, pipeline analysis, risks and opportunities, Q1 outlook
- Data visualization focus with clear charts
- Actionable insights and recommendations
- Speaker notes for each slide
- Consistent with brand guidelines"
```

### New Strategies

#### 5. Analytical (分析模式)
**Goal**: Structure for analysis, critical thinking, and systematic evaluation

**When to use**:
- Data analysis, research, or evaluation tasks
- User needs systematic breakdown
- Complex decision-making or problem-solving

**Optimization guidelines**:
- Add analytical framework or structure
- Specify evaluation criteria
- Request evidence-based reasoning
- Include comparison dimensions
- Ask for conclusions and recommendations

**Example**:
```
Original: "Analyze this data"

Optimized: "Perform a comprehensive analysis of the provided dataset. Analysis framework:
1. Data Quality Assessment
   - Completeness check
   - Identify anomalies or outliers
   - Missing data patterns

2. Descriptive Statistics
   - Key metrics and trends
   - Distribution analysis
   - Correlation analysis

3. Insights and Patterns
   - Significant findings
   - Unexpected correlations
   - Temporal patterns

4. Conclusions and Recommendations
   - Key takeaways
   - Actionable insights
   - Areas for further investigation"
```

#### 6. Educational (教学模式)
**Goal**: Optimize for learning, explanation, and knowledge transfer

**When to use**:
- Teaching or learning scenarios
- User needs explanations, not just answers
- Knowledge sharing or documentation

**Optimization guidelines**:
- Add step-by-step explanations
- Include examples and analogies
- Define technical terms
- Structure for progressive learning
- Add practice exercises or checks

**Example**:
```
Original: "Explain recursion"

Optimized: "Explain the concept of recursion in programming, targeting someone with basic coding knowledge. Structure:
1. Simple definition with real-world analogy
2. Basic example with step-by-step walkthrough
3. Visual representation of call stack
4. Common use cases and applications
5. Potential pitfalls (stack overflow, base cases)
6. Comparison with iterative approach
7. Practice exercise with solution"
```

#### 7. Action-Oriented (行动模式)
**Goal**: Focus on actionable steps, clear instructions, and implementation

**When to use**:
- Practical implementation tasks
- User needs step-by-step guidance
- Tutorial or how-to scenarios

**Optimization guidelines**:
- Break down into clear steps
- Add specific actions for each step
- Include prerequisites and tools needed
- Add verification checkpoints
- Provide troubleshooting tips

**Example**:
```
Original: "Set up a React project"

Optimized: "Set up a new React project with TypeScript and modern tooling. Step-by-step:

Prerequisites:
- Node.js 18+ installed
- npm or yarn package manager
- Code editor (VS Code recommended)

Step 1: Initialize Project
- Run: `npm create vite@latest my-app -- --template react-ts`
- Navigate: `cd my-app`
- Install dependencies: `npm install`

Step 2: Configure ESLint and Prettier
- Install dev dependencies
- Create configuration files
- Add format and lint scripts

Step 3: Set Up Folder Structure
- Create components, hooks, utils, types folders
- Set up absolute imports

Step 4: Verify Setup
- Run dev server: `npm run dev`
- Check for TypeScript errors
- Test hot module replacement"
```

## Strategy Selection Logic

When the user doesn't specify a strategy, use the following logic to recommend the best fit:

### Default Strategy
**Detailed** (详细模式) - This is the default when no specific pattern is detected

### Smart Recommendation Rules

| Pattern Detected | Recommended Strategy | Rationale |
|-----------------|---------------------|-----------|
| Contains "explain", "teach", "tutorial", "learn" | **Educational** | User wants to understand, not just get results |
| Contains "analyze", "evaluate", "compare", "review" | **Analytical** | User needs systematic evaluation framework |
| Contains "how to", "implement", "setup", "install", "configure" | **Action-Oriented** | User needs step-by-step implementation |
| Contains "idea", "creative", "brainstorm", "inspire" | **Creative** | User wants diverse, innovative approaches |
| Contains business terms (presentation, report, executive, stakeholder) | **Professional** | Business context requires formal language |
| Very long/verbose prompt (>200 words) | **Concise** | Prompt needs simplification |
| No specific pattern | **Detailed** (default) | Most prompts benefit from more detail |

### Always:
1. **Explain why** the strategy was chosen
2. **Show the optimized prompt** clearly
3. **Offer alternatives**: "Would you like me to try a different strategy?"
4. **Be ready to iterate**: "Good, but make it more concise" or "Try creative mode instead"

## Process

### Step 1: Understand User's Intent
- Read the original prompt carefully
- Identify the core task or objective
- Determine the domain/context (coding, writing, analysis, etc.)
- Check if user specified a strategy

### Step 2: Select Strategy
- If user specified: use that strategy
- If not specified: apply smart recommendation logic
- Explain why that strategy fits their use case
- Offer to try alternative strategies if they want

### Step 3: Optimize the Prompt
- Apply strategy-specific optimization guidelines
- Think about what the user REALLY wants (not just what they said)
- Add missing context, structure, or detail
- Maintain original language (Chinese/English)
- Ensure output is 1.5-3x length of original

### Step 4: Present Results
```
## Optimized Prompt (Strategy: [Strategy Name])

[The optimized prompt text]

---

**Key Improvements:**
- [What was added]
- [Why it helps]
- [What changed from original]

**Alternative Strategies**: [List 1-2 other strategies that might work]
```

### Step 5: Iterate if Needed
- Be ready to adjust based on feedback
- Offer alternative strategies
- Fine-tune specific aspects (too long, too short, different focus)

## Key Principles

### 1. Think Beyond the Literal
Users often don't articulate everything they need. Add:
- Context they forgot to mention
- Output format they'll need
- Constraints they should consider
- Examples that clarify expectations

### 2. Match Strategy to Purpose
Different goals need different approaches:
- Quick questions → Concise
- Complex tasks → Detailed
- Brainstorming → Creative
- Business contexts → Professional
- Research/evaluation → Analytical
- Learning scenarios → Educational
- Implementation tasks → Action-Oriented

### 3. Preserve Intent
- Don't change the core objective
- Keep essential requirements
- Maintain user's voice/style where appropriate
- Respect domain-specific terminology

### 4. Language Consistency
- Detect input language automatically
- Output in same language as input
- Handle mixed Chinese/English naturally
- Don't translate technical terms unnecessarily

## Quick Reference

| Strategy | Best For | Key Addition | When Prompt is... |
|----------|----------|--------------|-------------------|
| **Concise** | Verbose prompts | Clarity, brevity | Too long, redundant |
| **Detailed** | Simple prompts | Context, structure | Too brief, vague |
| **Creative** | Ideation tasks | Diverse perspectives | Boring, conventional |
| **Professional** | Business contexts | Industry standards | Too casual, informal |
| **Analytical** | Evaluation tasks | Framework, criteria | Unstructured, vague |
| **Educational** | Learning scenarios | Explanations, examples | Missing explanations |
| **Action-Oriented** | Implementation | Steps, verification | Lacks how-to guidance |

## Tips for Best Results

1. **Provide context**: What is this for? Who is the audience?
2. **Specify constraints**: Length, format, style, timeline
3. **Share examples**: "Like this example I found..."
4. **State goal clearly**: "I want to accomplish X"
5. **Mention strategy preference**: "Use professional mode"
6. **Iterate**: "Good, but make it more concise" or "Try creative mode instead"

## Anti-Patterns to Avoid

- Don't over-optimize simple requests
- Don't add unnecessary complexity
- Don't change the user's intent
- Don't make prompts excessively long (aim for 1.5-3x original)
- Don't lose the user's voice or style

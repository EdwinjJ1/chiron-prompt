# Axon Implementation Notes

Reference documentation extracted from the Axon project's prompt optimization system.

## Source Project

**Project**: Axon
**Location**: Private local Axon source workspace (not included in this repository)
**Purpose**: Electron desktop application for AI prompt engineering with one-click optimization

## Core Optimization Prompt Template

From `src/main/services/aiService.ts`:

```typescript
function buildOptimizationPrompt(userPrompt: string, strategy: OptimizeStrategy): string {
  const strategyGuides: Record<OptimizeStrategy, string> = {
    concise: '简洁但完整，去除冗余但保留所有关键细节',
    detailed: '详细具体，包含充分上下文和专业术语',
    creative: '富有创意，激发多样化思维，添加独特视角',
    professional: '专业规范，商业级质量，术语准确',
  };

  return `你是一个提示词优化器。将用户的原始提示词改写为更有效、更丰富的版本。

原始提示词：${userPrompt}

优化风格：${strategyGuides[strategy]}

优化要求：
- 设身处地思考用户真正想要什么，补充他们可能没考虑到的方面
- 丰富提示词内容，添加有价值的细节和上下文
- 输出长度应比原文更详细（至少1.5倍）
- 如果是图像生成类，添加：光线、色调、构图、风格、氛围等
- 如果是文本生成类，添加：角色设定、输出格式、具体要求等

严格输出格式：
- 只输出优化后的提示词本身
- 禁止输出任何标题、标签、解释、前言
- 禁止使用 Markdown 格式（如 **粗体**、# 标题、- 列表）
- 禁止输出"优化后的提示词："或类似前缀
- 使用与原文相同的语言输出`;
}
```

## Key Insights

### 1. Length Target
- **Minimum**: 1.5x original length
- **Recommended**: 1.5-3x original length
- **Maximum**: Avoid >5x (excessive)

### 2. Content Categories
The Axon system recognizes two main prompt types:
- **Image generation**: Add lighting, color tone, composition, style, atmosphere
- **Text generation**: Add role setting, output format, specific requirements

### 3. Output Format Rules (from Axon)
- NO titles or headers
- NO Markdown formatting
- NO explanatory prefixes
- ONLY the optimized prompt itself
- SAME language as input

**Note**: This skill adapts these rules for Claude Code conversations. We DO provide explanations and structure, as that's more appropriate for the conversational context.

## Base Strategy Definitions

### 1. Concise (简洁)
**Chinese**: 简洁但完整，去除冗余但保留所有关键细节

**Translation**: Concise but complete, remove redundancy while keeping all key details

**Application**:
- Remove filler words and phrases
- Eliminate repetition
- Keep essential information
- Maintain logical flow
- Preserve technical accuracy

### 2. Detailed (详细)
**Chinese**: 详细具体，包含充分上下文和专业术语

**Translation**: Detailed and specific, include sufficient context and professional terminology

**Application**:
- Add relevant context and background
- Specify desired output format
- Include constraints and requirements
- Use professional/technical terminology
- Structure with clear sections

### 3. Creative (创意)
**Chinese**: 富有创意，激发多样化思维，添加独特视角

**Translation**: Creative, inspire diverse thinking, add unique perspectives

**Application**:
- Add diverse perspectives and angles
- Encourage thinking outside boundaries
- Include constraints that spark creativity
- Request multiple approaches or alternatives
- Add inspiration from different domains

### 4. Professional (专业)
**Chinese**: 专业规范，商业级质量，术语准确

**Translation**: Professional and standardized, business-grade quality, accurate terminology

**Application**:
- Use appropriate industry terminology
- Maintain professional tone
- Include business context and objectives
- Specify deliverables and success criteria
- Add stakeholder considerations

## Technical Implementation Details

### Error Handling
From `aiService.ts`:

```typescript
export enum AIServiceErrorType {
  INVALID_INPUT = 'INVALID_INPUT',    // Input is invalid or empty
  API_ERROR = 'API_ERROR',            // API call failed
  TIMEOUT = 'TIMEOUT',                // Request timed out
  RATE_LIMITED = 'RATE_LIMITED',      // Rate limit exceeded
  UNKNOWN = 'UNKNOWN',                // Unknown error
}
```

**For Claude Skill**: We don't have external APIs, so we only need to handle:
- **INVALID_INPUT**: Empty or whitespace-only prompts
- **UNKNOWN**: Unexpected issues

### Input Validation
```typescript
function validateInput(text: unknown): asserts text is string {
  if (text === null || text === undefined) {
    throw new Error('Input text cannot be null or undefined');
  }
  if (typeof text !== 'string') {
    throw new Error('Input text must be a string');
  }
  if (text.trim() === '') {
    throw new Error('Input text cannot be empty');
  }
}
```

### Result Structure
```typescript
interface OptimizeResult {
  success: boolean;
  originalText: string;
  optimizedText: string;
  strategy: OptimizeStrategy;
  suggestions: string[];
  timestamp: number;
}
```

**For Claude Skill**: We adapt this structure:
- `success`: Always true for conversational optimization
- `originalText`: The user's input prompt
- `optimizedText`: The enhanced prompt
- `strategy`: Which strategy was applied
- `suggestions`: Key improvements made
- `timestamp`: Not needed in conversation

## Strategy Mapping (Axon → This Skill)

From `src/renderer/hooks/useOptimize.ts`:

```typescript
const mapStrategyToStrategies = (
  strategy?: 'concise' | 'detailed' | 'creative' | 'professional'
): OptimizationStrategy[] => {
  switch (strategy) {
    case 'concise': return ['simplify'];
    case 'detailed': return ['add_context', 'structure'];
    case 'creative': return ['adjust_tone'];
    case 'professional': return ['clarify_instruction', 'structure'];
    default: return ['add_context'];
  }
};
```

**Adaptation**: This skill uses strategy names directly, not internal optimization arrays.

## Differences from Axon

| Aspect | Axon (Desktop App) | Prompt Enhancer Skill |
|--------|-------------------|----------------------|
| **Backend** | Google Gemini API | Claude's native intelligence |
| **Trigger** | Keyboard shortcut (Cmd+Shift+O) | Conversation trigger |
| **Strategies** | 4 base strategies | 7 strategies (4 + 3 new) |
| **Output** | Only optimized text | Optimized text + explanations |
| **Persistence** | Saves to database | No persistence (conversation-only) |
| **Analytics** | Token tracking, cost estimates | None required |
| **Usage Limits** | Daily quota tracking | No limits needed |

## New Strategies (Not in Axon)

### 5. Analytical (分析)
**Purpose**: Structure for analysis, critical thinking, systematic evaluation
**Use cases**: Data analysis, research, decision-making, problem-solving
**Inspiration**: Academic and business analysis frameworks

### 6. Educational (教学)
**Purpose**: Optimize for learning, explanation, knowledge transfer
**Use cases**: Teaching scenarios, explanations, tutorials
**Inspiration**: Pedagogical best practices

### 7. Action-Oriented (行动)
**Purpose**: Focus on actionable steps, clear instructions, implementation
**Use cases**: Tutorials, how-to guides, implementation tasks
**Inspiration**: Technical documentation patterns

## Best Practices from Axon

1. **Think Beyond the Literal**
   - Users often don't articulate everything they need
   - Add context they forgot to mention
   - Consider what they really want, not just what they said

2. **Length Balance**
   - Too short: Misses important details
   - Too long: Becomes overwhelming
   - Sweet spot: 1.5-3x original length

3. **Language Consistency**
   - Detect input language
   - Output in same language
   - Don't translate technical terms

4. **Structure Matters**
   - Well-structured prompts are more effective
   - Use clear sections and hierarchy
   - Specify desired output format

5. **Know the Strategy**
   - Different goals need different approaches
   - Match strategy to purpose
   - Be ready to iterate

## Code Reference

### Files Referenced
- `src/main/services/aiService.ts` - AI service with optimization logic
- `src/renderer/hooks/useOptimize.ts` - Strategy mapping and usage patterns
- `src/renderer/types/optimization.ts` - Type definitions

### Key Functions
- `optimizePrompt(text, options)` - Main optimization function
- `buildOptimizationPrompt(userPrompt, strategy)` - Prompt template builder
- `validateInput(text)` - Input validation
- `setGeminiAPIKey(apiKey)` - API key management (not needed for skill)

## Adapting to Claude Code

This skill differs from Axon in key ways:

1. **No External API**: Uses Claude's native understanding, not Gemini
2. **Conversational**: Provides explanations, not just optimized text
3. **Interactive**: Allows iteration and strategy switching
4. **Context-Aware**: Leages conversation history and context
5. **Simpler**: No persistence, analytics, or rate limiting

These differences make the skill more natural for Claude Code conversations while preserving the core optimization strategies from Axon.

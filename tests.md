# Prompt Enhancer - Test Cases

This document contains test cases for validating the prompt-enhancer skill functionality.

---

## Normal Cases

### Test 1: Simple Prompt → Detailed Strategy
**Input**: "Write a function to sort data"

**Expected Behavior**:
- Auto-select **Detailed** strategy (default for simple prompts)
- Add programming language specification
- Add technical requirements (type safety, error handling)
- Add performance expectations
- Result length: 1.5-3x original

**Verification**:
- [ ] Strategy explained ("Using Detailed because your prompt lacks context")
- [ ] Optimized prompt has 5-7 specific requirements
- [ ] Includes examples or constraints

---

### Test 2: Verbose Prompt → Concise Strategy
**Input**: "I was wondering if you could possibly help me by taking a look at the code that I wrote yesterday and maybe tell me if there are any problems or issues that you might be able to find because I'm not really sure if it's working correctly or not."

**Expected Behavior**:
- Auto-select **Concise** strategy (detected as verbose, >50 words)
- Remove redundant filler phrases
- Keep core request intact
- Reduce to 20-30% of original length

**Verification**:
- [ ] Strategy explained ("Using Concise to remove redundancy")
- [ ] Core meaning preserved
- [ ] Length reduced significantly

---

### Test 3: Creative Request → Creative Strategy
**Input**: "Give me ideas for a mobile app"

**Expected Behavior**:
- Auto-select **Creative** strategy (detected "ideas" keyword)
- Add domain fusion constraint
- Request multiple perspectives
- Suggest unconventional approaches

**Verification**:
- [ ] Strategy explained ("Using Creative to spark innovation")
- [ ] Includes unexpected combinations
- [ ] Asks for structured ideation

---

### Test 4: Explain Request → Educational Strategy
**Input**: "Explain recursion in programming"

**Expected Behavior**:
- Auto-select **Educational** strategy (detected "explain" keyword)
- Add teaching structure (progression from basics)
- Include analogies and examples
- Add practice element

**Verification**:
- [ ] Strategy explained ("Using Educational for clear explanations")
- [ ] Includes real-world analogy
- [ ] Has step-by-step structure
- [ ] Adds practice element

---

### Test 5: How-To Request → Action-Oriented Strategy
**Input**: "How do I set up a React project?"

**Expected Behavior**:
- Auto-select **Action-Oriented** strategy (detected "how to" pattern)
- Break down into numbered steps
- Add verification checkpoints
- Include troubleshooting

**Verification**:
- [ ] Strategy explained ("Using Action-Oriented for step-by-step guidance")
- [ ] Has clear step numbering
- [ ] Includes verification after each step
- [ ] Has troubleshooting section

---

## Edge Cases

### Test 6: Ultra-Short Prompt (1-2 words)
**Input**: "Code"

**Expected Behavior**:
- Recognize as severely underspecified
- Ask clarifying questions OR
- Apply **Detailed** strategy with assumptions stated
- Add multiple potential contexts

**Expected Response**:
```
I need more context to optimize this effectively. What kind of code do you need?
- A specific function or algorithm?
- Code in a particular language?
- Code for a specific problem domain?

Or I can provide a general optimization assuming you want production-ready code.
```

**Verification**:
- [ ] Asks for clarification OR states assumptions clearly
- [ ] Doesn't over-optimize without context

---

### Test 7: Already Detailed Prompt
**Input**: "Write a JavaScript function that implements a binary search algorithm on a sorted array of integers. The function should return the index of the target value if found, or -1 if not found. Include edge case handling for empty arrays and duplicate values. Add comments explaining the logic."

**Expected Behavior**:
- Recognize as already well-structured
- Don't add excessive detail
- Focus on structure refinement
- Suggest minor improvements only

**Verification**:
- [ ] Acknowledges prompt is already detailed
- [ ] Makes only minor structural improvements
- [ ] Doesn't double the length unnecessarily

---

### Test 8: Mixed Language (Chinese/English)
**Input**: "Write a function to 排序 an array of objects by timestamp"

**Expected Behavior**:
- Detect mixed language
- Preserve both languages naturally
- Optimize in language-dominant style
- Don't translate technical terms unnecessarily

**Verification**:
- [ ] Preserves Chinese characters
- [ ] Preserves English technical terms
- [ ] Output flows naturally in mixed language

---

### Test 9: Prompt with Code Blocks
**Input**:
```
Help me understand this code:

function fib(n) {
  if (n <= 1) return n;
  return fib(n-1) + fib(n-2);
}
```

**Expected Behavior**:
- Preserve code block formatting
- Add context around what code does
- Suggest improvements without breaking syntax
- Use **Educational** or **Analytical** strategy

**Verification**:
- [ ] Code block remains intact
- [ ] Adds explanatory context
- [ ] Suggests optimizations (e.g., memoization)

---

### Test 10: Ambiguous Prompt
**Input**: "Make it better"

**Expected Behavior**:
- Recognize as highly ambiguous
- Ask multiple clarifying questions:
  - What is "it"?
  - Better in what way?
  - What's the context?
- OR suggest multiple strategy options

**Expected Response**:
```
I'd like to help optimize your prompt, but I need more information:
1. What prompt or content are you referring to?
2. What does "better" mean to you? (more detailed? more concise? more creative?)

Could you share the original prompt?
```

**Verification**:
- [ ] Asks clarifying questions
- [ ] Doesn't make wild assumptions
- [ ] Offers to proceed with assumptions if preferred

---

## Language Detection Tests

### Test 11: Pure Chinese Input
**Input**: "帮我写一个排序数据的函数"

**Expected Behavior**:
- Detect Chinese as primary language
- Optimize in Chinese
- Provide explanations in Chinese
- Use **Detailed** strategy (default)

**Verification**:
- [ ] Output is in Chinese
- [ ] Explanations are in Chinese
- [ ] Adds appropriate Chinese technical terminology

---

### Test 12: Pure English Input
**Input**: "Write a function to sort data"

**Expected Behavior**:
- Detect English as primary language
- Optimize in English
- Provide explanations in English
- Use **Detailed** strategy (default)

**Verification**:
- [ ] Output is in English
- [ ] Explanations are in English
- [ ] Adds appropriate English technical terminology

---

### Test 13: Mixed Input (Code + Chinese)
**Input**: "Explain this code: function 斐波那契(n) { return n <= 1 ? n : 斐波那契(n-1) + 斐波那契(n-2); }"

**Expected Behavior**:
- Detect code as English-dominant (JavaScript)
- Preserve Chinese function name
- Provide explanation in language of query
- Use **Educational** strategy

**Verification**:
- [ ] Code syntax preserved
- [ ] Chinese function name kept intact
- [ ] Explanation language matches query

---

### Test 14: Mixed Input (Chinese + English Technical Terms)
**Input**: "帮我设计一个 RESTful API，包括 authentication 和 rate limiting"

**Expected Behavior**:
- Detect Chinese as primary language
- Keep English technical terms (RESTful, API, authentication, rate limiting)
- Don't translate technical terms
- Optimize structure in Chinese

**Verification**:
- [ ] Output in Chinese
- [ ] Technical terms remain in English
- [ ] Flows naturally

---

## Strategy Selection Tests

### Test 15: "Explain" Pattern → Educational
**Input Patterns**:
- "Explain how neural networks work"
- "Teach me about recursion"
- "Help me understand async/await"

**Expected Behavior**:
- Auto-select **Educational** strategy
- Cite "explain/teach/understand" keyword detection
- Add teaching structure

**Verification**:
- [ ] Strategy: Educational
- [ ] Reason: Detected learning-oriented keywords

---

### Test 16: "Analyze" Pattern → Analytical
**Input Patterns**:
- "Analyze this dataset"
- "Evaluate these three options"
- "Compare framework A vs framework B"

**Expected Behavior**:
- Auto-select **Analytical** strategy
- Cite "analyze/evaluate/compare" keyword detection
- Add evaluation framework

**Verification**:
- [ ] Strategy: Analytical
- [ ] Reason: Detected evaluation-oriented keywords

---

### Test 17: "How To" Pattern → Action-Oriented
**Input Patterns**:
- "How do I deploy to AWS?"
- "Implement user authentication"
- "Set up a development environment"

**Expected Behavior**:
- Auto-select **Action-Oriented** strategy
- Cite "how/implement/setup" keyword detection
- Add step-by-step structure

**Verification**:
- [ ] Strategy: Action-Oriented
- [ ] Reason: Detected implementation-oriented keywords

---

### Test 18: "Creative" Pattern → Creative
**Input Patterns**:
- "Brainstorm ideas for a startup"
- "Give me creative ways to solve X"
- "Inspire me with innovative approaches"

**Expected Behavior**:
- Auto-select **Creative** strategy
- Cite "brainstorm/creative/innovative" keyword detection
- Add ideation constraints

**Verification**:
- [ ] Strategy: Creative
- [ ] Reason: Detected ideation-oriented keywords

---

### Test 19: Business Context → Professional
**Input Patterns**:
- "Create a presentation for stakeholders"
- "Write a report for executive leadership"
- "Draft an email to a client"

**Expected Behavior**:
- Auto-select **Professional** strategy
- Cite business terminology detection
- Add formal language requirements

**Verification**:
- [ ] Strategy: Professional
- [ ] Reason: Detected business context terminology

---

### Test 20: No Pattern → Default (Detailed)
**Input**:
- "Optimize my prompt: Write code"
- "Make this better: Fix the bug"
- "Enhance this: Design a button"

**Expected Behavior**:
- Use **Detailed** strategy as default
- Explain it's the default strategy
- Add context, structure, and requirements

**Verification**:
- [ ] Strategy: Detailed
- [ ] Reason: Default strategy for unspecified prompts

---

## Strategy Override Tests

### Test 21: User Specifies Strategy
**Input**: "Optimize this using Creative mode: Write about climate change"

**Expected Behavior**:
- Honor user's strategy choice (Creative)
- Don't apply auto-selection logic
- Apply Creative strategy even if other patterns detected

**Verification**:
- [ ] Uses specified strategy (Creative)
- [ ] Ignores conflicting patterns (like "write about" → might normally be Detailed)

---

### Test 22: User Asks for Alternative
**Input**:
User: "Optimize my prompt"
Claude: [Provides Detailed optimization]
User: "Good, but make it more concise"

**Expected Behavior**:
- Re-optimize using **Concise** strategy
- Compare with previous output
- Explain what changed

**Verification**:
- [ ] Switches to Concise strategy
- [ ] Shows comparison
- [ ] Explains trade-offs

---

## Output Format Tests

### Test 23: Includes Key Improvements Section
**Any Input**

**Expected Output Format**:
```markdown
## Optimized Prompt (Strategy: [Strategy Name])

[Optimized prompt text]

---

**Key Improvements:**
- [What was added]
- [Why it helps]

**Alternative Strategies**: [List of alternatives]
```

**Verification**:
- [ ] Has clear section headers
- [ ] Lists 3-5 key improvements
- [ ] Explains reasoning for each
- [ ] Suggests alternative strategies

---

### Test 24: Length Expansion (1.5-3x Target)
**Input**: "Write a function to sort data" (6 words)

**Expected Behavior**:
- Output: 10-20 words for Concise
- Output: 20-50 words for Detailed (most likely)
- Output: 30-80 words for Creative

**Verification**:
- [ ] Length is proportional to strategy
- [ ] Not excessively long (>5x original)
- [ ] Not too short (<1.2x original)

---

## Integration Tests

### Test 25: End-to-End Conversation
**Full Scenario**:
```
User: "Can you help me optimize a prompt?"
Claude: "Of course! What prompt would you like me to enhance?"
User: "Write a React component"
Claude: [Auto-selects Detailed, provides optimization]
User: "Good, but can you make it more concise?"
Claude: [Re-optimizes with Concise strategy]
User: "Now try creative mode"
Claude: [Re-optimizes with Creative strategy]
```

**Verification**:
- [ ] Each iteration uses correct strategy
- [ ] Maintains conversation context
- [ ] Shows progression clearly
- [ ] Offers helpful suggestions

---

## Performance Tests

### Test 26: Response Time
**Input**: Any prompt

**Expected Behavior**:
- Response generated in <10 seconds
- No noticeable lag
- Smooth conversation flow

**Verification**:
- [ ] Response feels immediate
- [ ] No hanging or delays

---

### Test 27: Token Efficiency
**Input**: 50-word prompt

**Expected Behavior**:
- Total response <500 tokens
- Optimized prompt <300 tokens
- Explanations <200 tokens

**Verification**:
- [ ] Not excessively verbose
- [ ] Concise explanations
- [ ] Focused output

---

## Test Execution Checklist

To run all tests:
- [ ] Test Cases 1-5 (Normal Cases)
- [ ] Test Cases 6-10 (Edge Cases)
- [ ] Test Cases 11-14 (Language Detection)
- [ ] Test Cases 15-20 (Strategy Selection)
- [ ] Test Cases 21-22 (Strategy Override)
- [ ] Test Cases 23-24 (Output Format)
- [ ] Test Case 25 (Integration)
- [ ] Test Cases 26-27 (Performance)

**Pass Criteria**: 90% of tests passing (24/27)

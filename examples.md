# Prompt Enhancer - Examples

This document contains before/after examples for each of the 7 optimization strategies.

---

## Concise (简洁模式)

### Example 1: Verbose Request
**Original**:
"I was wondering if you could possibly help me by taking a look at the code that I wrote yesterday and maybe tell me if there are any problems or issues that you might be able to find because I'm not really sure if it's working correctly or not."

**Optimized**:
"Review my code for bugs and potential issues.
[Code]"

**What Changed**:
- Removed 80% of words (from 47 to 9)
- Eliminated filler phrases ("I was wondering", "possibly", "maybe")
- Kept core request: code review
- Made it actionable and clear

---

### Example 2: Redundant Communication
**Original**:
"Basically, what I need is for you to write a function that, in essence, takes an input and then returns it back to me, but doubled. So essentially, multiply by two."

**Optimized**:
"Write a function that doubles its input."

**What Changed**:
- Removed redundant phrases ("basically", "what I need is for you to", "in essence")
- Simplified description while keeping the exact requirement
- Went from 33 words to 7 words

---

### Example 3: Overly Polite Request
**Original**:
"Hi there! I was hoping you might be able to help me with something if you have the time. I need to understand what recursion is in programming. If you could explain it to me, that would be really great and I would appreciate it a lot."

**Optimized**:
"Explain recursion in programming."

**What Changed**:
- Removed politeness filler (not needed in AI prompts)
- Kept the core question
- Made it direct and efficient

---

### Example 4: Wordy Technical Request
**Original**:
"Can you please create for me a database schema that would be suitable and appropriate for storing information about users, including but not limited to their names, their email addresses, and also their passwords in a secure manner?"

**Optimized**:
"Design a secure database schema for users with name, email, and password fields."

**What Changed**:
- Condensed from 38 to 13 words
- Emphasized "secure" (key requirement)
- Specified fields clearly
- Removed filler ("including but not limited to", "also")

---

## Detailed (详细模式)

### Example 1: Vague Coding Request
**Original**:
"Write a function to sort data"

**Optimized**:
"Write a JavaScript function that sorts an array of objects by a specified property.

Requirements:
- Handle nested properties (e.g., 'user.address.city')
- Support both ascending and descending order
- Include TypeScript type definitions
- Add error handling for invalid inputs or non-existent properties
- Provide usage examples with different data types
- Target time complexity: O(n log n)
- Return a new array (don't mutate original)"

**What Changed**:
- Added programming language (JavaScript)
- Specified input type (array of objects)
- Added 6 specific technical requirements
- Included edge cases (nested properties, error handling)
- Specified performance expectations

---

### Example 2: Simple Content Request
**Original**:
"Write about climate change"

**Optimized**:
"Write a comprehensive article about climate change for general readers.

Structure:
1. Introduction: Definition and current status
2. Causes: Greenhouse effect, human activities, natural factors
3. Effects: Weather patterns, sea levels, ecosystems, agriculture
4. Solutions: Individual actions, policy changes, technology
5. Conclusion: Summary and call to action

Requirements:
- 800-1000 words
- Include recent statistics (2020-2024)
- Use scientific consensus sources
- Balance alarm with hope
- Add practical action items for readers
- Include 3-5 credible sources"

**What Changed**:
- Defined target audience (general readers)
- Added structured outline
- Specified word count
- Required recent data
- Included source requirements
- Asked for actionable content

---

### Example 3: Basic Design Request
**Original**:
"Design a logo"

**Optimized**:
"Design a logo for a sustainable coffee shop called 'GreenBean'.

Brand identity:
- Eco-friendly, modern, minimalist
- Target audience: Environmentally conscious millennials
- Colors: Earth tones (greens, browns, creams)

Deliverables:
- Primary logo (vector format)
- Logo variations (horizontal, stacked, icon-only)
- Color palette codes (HEX, RGB)
- Typography specifications
- Usage guidelines for print and digital

Technical requirements:
- Scalable from business card to billboard
- Works in single color (for stamping/embossing)
- Web-optimized versions (SVG, PNG with transparent background)"

**What Changed**:
- Added brand name and context
- Specified target audience
- Defined brand attributes
- Listed specific deliverables
- Added technical constraints
- Included use case scenarios

---

### Example 4: Generic Analysis Request
**Original**:
"Analyze this dataset"

**Optimized**:
"Perform exploratory data analysis on the provided sales dataset.

Analysis phases:
1. Data Overview
   - Dataset dimensions and types
   - Missing values and duplicates
   - Basic statistical summaries

2. Temporal Analysis
   - Sales trends over time (monthly, quarterly)
   - Seasonal patterns identification
   - Year-over-year comparisons

3. Category Analysis
   - Top/bottom performing categories
   - Category growth rates
   - Cross-category correlations

4. Customer Insights
   - Customer segmentation by purchase behavior
   - Repeat vs. first-time customer patterns
   - Average order value trends

Output format:
- Jupyter notebook with code and explanations
- Summary dashboard with key visualizations
- Actionable business recommendations"

**What Changed**:
- Added domain context (sales data)
- Created structured analysis framework
- Specified output format
- Added business focus
- Included visualization requirement

---

## Creative (创意模式)

### Example 1: Conventional Brainstorming
**Original**:
"Give me ideas for a mobile app"

**Optimized**:
"Brainstorm innovative mobile app concepts that merge two unrelated domains to solve everyday problems.

For each idea:
1. Domain Fusion: Which two unexpected fields are combined?
2. Core Problem: What specific pain point does it solve?
3. Target User: Who needs this and why?
4. Unique Features: 3 distinctive capabilities
5. Monetization: Sustainable revenue model
6. Competition: What makes this different?

Inspiration domains to consider:
- Gaming + productivity
- Fitness + finance
- Cooking + social networking
- Travel + education
- Music + mental health

Push boundaries: Don't just improve existing apps—create new categories."

**What Changed**:
- Added "domain fusion" constraint (sparks creativity)
- Required structured thinking for each idea
- Suggested unconventional domain combinations
- Asked for business model consideration
- Encouraged category creation vs. improvement

---

### Example 2: Standard Writing Request
**Original**:
"Write a story about time travel"

**Optimized**:
"Write a time travel story that subverts common clichés.

Creative constraints:
- Time machine: Not a machine—choose an unexpected method (biological, musical, emotional, culinary)
- Paradox approach: Embrace paradoxes as plot features, not problems to solve
- Structure: Non-linear timeline that reveals itself gradually
- Perspective: Tell from an unusual POV (the timeline itself, a paradox, a missed moment)

Themes to explore:
- Memory vs. history
- The weight of "what if"
- Multiple versions of self
- Time as a character

Aim for: 2000-3000 words with a twist that recontextualizes the entire story."

**What Changed**:
- Added anti-cliché constraint
- Specified unconventional approach
- Required unique perspective/POV
- Suggested thematic depth
- Asked for structural innovation

---

### Example 3: Generic Marketing Request
**Original**:
"Create marketing copy for shoes"

**Optimized**:
"Develop a provocative marketing campaign for minimalist running shoes that challenges the entire athletic footwear industry.

Campaign angles to explore:
- 'Less Shoe': Question whether cushioning actually helps
- 'Un-Shoe': Market what the product is NOT
- 'Foot Liberation': Frame as freedom movement, not purchase
- '10,000 Year Tech': Emphasize humans ran barefoot for millennia

For each angle:
- Create 5 punchy taglines (under 7 words each)
- Write a manifesto-style paragraph
- Suggest visual metaphors
- Identify influencers who'd authentically align

Push beyond 'comfortable' and 'durable'—find an emotional edge."

**What Changed**:
- Added provocative/challenge angle
- Required multiple campaign approaches
- Asked for manifesto-style content
- Specified tagline constraints
- Encouraged emotional depth over features

---

### Example 4: Standard Problem Solving
**Original**:
"How can I improve my productivity?"

**Optimized**:
"Explore radically unconventional approaches to productivity that question the premise of 'more output.'

Reframing prompts:
1. Anti-Productivity: What if doing less is the answer?
2. Biological Rhythms: Work with ultradian cycles, not against them
3. Environment Design: Change the space, not the habits
4. Strategic Laziness: Which tasks deserve to NOT be done?
5. Productivity Theater: Identify fake work that feels productive

For each approach:
- Concrete experiment to try for one week
- Metrics to measure (beyond 'tasks completed')
- Potential downsides and risks
- Scientific or anecdotal backing

Challenge: Don't just optimize—question whether the goal itself is right."

**What Changed**:
- Added reframing technique
- Questioned underlying premise
- Required unconventional thinking
- Asked for experimental approaches
- Included risk assessment
- Challenged the goal itself

---

## Professional (专业模式)

### Example 1: Casual Business Request
**Original**:
"Help me with a presentation about sales"

**Optimized**:
"Create a professional Q4 sales review presentation for executive leadership team.

Deliverables:
- 10-12 slide deck
- Speaker notes (200-300 words per slide)
- Data appendices with full metrics

Content structure:
1. Executive Summary (1 slide)
   - Key achievements vs. targets
   - Critical metrics dashboard
   - Strategic highlights

2. Performance Analysis (4-5 slides)
   - Revenue by region/product line
   - Year-over-year comparison
   - Pipeline velocity and conversion
   - Churn analysis and retention

3. Market Context (2 slides)
   - Competitive landscape shifts
   - Macro-economic impacts
   - Customer sentiment trends

4. Risks & Opportunities (2 slides)
   - Identified risks with mitigation
   - Growth opportunities ranked

5. Q1 Outlook (2 slides)
   - Forecasted performance
   - Strategic priorities

Tone: Data-driven, objective, concise
Visuals: Professional charts, minimal text per slide"

**What Changed**:
- Specified audience (executive leadership)
- Added detailed content structure
- Defined deliverable specifications
- Set professional tone guidelines
- Included visualization standards

---

### Example 2: Informal Project Update
**Original**:
"Tell the team how the project is going"

**Optimized**:
"Draft a formal project status update for stakeholders.

Distribution: Senior management, client leads, project team

Document structure:
1. Header Information
   - Project name and ID
   - Reporting period: [dates]
   - Overall status: On Track / At Risk / Off Track
   - RAG rating: Red / Amber / Green

2. Executive Summary (3-4 sentences)
   - Progress highlights
   - Critical blockers
   - Key decisions needed

3. Milestones & Deliverables
   - Completed this period
   - In progress with % complete
   - Planned next period
   - Schedule variance analysis

4. Budget & Resources
   - Spend vs. forecast
   - Resource utilization
   - Variance explanations

5. Risks & Issues
   - New risks identified
   - Issue status updates
   - Mitigation actions

6. Next Period Priorities
   - Top 3 focus areas
   - Support needed

Format: Professional memo style, PDF-attached"

**What Changed**:
- Added formal document structure
- Specified distribution list
- Included standard project management elements (RAG, milestones)
- Added budget/resource sections
- Defined format specifications

---

### Example 3: Simple Email Request
**Original**:
"Write an email asking for a meeting"

**Optimized**:
"Draft a professional meeting request email to a potential business partner.

Context:
- Sender: [Your role/company]
- Recipient: [Their role/company]
- Purpose: Explore partnership opportunity
- Relationship: Cold outreach (no prior contact)

Email components:
1. Subject Line: Professional, clear, compelling (under 10 words)
2. Salutation: Formal but not stiff
3. Opening: Value-driven hook (why them, why now)
4. Body: Brief context + clear meeting objective
5. Call to Action: Specific meeting request with time parameters
6. Sign-off: Professional with clear next steps

Tone: Respectful of time, confident but not presumptuous
Length: Under 150 words
Goal: Meeting acceptance, not immediate partnership"

**What Changed**:
- Added context parameters
- Specified cold outreach scenario
- Broke down email into components
- Set length constraints
- Defined clear outcome goal
- Specified professional tone

---

## Analytical (分析模式)

### Example 1: Vague Analysis Request
**Original**:
"Analyze this data"

**Optimized**:
"Perform a comprehensive data analysis of the provided customer behavior dataset.

Analytical Framework:

Phase 1: Data Quality Assessment
- Completeness: Missing values by field, patterns of absence
- Accuracy: Outlier detection, data validation checks
- Consistency: Cross-field validation, temporal consistency
- Timeliness: Recency assessment, staleness identification

Phase 2: Descriptive Statistics
- Central tendencies: Mean, median, mode for key metrics
- Dispersion: Standard deviation, variance, ranges
- Distributions: Histograms, Q-Q plots, normality tests
- Correlations: Pearson/Spearman matrices, scatter plots

Phase 3: Pattern Discovery
- Clustering: K-means/DBSCAN for customer segments
- Association: Market basket analysis, affinities
- Temporal: Time series decomposition, trend analysis
- Anomaly: Isolation forests, z-score analysis

Phase 4: Inferential Statistics
- Hypothesis: A/B test results, significance testing
- Relationships: Regression analysis, feature importance
- Predictive: Forecasting models, confidence intervals

Phase 5: Strategic Insights
- Key findings: Top 5 discoveries with business impact
- Recommendations: Action items prioritized by feasibility/impact
- Limitations: Methodological constraints and data gaps

Output: Jupyter notebook with markdown explanations, visualizations, and executive summary."

**What Changed**:
- Added structured analytical framework (5 phases)
- Specified statistical techniques for each phase
- Included strategic output requirements
- Defined deliverable format

---

### Example 2: Simple Comparison Request
**Original**:
"Compare these options"

**Optimized**:
"Conduct a comparative analysis of three technology options.

Evaluation Framework:

Dimension 1: Technical Capabilities
- Performance benchmarks
- Scalability limits
- Integration complexity
- Security features
- Reliability metrics

Dimension 2: Business Factors
- Total cost of ownership (3-year horizon)
- Implementation timeline
- Vendor stability and support
- Talent market availability
- Exit strategy considerations

Dimension 3: Strategic Fit
- Alignment with long-term architecture
- Competitive differentiation potential
- Innovation trajectory
- Risk profile
- Regulatory compliance

Scoring methodology:
- Weight each dimension (Technical: 40%, Business: 35%, Strategic: 25%)
- Score each option 1-10 per criterion
- Calculate weighted scores
- Perform sensitivity analysis on weights

Output format:
- Comparison matrix with scores
- Narrative analysis of strengths/weaknesses
- Recommendation with rationale
- Implementation considerations
- Risk mitigation strategies for chosen option"

**What Changed**:
- Added multi-dimensional evaluation framework
- Specified scoring methodology
- Included sensitivity analysis
- Defined structured output format

---

### Example 3: Basic Evaluation Request
**Original**:
"Is this a good idea?"

**Optimized**:
"Evaluate the proposed business idea using a structured decision framework.

Analysis Components:

1. Market Assessment
- Total addressable market (TAM) sizing
- Serviceable addressable market (SAM) estimation
- Market growth rate and trends
- Competitive landscape analysis
- Market timing assessment

2. Business Model Viability
- Revenue model identification
- Unit economics analysis
- Customer acquisition cost (CAC) projection
- Lifetime value (LTV) estimation
- Break-even analysis

3. Execution Feasibility
- Resource requirements (capital, talent, time)
- Technical feasibility assessment
- Regulatory/legal barriers
- Strategic partnerships needed
- Go-to-market strategy evaluation

4. Risk Analysis
- Market risks (competition, demand shifts)
- Operational risks (execution, scaling)
- Financial risks (cash flow, funding)
- Reputation/regulatory risks
- Risk mitigation strategies

5. Strategic Alignment
- Fit with core competencies
- Synergy with existing operations
- Long-term strategic value
- Exit potential

Output: Go/No-Go recommendation with confidence level, key assumptions, and pre-conditions for success."

**What Changed**:
- Added 5-component evaluation framework
- Specified business analysis tools
- Included risk assessment
- Required strategic alignment check
- Defined clear output format

---

## Educational (教学模式)

### Example 1: Simple Explanation Request
**Original**:
"Explain recursion"

**Optimized**:
"Explain the concept of recursion in programming for someone with basic coding knowledge.

Teaching Structure:

1. Conceptual Foundation
- Simple definition in plain English
- Real-world analogy (e.g., Russian nesting dolls, family trees)
- Why recursion exists (problems it solves naturally)

2. Basic Example Walkthrough
- Simple function (e.g., factorial or countdown)
- Line-by-line execution trace with call stack visualization
- Show how the stack grows and shrinks

3. Visual Representation
- Call stack diagram with frames
- Arrow tracing showing flow
- Base case vs. recursive case distinction

4. Common Applications
- Tree traversals
- Directory/folder structure operations
- Divide-and-conquer algorithms
- Backtracking

5. Critical Pitfalls
- Missing base case → stack overflow
- Excessive memory usage
- Debugging challenges

6. Comparison with Iteration
- When to use recursion vs. loops
- Performance trade-offs
- Code readability comparison

7. Practice Exercise
- Problem to solve recursively
- Hint before solution
- Solution with explanation

Target understanding level: Can write a simple recursive function and explain why it works."

**What Changed**:
- Added structured teaching progression
- Included real-world analogy
- Specified visual elements
- Added practical applications
- Covered common mistakes
- Included practice exercise

---

### Example 2: Basic Concept Request
**Original**:
"What is API?"

**Optimized**:
"Explain APIs (Application Programming Interfaces) to a non-technical business professional.

Learning Objectives:
By the end, learner should:
- Understand what an API is conceptually
- Know how businesses use APIs
- Recognize API integration examples
- Speak confidently about APIs in meetings

Teaching Approach:

1. Restaurant Analogy (The Core Concept)
- Kitchen = Server/Backend
- Menu = API documentation
- Waiter = API itself
- Diner = Client application
- Order flow = API request/response cycle

2. Real-World Examples
- "Log in with Google" (authentication API)
- Weather widget on website (data API)
- Booking through Expedia (aggregator API)
- Shopify payment processing (payment API)

3. Business Value
- Why companies build APIs (reach, partnerships)
- Why companies use APIs (speed, capability)
- API economy examples (Salesforce, Stripe, Twilio)

4. Key Concepts Simplified
- Endpoint = Specific function or data source
- Request = Asking for something
- Response = What you get back
- Rate limit = How many requests allowed
- Authentication = Security verification

5. Conversation Examples
- "We need an API" = We need to expose our data/features to others
- "Let's integrate their API" = Let's use their service in our product
- "API is down" = The connection between systems isn't working

6. Quick Quiz
- 5 scenario-based questions
- Answers with explanations

Format: Conversational, business-context focused, minimal technical jargon."

**What Changed**:
- Defined learning objectives
- Used relatable restaurant analogy
- Provided business-focused examples
- Translated technical terms to business language
- Added conversation scenarios
- Included reinforcement quiz

---

### Example 3: Generic Learning Request
**Original**:
"Teach me about machine learning"

**Optimized**:
"Provide an introduction to machine learning for a curious beginner with math background through high school algebra.

Curriculum Structure:

Module 1: What is Machine Learning?
- Definition vs. traditional programming
- Learning from data vs. explicit rules
- Types: Supervised, Unsupervised, Reinforcement
- Real-world examples (recommendations, spam filters, self-driving cars)

Module 2: How Machines Learn
- Feature representation (what data looks like to ML)
- Loss functions (how ML measures "wrongness")
- Optimization (how ML improves)
- Overfitting vs. underfitting (analogy: memorizing vs. understanding)

Module 3: Key Concepts Explained
- Training data vs. test data (why we separate)
- Model selection (choosing the algorithm)
- Hyperparameters (settings before learning)
- Evaluation metrics (accuracy, precision, recall)

Module 4: Common Algorithms (Intuitively)
- Linear regression (fitting a line)
- Decision trees (20 questions game)
- Neural networks (brain-inspired learning)
- Clustering (grouping similar things)

Module 5: Building Your First Model
- Problem: Predict house prices
- Data: Square footage, bedrooms, location
- Tool: Scikit-learn (Python library)
- Step-by-step walkthrough with code explanations

Module 6: Ethical Considerations
- Bias in training data
- Fairness and accountability
- Privacy concerns
- Transparency vs. trade secrets

Module 7: Next Steps
- Practice datasets and competitions
- Online courses recommendations
- Common applications by industry

Format: Mix of explanations, analogies, visual descriptions, and hands-on tutorial."

**What Changed**:
- Created 7-module curriculum
- Defined target audience background
- Included intuitive explanations
- Added hands-on component
- Covered ethical considerations
- Provided learning path forward

---

## Action-Oriented (行动模式)

### Example 1: Generic Setup Request
**Original**:
"Set up a React project"

**Optimized**:
"Set up a new React project with TypeScript and modern tooling. Follow this step-by-step guide.

Prerequisites Check:
Before starting, verify:
- [ ] Node.js 18+ installed (run: `node --version`)
- [ ] npm or yarn available (run: `npm --version`)
- [ ] Code editor installed (VS Code recommended)
- [ ] Git installed (run: `git --version`)

Step 1: Initialize Project
```bash
# Create project with Vite (faster than Create React App)
npm create vite@latest my-react-app -- --template react-ts

# Navigate into project
cd my-react-app

# Install dependencies
npm install
```

Verification: Run `npm run dev` → Should see "Vite + React" page at http://localhost:5173

Step 2: Configure ESLint and Prettier
```bash
# Install dev dependencies
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D prettier eslint-config-prettier eslint-plugin-prettier

# Create .eslintrc.json with TypeScript rules
# Create .prettierrc with formatting preferences
```

Verification: Run `npm run lint` → Should show no errors

Step 3: Set Up Folder Structure
```
src/
├── components/    # Reusable UI components
├── hooks/         # Custom React hooks
├── utils/         # Helper functions
├── types/         # TypeScript type definitions
├── services/      # API calls
└── styles/        # Global styles
```

Verification: Create folders and add index.ts to each

Step 4: Configure Path Aliases
Update `tsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

Verification: Import with `@/components/Button` → Should resolve correctly

Step 5: Verify Complete Setup
```bash
# Type check
npm run build

# Run tests (if configured)
npm test

# Start dev server
npm run dev
```

Success criteria:
- [ ] TypeScript compiles without errors
- [ ] Dev server runs with hot reload
- [ ] ESLint and Prettier work
- [ ] Path aliases resolve
- [ ] Can build for production

Troubleshooting:
- Port 5173 in use? Change in vite.config.ts
- Import errors? Check tsconfig paths
- Slow dev server? Check system resources"

**What Changed**:
- Added prerequisites checklist
- Broke down into 5 numbered steps
- Included verification after each step
- Added code blocks for commands
- Provided success criteria checklist
- Included troubleshooting section

---

### Example 2: Vague Deployment Request
**Original**:
"Deploy my app"

**Optimized**:
"Deploy a React application to production. Complete deployment workflow.

Phase 1: Pre-Deployment Checklist
- [ ] Environment variables configured
- [ ] API endpoints updated to production URLs
- [ ] Build optimizations enabled
- [ ] Error tracking integrated (Sentry, etc.)
- [ ] Analytics configured (if needed)
- [ ] Tests passing locally
- [ ] Sensitive data removed from code

Phase 2: Build for Production
```bash
# Create optimized production build
npm run build

# Verify build output
ls -la dist/  # Should contain index.html, assets/
```

Success criteria: Build completes without errors, dist/ folder created

Phase 3: Choose Deployment Platform

Option A: Vercel (Recommended for React)
1. Push code to GitHub repository
2. Visit vercel.com → "New Project"
3. Import GitHub repository
4. Configure:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Click "Deploy"

Option B: Netlify
1. Push code to GitHub
2. Visit netlify.com → "Add new site"
3. Import from GitHub
4. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Deploy

Phase 4: Post-Deployment Verification
- [ ] Site loads at production URL
- [ ] All pages accessible (no 404s)
- [ ] Console shows no errors
- [ ] API calls functioning
- [ ] Environment variables active
- [ ] Performance acceptable (Lighthouse score >90)

Phase 5: Monitor and Scale
- Set up uptime monitoring (UptimeRobot, Pingdom)
- Configure error alerts
- Review analytics after 24 hours
- Plan capacity scaling if needed

Rollback Plan:
If deployment fails:
```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or redeploy previous working version
# Platform-specific rollback in dashboard
```

Estimated time: 15-30 minutes
Cost: Free tier available on both platforms (sufficient for most projects)"

**What Changed**:
- Added pre-deployment checklist
- Provided multiple deployment options
- Included post-deployment verification
- Added rollback procedures
- Estimated time and cost
- Structured as clear phases

---

### Example 3: Generic Debugging Request
**Original**:
"Fix this bug"

**Optimized**:
"Systematically debug the reported issue. Follow this debugging process.

Step 1: Understand the Problem
- Gather bug report details:
  - [ ] Expected behavior
  - [ ] Actual behavior
  - [ ] Steps to reproduce
  - [ ] Error messages (screenshots, logs)
  - [ ] Browser/environment information

- Reproduce the bug:
  - [ ] Can you reproduce it consistently?
  - [ ] What are the exact steps?
  - [ ] What conditions trigger it?

Step 2: Isolate the Issue
- Binary search approach:
  - Comment out half the code → Bug still there?
  - Narrow down to specific component/function
  - Identify the exact line causing issue

- Check common causes:
  - [ ] Typo in variable name
  - [ ] Missing import
  - [ ] Incorrect data type
  - [ ] Async/await issue
  - [ ] State mutation
  - [ ] Null/undefined value

Step 3: Add Debugging Output
```javascript
// Add console.log statements
console.log('Variable value:', variable);
console.log('Function called with:', args);

// Use debugger statement
debugger;  // Pauses execution (use browser DevTools)

// Add breakpoints in browser DevTools
// Sources tab → Click line number
```

Step 4: Form Hypothesis
Based on evidence, what do you think is wrong?
- Example: "The bug occurs because the state update is asynchronous"
- Example: "The API call fails because the endpoint is incorrect"

Step 5: Test Hypothesis
```javascript
// Add verification code
if (hypothesis correct) {
  console.log('Confirmed: issue is X');
} else {
  console.log('Ruled out: issue is not X');
  // Form new hypothesis
}
```

Step 6: Implement Fix
```javascript
// Before (buggy code)
// [buggy code here]

// After (fixed code)
// [fixed code here]
```

Step 7: Verify Fix
- [ ] Bug no longer occurs
- [ ] No new bugs introduced
- [ ] Edge cases tested
- [ ] Related features still work
- [ ] Tests pass (if applicable)

Step 8: Document and Prevent
- Add code comment explaining the fix
- Write test case to prevent regression
- Update documentation if needed
- Share learning with team

Time-boxing: If stuck >30 minutes, escalate to team lead or senior developer."

**What Changed**:
- Added 8-step systematic debugging process
- Included verification checkpoints
- Provided code examples for debugging
- Added hypothesis testing approach
- Included time-boxing guidance
- Covered documentation and prevention

---

## Summary Table

| Strategy | Primary Use Case | Key Transformation |
|----------|------------------|-------------------|
| **Concise** | Verbose, redundant prompts | Removes 60-80% of words while keeping meaning |
| **Detailed** | Simple, vague prompts | Adds 3-6x detail with structure and requirements |
| **Creative** | Conventional, boring prompts | Adds unexpected constraints and domain fusion |
| **Professional** | Casual, informal prompts | Transforms to business-appropriate language |
| **Analytical** | Unstructured evaluation requests | Adds multi-dimensional framework |
| **Educational** | Basic "explain X" requests | Creates structured learning progression |
| **Action-Oriented** | "How to" requests | Breaks down into step-by-step with verification |

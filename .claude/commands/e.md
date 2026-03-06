---
description: "Enhance your prompt with full codebase context — like Augment but visible"
---

Use the Chiron MCP tools to enhance this request with full repository context.

## Process (show EVERY step explicitly):

### Step 1: 🔍 Scan Project
Call the `scan_project` tool from the `chiron` MCP server to understand the codebase structure, tech stack, and key files.

### Step 2: 📂 Find Relevant Code
Call the `find_relevant_code` tool with keywords extracted from the request below. Show which files were found and their relevance scores.

### Step 3: 🧠 Enhance Prompt
Call the `enhance_prompt` tool with the full request text. Display the complete enhanced specification it returns.

### Step 4: 🚀 Execute
Using the enhanced specification as your guide, execute the task. Follow the verification checklist provided in the enhanced spec.

---

## Request to enhance:

$ARGUMENTS

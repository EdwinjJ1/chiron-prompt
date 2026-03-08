#!/usr/bin/env node

import { execFile, spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import { ContextEngine } from '../src/context-engine.mjs';
import { Enhancer } from '../src/enhancer.mjs';

const execFileAsync = promisify(execFile)
const MAX_BUFFER_BYTES = 10 * 1024 * 1024

function spawnWithStdin(cmd, args, input, options) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      ...options,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    const chunks = [];
    const errChunks = [];
    child.stdout.on('data', (chunk) => chunks.push(chunk));
    child.stderr.on('data', (chunk) => errChunks.push(chunk));
    child.on('error', reject);
    child.on('close', (code) => {
      const stdout = Buffer.concat(chunks).toString('utf8');
      const stderr = Buffer.concat(errChunks).toString('utf8');
      if (code !== 0) {
        reject(new Error(`${cmd} exited with code ${code}. Stderr: ${stderr.trim()}`));
        return;
      }
      resolve({ stdout, stderr });
    });
    child.stdin.write(input);
    child.stdin.end();
  });
}

function extractExistingPrompt(value) {
  const originalRequestMatch = value.match(
    /##\s*📝\s*Original Request\s*```([\s\S]*?)```/i,
  );
  if (originalRequestMatch?.[1]?.trim()) {
    return originalRequestMatch[1].trim();
  }

  const objectiveMatch = value.match(/\*\*Objective\*\*:\s*(.+)/i);
  if (objectiveMatch?.[1]?.trim()) {
    return objectiveMatch[1].trim();
  }

  const firstLine = value
    .split('\n')
    .map((line) => line.trim())
    .find(Boolean);

  if (!firstLine) {
    return value;
  }

  const inlineTaskMatch = firstLine.match(/^(task|任务)\s*[:：]\s*(.+)$/i);
  if (inlineTaskMatch?.[2]?.trim()) {
    return inlineTaskMatch[2].trim();
  }

  const hasInlineContext =
    /\n(?:project stack|primary framework|relevant files|current branch|focus areas)\s*:/i.test(
      value,
    ) ||
    /\n(?:项目技术栈|主要框架|相关文件|当前分支|重点)\s*：/i.test(value);

  if (hasInlineContext) {
    return firstLine;
  }

  return value;
}

function normalizePrompt(value) {
  let result = extractExistingPrompt(value.trim());
  while (/^task:\s*/i.test(result)) {
    result = result.replace(/^task:\s*/i, '').trim();
  }
  result = result.replace(/^任务：\s*/i, '').trim();
  return result;
}

function formatProjectContext(projectContext) {
  const lines = [];
  if (projectContext?.framework) {
    lines.push(`- Framework: ${projectContext.framework}`);
  }
  if (projectContext?.language) {
    lines.push(`- Language: ${projectContext.language}`);
  }
  if (projectContext?.techStack?.length) {
    lines.push(`- Stack: ${projectContext.techStack.join(', ')}`);
  }

  const pkg = projectContext?.keyFiles?.['package.json'];
  if (pkg?.name) {
    lines.push(`- Package: ${pkg.name}${pkg.version ? `@${pkg.version}` : ''}`);
  }

  return lines.join('\n');
}

function formatRelevantFiles(relevantFiles) {
  if (!relevantFiles?.length) {
    return '- No relevant files found';
  }

  return relevantFiles
    .slice(0, 4)
    .map((file) => {
      const snippet = file.content?.trim()
        ? `\nSnippet:\n\`\`\`\n${file.content.trim()}\n\`\`\``
        : '';
      return `- ${file.path} (score ${file.score})${snippet}`;
    })
    .join('\n\n');
}

function buildGeminiEnhancementPrompt({
  rawPrompt,
  strategy,
  projectContext,
  relevantFiles,
  gitContext,
}) {
  const branchLine = gitContext?.branch ? `- Branch: ${gitContext.branch}` : '- Branch: unknown';

  return `
You are Chiron, an in-place prompt enhancer running inside Gemini CLI.

Your job is to rewrite the user's raw request into a better prompt for Gemini to execute next.
Use the repository context below to make the request more specific and more useful.

Rules:
- Return only the final rewritten prompt.
- Do not explain what you changed.
- Do not use headings like "Task:", "Project stack:", "Focus areas:", or markdown sections.
- Do not output code fences.
- Keep the same language as the user's request.
- Sound like a stronger user prompt, not like a report template.
- Be concrete: mention relevant files, constraints, risks, and likely focus areas when they matter.
- Stay concise enough to fit naturally in a CLI input box.
- If the request is already specific, refine it lightly instead of bloating it.

Detected strategy: ${strategy}

User request:
${rawPrompt}

Project context:
${formatProjectContext(projectContext)}
${branchLine}

Relevant files and snippets:
${formatRelevantFiles(relevantFiles)}
`.trim();
}

function sanitizeGeminiResponse(value) {
  let result = value.trim();

  result = result.replace(/^```(?:markdown|md|text)?\s*/i, '').trim();
  result = result.replace(/```$/i, '').trim();
  result = result.replace(/^Here is the enhanced prompt:\s*/i, '').trim();
  result = result.replace(/^Enhanced prompt:\s*/i, '').trim();
  result = result.replace(/^以下是增强后的提示词：\s*/i, '').trim();
  result = result.replace(/^增强后的提示词：\s*/i, '').trim();

  return result;
}

function enhanceLocally({
  rawPrompt,
  strategy,
  projectContext,
  relevantFiles,
  gitContext,
  enhancer,
}) {
  return enhancer.enhanceInline({
    rawPrompt,
    strategy,
    projectContext,
    relevantFiles,
    gitContext,
  });
}

async function enhanceWithGemini({
  rawPrompt,
  strategy,
  projectContext,
  relevantFiles,
  gitContext,
}) {
  const geminiCmd = process.env.CHIRON_GEMINI_CMD || 'gemini';
  const geminiModel = process.env.CHIRON_ENHANCE_MODEL || 'flash';
  const timeoutMs = Number(process.env.CHIRON_ENHANCE_TIMEOUT_MS || 30000);
  const prompt = buildGeminiEnhancementPrompt({
    rawPrompt,
    strategy,
    projectContext,
    relevantFiles,
    gitContext,
  });
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'chiron-enhance-'));

  try {
    const effectiveTimeout = Number.isFinite(timeoutMs) ? timeoutMs : 30000;
    const spawnOptions = {
      cwd: tempDir,
      timeout: effectiveTimeout,
      maxBuffer: MAX_BUFFER_BYTES,
      env: {
        ...process.env,
        NO_COLOR: '1',
      },
    };

    let stdout;
    let stderr = '';
    try {
      ({ stdout, stderr } = await spawnWithStdin(
        geminiCmd,
        ['-m', geminiModel],
        prompt,
        spawnOptions,
      ));
    } catch (err1) {
      try {
        const result = await execFileAsync(
          geminiCmd,
          ['-m', geminiModel, '-p', prompt],
          spawnOptions,
        );
        stdout = result.stdout;
        stderr = result.stderr;
      } catch (err2) {
        throw new Error(`Execution failed.\nspawn error: ${err1.message}\nexec error: ${err2.message || err2}`);
      }
    }

    const cleaned = sanitizeGeminiResponse(stdout || '');
    if (!cleaned) {
      const detail = stderr?.trim() ? `\nStderr output:\n${stderr.trim()}` : '';
      throw new Error(`Gemini returned empty enhancement output.${detail}`);
    }

    return cleaned;
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

async function enhancePrompt({
  backend,
  rawPrompt,
  strategy,
  projectContext,
  relevantFiles,
  gitContext,
  enhancer,
}) {
  switch (backend) {
    case 'local':
      return enhanceLocally({
        rawPrompt,
        strategy,
        projectContext,
        relevantFiles,
        gitContext,
        enhancer,
      });
    case 'gemini':
      return enhanceWithGemini({
        rawPrompt,
        strategy,
        projectContext,
        relevantFiles,
        gitContext,
      });
    default:
      throw new Error(
        `Unsupported CHIRON_ENHANCE_BACKEND: ${backend}. Expected "gemini" or "local".`,
      );
  }
}

async function main() {
  const rawArg = process.argv.slice(2).join(' ').trim();
  if (!rawArg) {
    process.stdout.write('No prompt provided. Usage: /e <your request>\n');
    return;
  }

  const rawPrompt = normalizePrompt(rawArg);
  const contextEngine = new ContextEngine(process.cwd());
  const enhancer = new Enhancer();

  const projectContext = await contextEngine.scanProject(3);
  const relevantFiles = await contextEngine.findRelevantFiles(rawPrompt, {
    maxResults: 4,
    includeContent: true,
  });
  const gitContext = await contextEngine.getGitContext();

  const strategy = enhancer.detectStrategy(rawPrompt);
  const backend = (process.env.CHIRON_ENHANCE_BACKEND || 'gemini').trim().toLowerCase();
  const enhanced = await enhancePrompt({
    backend,
    rawPrompt,
    strategy,
    projectContext,
    relevantFiles,
    gitContext,
    enhancer,
  });

  process.stdout.write(enhanced);
}

main().catch((error) => {
  const detail = error instanceof Error ? error.message : String(error);
  process.stderr.write(`Chiron enhance failed: ${detail}\n`);
  process.exit(1);
});

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
    // If the child exits before consuming stdin, write() raises EPIPE,
    // which would crash the process without this handler.
    child.stdin.on('error', () => {});
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
  const prefix = /^(?:task\s*[:：]|任务\s*[:：])\s*/i;
  while (prefix.test(result)) {
    result = result.replace(prefix, '').trim();
  }
  return result;
}

/**
 * Build a natural-language context paragraph from repo scan results.
 * Avoids labeled key-value format — produces prose that reads like
 * a dev describing their project, so Gemini outputs in the same register.
 */
function buildNaturalContext({ projectContext, relevantFiles, gitContext }) {
  const parts = [];

  // Project identity
  const stack = [projectContext?.framework, projectContext?.language]
    .filter(Boolean)
    .join('/');
  const pkg = projectContext?.keyFiles?.['package.json'];
  const pkgName = pkg?.name ? ` (${pkg.name})` : '';
  if (stack) {
    parts.push(`This is a ${stack} project${pkgName}.`);
  } else if (pkgName) {
    parts.push(`Project: ${pkgName.slice(2, -1)}.`);
  }

  // Tech stack extras
  if (projectContext?.techStack?.length > 0) {
    const extras = projectContext.techStack
      .filter((t) => t !== projectContext.framework && t !== projectContext.language)
      .slice(0, 5);
    if (extras.length > 0) {
      parts.push(`Stack includes: ${extras.join(', ')}.`);
    }
  }

  // Git branch
  if (gitContext?.branch) {
    parts.push(`Current branch: ${gitContext.branch}.`);
  }

  // Relevant files — name them naturally, include snippet if short enough
  if (relevantFiles?.length > 0) {
    const fileDescs = relevantFiles.slice(0, 4).map((f) => {
      const snippet = f.content?.trim()
        ? ` — snippet:\n\`\`\`\n${f.content.trim().slice(0, 400)}\n\`\`\``
        : '';
      return `${f.path}${snippet}`;
    });
    parts.push(`Relevant files:\n${fileDescs.join('\n')}`);
  }

  return parts.join('\n');
}

function buildGeminiEnhancementPrompt({ rawPrompt, projectContext, relevantFiles, gitContext }) {
  const context = buildNaturalContext({ projectContext, relevantFiles, gitContext });

  return `You are an expert developer working inside a CLI tool. Your job is to rewrite a vague or underspecified request into a precise, natural prompt that another developer (or AI) could execute immediately without asking follow-up questions.

Step 1: Infer what type of task this is and what you would need to know about this specific repo to do it well. (Do this silently — do not output this step.)

Step 2: Use the repo context below to answer those questions. (Do this silently — do not output this step.)

Step 3: Output only the rewritten prompt — one or two natural sentences. Sound like a senior developer who already knows this codebase typing a request. Be concrete: name the actual files, patterns, commands, and constraints that matter for this specific task.

Rules:
- Use the same language as the user's request (Chinese in → Chinese out, English in → English out)
- If the request is already specific enough, refine it lightly instead of bloating it
- Never output headers like "Task:", "Strategy:", "Context:", "Step 1:", or similar
- Never explain what you changed or why
- No bullet points, no markdown sections, no code fences around your output

Repo context:
${context}

User request:
${rawPrompt}`.trim();
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

function enhanceLocally({ rawPrompt, enhancer }) {
  return enhancer.enhanceInline(rawPrompt);
}

async function enhanceWithGemini({ rawPrompt, projectContext, relevantFiles, gitContext }) {
  const geminiCmd = process.env.CHIRON_GEMINI_CMD || 'gemini';
  const geminiModel = process.env.CHIRON_ENHANCE_MODEL || 'flash';
  const timeoutMs = Number(process.env.CHIRON_ENHANCE_TIMEOUT_MS || 30000);
  const prompt = buildGeminiEnhancementPrompt({
    rawPrompt,
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

async function enhancePrompt({ backend, rawPrompt, projectContext, relevantFiles, gitContext, enhancer }) {
  switch (backend) {
    case 'local':
      return enhanceLocally({ rawPrompt, enhancer });
    case 'gemini':
      return enhanceWithGemini({ rawPrompt, projectContext, relevantFiles, gitContext });
    default:
      throw new Error(
        `Unsupported CHIRON_ENHANCE_BACKEND: ${backend}. Expected "gemini" or "local".`,
      );
  }
}

function readStdin() {
  return new Promise((resolve, reject) => {
    if (process.stdin.isTTY) {
      resolve('');
      return;
    }
    const chunks = [];
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => chunks.push(chunk));
    process.stdin.on('end', () => resolve(chunks.join('').trim()));
    process.stdin.on('error', reject);
  });
}

async function main() {
  const args = process.argv.slice(2);

  // `--inline` is a legacy flag some integrations (claw-code) still pass;
  // it must never leak into the prompt text.
  const argvText = args.filter((a) => a !== '--inline').join(' ').trim();
  // argv wins when present; stdin is only consumed when no argv prompt is
  // given. Waiting on stdin while holding an argv prompt hangs forever when
  // the host CLI keeps the pipe open without writing (gemini overlay's
  // execFile invocation), freezing Ctrl+E at the enhancing indicator.
  const rawArg = argvText || (await readStdin());

  if (!rawArg) {
    process.stderr.write('Usage: chiron-enhance <prompt>\n');
    process.stderr.write('       echo <prompt> | chiron-enhance\n');
    process.exit(1);
  }

  const rawPrompt = normalizePrompt(rawArg);
  const contextEngine = new ContextEngine(process.cwd());
  const enhancer = new Enhancer();

  const taskType = enhancer.detectTaskType(rawPrompt);
  const projectContext = await contextEngine.scanProject(3);
  const relevantFiles = await contextEngine.findRelevantFiles(rawPrompt, {
    maxResults: 4,
    includeContent: true,
    taskType,
  });
  const gitContext = await contextEngine.getGitContext();


  const backend = (process.env.CHIRON_ENHANCE_BACKEND || 'gemini').trim().toLowerCase();
  const enhanced = await enhancePrompt({
    backend,
    rawPrompt,
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

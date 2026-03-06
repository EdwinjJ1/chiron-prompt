import {spawn, spawnSync} from 'node:child_process';

export interface GeminiProbeResult {
  supportsPromptFlag: boolean;
}

export function probeGemini(): GeminiProbeResult {
  const help = spawnSync('gemini', ['--help'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });

  if (help.error) {
    throw help.error;
  }

  const output = `${help.stdout ?? ''}\n${help.stderr ?? ''}`;
  return {
    supportsPromptFlag: /(^|\s)-p(\s|,|$)|--prompt/.test(output)
  };
}

function runGeminiWithArgs(args: string[], prompt?: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const stdio: ['pipe' | 'inherit', 'inherit', 'inherit'] = prompt
      ? ['pipe', 'inherit', 'inherit']
      : ['inherit', 'inherit', 'inherit'];

    const child = spawn('gemini', args, {
      stdio,
      env: {...process.env}
    });

    child.on('error', (error) => {
      reject(error);
    });

    if (prompt && child.stdin) {
      child.stdin.write(prompt);
      child.stdin.end();
    }

    child.on('exit', (code) => {
      resolve(code ?? 0);
    });
  });
}

export async function handoffToGemini(prompt: string, probe?: GeminiProbeResult): Promise<number> {
  const supportsPromptFlag = probe?.supportsPromptFlag ?? false;

  if (supportsPromptFlag) {
    const code = await runGeminiWithArgs(['-p', prompt]);
    if (code === 0) {
      return 0;
    }

    return runGeminiWithArgs([], prompt);
  }

  return runGeminiWithArgs([], prompt);
}

import React from 'react';
import {render} from 'ink';
import {App} from './components/App.js';
import {handoffToGemini, probeGemini} from './engine/gemini.js';

function printHelp(): void {
  console.log(`
🏹 Chiron TUI

用法:
  chiron
  chiron --help

快捷键:
  Ctrl+E      原地增强输入提示词
  Enter       发送到 Gemini
  Shift+Enter 插入换行（终端支持可能有差异）
  Esc         还原或清空输入
  Ctrl+C      退出
`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    return;
  }

  let unmount: (() => void) | null = null;

  const app = render(
    <App
      onSubmitPrompt={async (prompt) => {
        let probe;
        try {
          probe = probeGemini();
        } catch (error) {
          const err = error as NodeJS.ErrnoException;
          if (err.code === 'ENOENT') {
            throw new Error('gemini CLI not found. Install it and make sure it is in PATH.');
          }

          throw error;
        }

        if (unmount) {
          unmount();
        }

        const code = await handoffToGemini(prompt, probe);
        process.exit(code);
      }}
    />,
    {
      exitOnCtrlC: true
    }
  );

  unmount = app.unmount;
  await app.waitUntilExit();
}

void main().catch((error: unknown) => {
  const detail = error instanceof Error ? error.message : String(error);
  console.error(`Failed to start Chiron TUI: ${detail}`);
  process.exit(1);
});

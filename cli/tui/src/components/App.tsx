import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Box, Text} from 'ink';
import {Header} from './Header.js';
import {InputBox} from './InputBox.js';
import {EnhanceOverlay, type OverlayStep} from './EnhanceOverlay.js';
import {StatusBar, type AppMode} from './StatusBar.js';
import {ContextEngine} from '../engine/context-engine.js';
import {Enhancer} from '../engine/enhancer.js';
import type {ProjectScanResult} from '../engine/types.js';

interface AppProps {
  onSubmitPrompt: (prompt: string) => Promise<void>;
}

interface UiMessage {
  tone: 'info' | 'success' | 'error';
  text: string;
}

function createOverlaySteps(): OverlayStep[] {
  return [
    {id: 'scan', label: '扫描项目...', status: 'idle'},
    {id: 'search', label: '搜索相关文件...', status: 'idle'},
    {id: 'enhance', label: '增强提示词...', status: 'idle'}
  ];
}

function summarizeProject(project: ProjectScanResult): string {
  if (project.techStack.length > 0) {
    return project.techStack.slice(0, 3).join(' + ');
  }

  if (project.framework) {
    return project.framework;
  }

  return project.language ?? 'Detected';
}

function divider(columns: number): string {
  const width = Math.max(24, Math.min(columns - 2, 100));
  return '━'.repeat(width);
}

function messageColor(tone: UiMessage['tone']): 'gray' | 'green' | 'red' {
  if (tone === 'success') {
    return 'green';
  }

  if (tone === 'error') {
    return 'red';
  }

  return 'gray';
}

export function App({onSubmitPrompt}: AppProps): React.ReactElement {
  const cwd = process.cwd();
  const contextEngine = useMemo(() => new ContextEngine(cwd), [cwd]);
  const enhancer = useMemo(() => new Enhancer(), []);

  const [mode, setMode] = useState<AppMode>('idle');
  const [value, setValue] = useState('');
  const [cursor, setCursor] = useState(0);
  const [restoreValue, setRestoreValue] = useState<string | null>(null);
  const [overlaySteps, setOverlaySteps] = useState<OverlayStep[]>(createOverlaySteps);
  const [message, setMessage] = useState<UiMessage | null>(null);
  const [projectContext, setProjectContext] = useState<ProjectScanResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const columns = process.stdout.columns ?? 80;

  const setStep = useCallback((id: string, status: OverlayStep['status'], detail?: string) => {
    setOverlaySteps((previous) =>
      previous.map((step) => (step.id === id ? {...step, status, detail} : step))
    );
  }, []);

  useEffect(() => {
    let isCancelled = false;

    void contextEngine.scanProject(2).then((context) => {
      if (!isCancelled) {
        setProjectContext(context);
      }
    }).catch(() => {
      if (!isCancelled) {
        setProjectContext(null);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [contextEngine]);

  const handleChange = useCallback((nextValue: string, nextCursor: number) => {
    setValue(nextValue);
    setCursor(nextCursor);
    if (message?.tone !== 'error') {
      setMessage(null);
    }
  }, [message?.tone]);

  const handleEnhance = useCallback(async () => {
    if (mode === 'enhancing' || isSubmitting) {
      return;
    }

    if (!value.trim()) {
      setMessage({tone: 'error', text: '输入为空，请先输入需求再增强。'});
      return;
    }

    const source = mode === 'enhanced' && restoreValue ? restoreValue : value;
    setMode('enhancing');
    setRestoreValue(source);
    setMessage({tone: 'info', text: '正在结合项目上下文增强提示词...'});
    setOverlaySteps(createOverlaySteps());
    setStep('scan', 'running');

    try {
      const scannedProject = await contextEngine.scanProject(3);
      setProjectContext(scannedProject);
      setStep('scan', 'done', summarizeProject(scannedProject));

      setStep('search', 'running');
      const files = await contextEngine.findRelevantFiles(source, {
        maxResults: 6,
        includeContent: false
      });
      setStep('search', 'done', `找到 ${files.length.toString()} 个文件`);

      setStep('enhance', 'running');
      const gitContext = await contextEngine.getGitContext();
      const strategy = enhancer.detectStrategy(source);
      const enhanced = enhancer.enhance({
        rawPrompt: source,
        strategy,
        projectContext: scannedProject,
        relevantFiles: files,
        gitContext
      });

      setStep('enhance', 'done', '完成');
      setValue(enhanced);
      setCursor(enhanced.length);
      setMode('enhanced');
      setMessage({tone: 'success', text: '已原地增强输入内容，按 Enter 可直接发送。'});
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      setStep('enhance', 'error', '失败');
      setMode('idle');
      setMessage({tone: 'error', text: `增强失败: ${detail}`});
    }
  }, [contextEngine, enhancer, isSubmitting, mode, setStep, value]);

  const handleEscape = useCallback(() => {
    if (mode === 'enhancing' || isSubmitting) {
      return;
    }

    if (mode === 'enhanced' && restoreValue !== null) {
      setValue(restoreValue);
      setCursor(restoreValue.length);
      setRestoreValue(null);
      setMode('idle');
      setMessage({tone: 'success', text: '已还原增强前的原始输入。'});
      return;
    }

    if (value.length > 0) {
      setValue('');
      setCursor(0);
      setMessage({tone: 'info', text: '已清空输入。'});
    }
  }, [isSubmitting, mode, restoreValue, value.length]);

  const handleSubmit = useCallback(async () => {
    if (mode === 'enhancing' || isSubmitting) {
      return;
    }

    if (!value.trim()) {
      setMessage({tone: 'error', text: '输入为空，无法发送。'});
      return;
    }

    setIsSubmitting(true);
    setMessage({tone: 'info', text: '正在交接到 Gemini...'});

    try {
      await onSubmitPrompt(value);
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      setIsSubmitting(false);
      setMessage({tone: 'error', text: `启动 Gemini 失败: ${detail}`});
    }
  }, [isSubmitting, mode, onSubmitPrompt, value]);

  return (
    <Box flexDirection="column">
      <Header
        cwd={cwd}
        framework={projectContext?.framework ?? null}
        language={projectContext?.language ?? null}
        techStack={projectContext?.techStack ?? []}
      />

      <InputBox
        value={value}
        cursor={cursor}
        active={!isSubmitting && mode !== 'enhancing'}
        onChange={handleChange}
        onEnhance={() => {
          void handleEnhance();
        }}
        onSubmit={() => {
          void handleSubmit();
        }}
        onEscape={handleEscape}
      />

      <Text color="gray">{divider(columns)}</Text>

      {mode === 'enhancing' && <EnhanceOverlay steps={overlaySteps} />}

      {message && (
        <Box marginTop={1}>
          <Text color={messageColor(message.tone)}>{message.text}</Text>
        </Box>
      )}

      <StatusBar mode={mode} isSubmitting={isSubmitting} />
    </Box>
  );
}

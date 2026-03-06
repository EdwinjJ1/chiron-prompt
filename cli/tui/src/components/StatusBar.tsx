import React from 'react';
import {Box, Text} from 'ink';

export type AppMode = 'idle' | 'enhancing' | 'enhanced';

interface StatusBarProps {
  mode: AppMode;
  isSubmitting: boolean;
}

export function StatusBar({mode, isSubmitting}: StatusBarProps): React.ReactElement {
  const label = isSubmitting
    ? '  正在启动 Gemini...'
    : mode === 'enhanced'
      ? '  Ctrl+E 再次增强  ·  Enter 发送到 Gemini  ·  Esc 还原'
      : '  Ctrl+E 增强  ·  Enter 发送  ·  Esc 清空';

  return (
    <Box marginTop={1}>
      <Text color="gray">{label}</Text>
    </Box>
  );
}

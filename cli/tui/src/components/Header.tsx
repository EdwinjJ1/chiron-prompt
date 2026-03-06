import React from 'react';
import {Box, Text} from 'ink';

interface HeaderProps {
  cwd: string;
  framework: string | null;
  language: string | null;
  techStack: string[];
}

function shortenPath(pathValue: string): string {
  const home = process.env.HOME;
  if (home && pathValue.startsWith(home)) {
    return `~${pathValue.slice(home.length)}`;
  }

  return pathValue;
}

function buildStackLabel(framework: string | null, language: string | null, techStack: string[]): string {
  const parts: string[] = [];

  if (framework) {
    parts.push(framework);
  }

  if (techStack.includes('TypeScript') || language === 'typescript') {
    parts.push('TypeScript');
  }

  if (parts.length === 0 && techStack.length > 0) {
    parts.push(...techStack.slice(0, 2));
  }

  return parts.join(' + ');
}

export function Header({cwd, framework, language, techStack}: HeaderProps): React.ReactElement {
  const stackLabel = buildStackLabel(framework, language, techStack);
  const suffix = stackLabel ? `  ${stackLabel}` : '';

  return (
    <Box marginBottom={1}>
      <Text>{`🏹 Chiron · ${shortenPath(cwd)}${suffix}`}</Text>
    </Box>
  );
}

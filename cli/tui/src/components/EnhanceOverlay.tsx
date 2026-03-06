import React from 'react';
import {Box, Text} from 'ink';

export type OverlayStepStatus = 'idle' | 'running' | 'done' | 'error';

export interface OverlayStep {
  id: string;
  label: string;
  status: OverlayStepStatus;
  detail?: string;
}

interface EnhanceOverlayProps {
  steps: OverlayStep[];
}

function iconForStatus(status: OverlayStepStatus): string {
  switch (status) {
    case 'running':
      return '🔄';
    case 'done':
      return '✅';
    case 'error':
      return '❌';
    default:
      return '•';
  }
}

export function EnhanceOverlay({steps}: EnhanceOverlayProps): React.ReactElement {
  return (
    <Box flexDirection="column" marginTop={1}>
      {steps.map((step) => (
        <Text key={step.id}>
          {`${iconForStatus(step.status)} ${step.label}${step.detail ? `  ${step.detail}` : ''}`}
        </Text>
      ))}
    </Box>
  );
}

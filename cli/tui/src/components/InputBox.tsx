import React, {useRef} from 'react';
import {Box, Text, useInput} from 'ink';

interface InputBoxProps {
  value: string;
  cursor: number;
  active: boolean;
  onChange: (nextValue: string, nextCursor: number) => void;
  onEnhance: () => void;
  onSubmit: () => void;
  onEscape: () => void;
}

interface Position {
  line: number;
  column: number;
}

interface LinesWithStarts {
  lines: string[];
  starts: number[];
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function computeLinesWithStarts(text: string): LinesWithStarts {
  const lines = text.split('\n');
  const starts: number[] = [0];

  for (let index = 0; index < text.length; index += 1) {
    if (text[index] === '\n') {
      starts.push(index + 1);
    }
  }

  return {lines, starts};
}

function lineLength(data: LinesWithStarts, line: number, textLength: number): number {
  if (line < 0 || line >= data.lines.length) {
    return 0;
  }

  if (line === data.lines.length - 1) {
    return textLength - data.starts[line];
  }

  return data.starts[line + 1] - data.starts[line] - 1;
}

function indexToPosition(text: string, index: number): Position {
  const safeIndex = clamp(index, 0, text.length);
  const data = computeLinesWithStarts(text);

  for (let line = data.starts.length - 1; line >= 0; line -= 1) {
    if (safeIndex >= data.starts[line]) {
      return {
        line,
        column: safeIndex - data.starts[line]
      };
    }
  }

  return {line: 0, column: 0};
}

function positionToIndex(text: string, targetLine: number, targetColumn: number): number {
  const data = computeLinesWithStarts(text);
  const line = clamp(targetLine, 0, data.lines.length - 1);
  const start = data.starts[line];
  const endColumn = lineLength(data, line, text.length);
  return start + clamp(targetColumn, 0, endColumn);
}

function lineBounds(text: string, index: number): {start: number; end: number} {
  const position = indexToPosition(text, index);
  const start = positionToIndex(text, position.line, 0);
  const end = positionToIndex(text, position.line, Number.MAX_SAFE_INTEGER);

  return {start, end};
}

function insertText(text: string, cursor: number, chunk: string): {text: string; cursor: number} {
  const nextText = `${text.slice(0, cursor)}${chunk}${text.slice(cursor)}`;
  return {
    text: nextText,
    cursor: cursor + chunk.length
  };
}

function deleteBackward(text: string, cursor: number): {text: string; cursor: number} {
  if (cursor === 0) {
    return {text, cursor};
  }

  return {
    text: `${text.slice(0, cursor - 1)}${text.slice(cursor)}`,
    cursor: cursor - 1
  };
}

function deleteForward(text: string, cursor: number): {text: string; cursor: number} {
  if (cursor >= text.length) {
    return {text, cursor};
  }

  return {
    text: `${text.slice(0, cursor)}${text.slice(cursor + 1)}`,
    cursor
  };
}

function renderWithCursor(text: string, cursor: number): string[] {
  const safeCursor = clamp(cursor, 0, text.length);
  const withCursor = `${text.slice(0, safeCursor)}▌${text.slice(safeCursor)}`;
  return withCursor.split('\n');
}

export function InputBox({
  value,
  cursor,
  active,
  onChange,
  onEnhance,
  onSubmit,
  onEscape
}: InputBoxProps): React.ReactElement {
  const preferredColumnRef = useRef<number | null>(null);

  const update = (nextValue: string, nextCursor: number, keepPreferredColumn = false): void => {
    if (!keepPreferredColumn) {
      preferredColumnRef.current = null;
    }

    onChange(nextValue, clamp(nextCursor, 0, nextValue.length));
  };

  useInput(
    (input, key) => {
      if (!active) {
        return;
      }

      const extendedKey = key as typeof key & {
        home?: boolean;
        end?: boolean;
      };

      if (key.ctrl && input.toLowerCase() === 'e') {
        onEnhance();
        return;
      }

      if (key.escape) {
        onEscape();
        return;
      }

      if (key.return) {
        if (key.shift || (key.ctrl && input.toLowerCase() === 'j')) {
          const next = insertText(value, cursor, '\n');
          update(next.text, next.cursor);
          return;
        }

        onSubmit();
        return;
      }

      if (key.leftArrow) {
        update(value, cursor - 1);
        return;
      }

      if (key.rightArrow) {
        update(value, cursor + 1);
        return;
      }

      if (key.upArrow || key.downArrow) {
        const direction = key.upArrow ? -1 : 1;
        const position = indexToPosition(value, cursor);
        const targetLine = position.line + direction;

        const lineCount = computeLinesWithStarts(value).lines.length;
        if (targetLine < 0 || targetLine >= lineCount) {
          return;
        }

        const preferredColumn = preferredColumnRef.current ?? position.column;
        preferredColumnRef.current = preferredColumn;

        update(value, positionToIndex(value, targetLine, preferredColumn), true);
        return;
      }

      if (extendedKey.home || (key.ctrl && input.toLowerCase() === 'a')) {
        const bounds = lineBounds(value, cursor);
        update(value, bounds.start);
        return;
      }

      if (extendedKey.end) {
        const bounds = lineBounds(value, cursor);
        update(value, bounds.end);
        return;
      }

      if (key.backspace) {
        const next = deleteBackward(value, cursor);
        update(next.text, next.cursor);
        return;
      }

      if (key.delete) {
        const next = deleteForward(value, cursor);
        update(next.text, next.cursor);
        return;
      }

      if (key.ctrl && input.toLowerCase() === 'u') {
        const bounds = lineBounds(value, cursor);
        const nextValue = `${value.slice(0, bounds.start)}${value.slice(cursor)}`;
        update(nextValue, bounds.start);
        return;
      }

      if (key.ctrl && input.toLowerCase() === 'k') {
        const bounds = lineBounds(value, cursor);
        const nextValue = `${value.slice(0, cursor)}${value.slice(bounds.end)}`;
        update(nextValue, cursor);
        return;
      }

      if (key.tab) {
        const next = insertText(value, cursor, '  ');
        update(next.text, next.cursor);
        return;
      }

      if (!key.ctrl && !key.meta && input.length > 0) {
        const next = insertText(value, cursor, input);
        update(next.text, next.cursor);
      }
    },
    {isActive: active}
  );

  const lines = renderWithCursor(value, cursor);

  return (
    <Box flexDirection="column">
      <Text>{`❯ ${lines[0]}`}</Text>
      {lines.slice(1).map((line, index) => (
        <Text key={`${index.toString()}-${line}`}>{`  ${line}`}</Text>
      ))}
      {value.length === 0 && (
        <Text color="gray">  输入需求后按 Ctrl+E 进行增强。</Text>
      )}
    </Box>
  );
}

export type ProjectType =
  | 'node'
  | 'python'
  | 'rust'
  | 'go'
  | 'java'
  | 'ruby'
  | 'php'
  | 'swift'
  | 'dart'
  | null;

export interface StructureEntry {
  type: 'file' | 'dir';
  path: string;
  children?: number;
}

export interface ProjectScanResult {
  root: string;
  projectType: ProjectType;
  language: string | null;
  framework: string | null;
  techStack: string[];
  structure: StructureEntry[];
  keyFiles: Record<string, unknown>;
  stats: {
    files: number;
    dirs: number;
  };
}

export interface RelevantFile {
  path: string;
  name: string;
  score: number;
  content?: string | null;
  lines?: number;
}

export interface GitContext {
  branch: string | null;
  commits: string[];
  changed: string[];
  status: string[];
}

export interface FindRelevantFilesOptions {
  maxResults?: number;
  includeContent?: boolean;
}

export interface EnhanceInput {
  rawPrompt: string;
  strategy: EnhancementStrategy;
  projectContext?: ProjectScanResult;
  relevantFiles?: RelevantFile[];
  gitContext?: GitContext;
}

export type EnhancementStrategy =
  | 'detailed'
  | 'concise'
  | 'creative'
  | 'professional'
  | 'analytical'
  | 'educational'
  | 'action';

export interface EnhancementFramework {
  label: string;
  focus: string[];
  executionHint: string;
}

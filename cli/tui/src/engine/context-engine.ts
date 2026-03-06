import fs from 'node:fs/promises';
import path from 'node:path';
import {execSync} from 'node:child_process';
import type {
  FindRelevantFilesOptions,
  GitContext,
  ProjectScanResult,
  ProjectType,
  RelevantFile,
  StructureEntry
} from './types.js';

const IGNORED_DIRS = new Set([
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  '__pycache__',
  '.cache',
  '.vscode',
  '.idea',
  'coverage',
  '.pytest_cache',
  'vendor',
  'target',
  '.gradle',
  'venv',
  '.env',
  '.tox',
  'bower_components',
  '.nuxt',
  '.output',
  '.turbo',
  '.vercel'
]);

const PROJECT_MARKERS: Record<string, ProjectType> = {
  'package.json': 'node',
  'pyproject.toml': 'python',
  'requirements.txt': 'python',
  'Cargo.toml': 'rust',
  'go.mod': 'go',
  'pom.xml': 'java',
  'build.gradle': 'java',
  'Gemfile': 'ruby',
  'composer.json': 'php',
  'Package.swift': 'swift',
  'pubspec.yaml': 'dart'
};

const STOP_WORDS = new Set([
  'the',
  'a',
  'an',
  'is',
  'are',
  'was',
  'were',
  'be',
  'been',
  'being',
  'have',
  'has',
  'had',
  'do',
  'does',
  'did',
  'will',
  'would',
  'could',
  'should',
  'may',
  'might',
  'can',
  'need',
  'to',
  'of',
  'in',
  'for',
  'on',
  'with',
  'at',
  'by',
  'from',
  'and',
  'or',
  'not',
  'but',
  'if',
  'then',
  'else',
  'when',
  'this',
  'that',
  'it',
  'its',
  'my',
  'your',
  'what',
  'which',
  'who',
  'where',
  'how',
  'why',
  'make',
  'use',
  '我',
  '你',
  '他',
  '的',
  '了',
  '是',
  '在',
  '和',
  '有',
  '就',
  '不',
  '也',
  '要',
  '会',
  '这',
  '那',
  '都',
  '帮',
  '帮我',
  '请',
  '一下',
  '能',
  '把',
  '给',
  '让',
  '可以',
  '我们',
  '他们',
  '你们'
]);

const SOURCE_EXTENSIONS = new Set([
  '.js',
  '.ts',
  '.jsx',
  '.tsx',
  '.mjs',
  '.cjs',
  '.py',
  '.rs',
  '.go',
  '.java',
  '.rb',
  '.php',
  '.vue',
  '.svelte',
  '.astro',
  '.swift',
  '.kt'
]);

const MAX_SNIPPET_BYTES = 200_000;
const MAX_SNIPPET_LENGTH = 3_000;

export class ContextEngine {
  private readonly cwd: string;

  constructor(cwd = process.cwd()) {
    this.cwd = cwd;
  }

  public async scanProject(maxDepth = 3): Promise<ProjectScanResult> {
    const result: ProjectScanResult = {
      root: this.cwd,
      projectType: null,
      language: null,
      framework: null,
      techStack: [],
      structure: [],
      keyFiles: {},
      stats: {
        files: 0,
        dirs: 0
      }
    };

    for (const [marker, projectType] of Object.entries(PROJECT_MARKERS)) {
      try {
        await fs.access(path.join(this.cwd, marker));
        result.projectType = projectType;
        result.language = projectType;
        break;
      } catch {
        // marker not present
      }
    }

    await this.readKeyFiles(result);
    result.structure = await this.scanDirectory(this.cwd, maxDepth);
    result.stats.files = result.structure.filter((entry) => entry.type === 'file').length;
    result.stats.dirs = result.structure.filter((entry) => entry.type === 'dir').length;

    this.detectTechStack(result);
    return result;
  }

  public async findRelevantFiles(
    query: string,
    options: FindRelevantFilesOptions = {}
  ): Promise<RelevantFile[]> {
    const maxResults = options.maxResults ?? 10;
    const includeContent = options.includeContent ?? true;

    const keywords = this.extractKeywords(query);
    if (keywords.length === 0) {
      return [];
    }

    const matches: RelevantFile[] = [];
    await this.searchFiles(this.cwd, keywords, matches, '', 4);

    matches.sort((a, b) => b.score - a.score);
    const result = matches.slice(0, maxResults);

    if (!includeContent) {
      return result;
    }

    for (const file of result) {
      const absolutePath = path.join(this.cwd, file.path);
      try {
        const stat = await fs.stat(absolutePath);
        if (stat.size > MAX_SNIPPET_BYTES) {
          file.content = '// file too large, skipped';
          continue;
        }

        const content = await fs.readFile(absolutePath, 'utf8');
        file.lines = content.split('\n').length;
        file.content =
          content.length > MAX_SNIPPET_LENGTH
            ? `${content.slice(0, MAX_SNIPPET_LENGTH)}\n// ... truncated`
            : content;
      } catch {
        file.content = null;
      }
    }

    return result;
  }

  public async getGitContext(): Promise<GitContext> {
    const result: GitContext = {
      branch: null,
      commits: [],
      changed: [],
      status: []
    };

    const run = (command: string): string => {
      try {
        return execSync(command, {
          cwd: this.cwd,
          encoding: 'utf8',
          timeout: 5_000,
          stdio: ['ignore', 'pipe', 'ignore']
        }).trim();
      } catch {
        return '';
      }
    };

    result.branch = run('git rev-parse --abbrev-ref HEAD') || null;

    const log = run('git log --oneline -8');
    if (log) {
      result.commits = log.split('\n').filter(Boolean);
    }

    const diff = run('git diff --stat HEAD');
    if (diff) {
      result.changed = diff.split('\n').filter(Boolean);
    }

    const status = run('git status --short');
    if (status) {
      result.status = status.split('\n').filter(Boolean);
    }

    return result;
  }

  private async readKeyFiles(result: ProjectScanResult): Promise<void> {
    const tryRead = async (fileName: string, parser?: (raw: string) => unknown): Promise<void> => {
      try {
        const raw = await fs.readFile(path.join(this.cwd, fileName), 'utf8');
        result.keyFiles[fileName] = parser ? parser(raw) : raw.slice(0, 1_500);
      } catch {
        // key file absent
      }
    };

    await tryRead('package.json', (raw) => {
      const pkg = JSON.parse(raw) as {
        name?: string;
        version?: string;
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
        scripts?: Record<string, string>;
      };

      return {
        name: pkg.name,
        version: pkg.version,
        deps: Object.keys(pkg.dependencies ?? {}),
        devDeps: Object.keys(pkg.devDependencies ?? {}),
        scripts: Object.keys(pkg.scripts ?? {})
      };
    });

    await tryRead('tsconfig.json', (raw) => {
      const tsconfig = JSON.parse(raw) as {
        compilerOptions?: Record<string, unknown>;
        include?: string[];
      };

      return {
        compilerOptions: tsconfig.compilerOptions,
        include: tsconfig.include
      };
    });

    await tryRead('CLAUDE.md');
    await tryRead('README.md');
    await tryRead('pyproject.toml');
  }

  private detectTechStack(result: ProjectScanResult): void {
    const pkg = result.keyFiles['package.json'];
    if (!pkg || typeof pkg !== 'object' || pkg === null) {
      return;
    }

    const packageJson = pkg as {
      deps?: string[];
      devDeps?: string[];
    };

    const allDependencies = [...(packageJson.deps ?? []), ...(packageJson.devDeps ?? [])];
    const firstMatch = (mapping: Record<string, string>): string | null => {
      for (const [pattern, label] of Object.entries(mapping)) {
        if (allDependencies.some((dep) => dep.includes(pattern))) {
          result.techStack.push(label);
          return label;
        }
      }

      return null;
    };

    result.framework = firstMatch({
      next: 'Next.js',
      nuxt: 'Nuxt',
      remix: 'Remix',
      astro: 'Astro',
      svelte: 'SvelteKit',
      vue: 'Vue',
      react: 'React',
      angular: 'Angular',
      express: 'Express',
      fastify: 'Fastify',
      hono: 'Hono'
    });

    if (allDependencies.includes('typescript')) {
      result.techStack.push('TypeScript');
      result.language = 'typescript';
    }

    const tools: Record<string, string> = {
      prisma: 'Prisma',
      'drizzle-orm': 'Drizzle',
      mongoose: 'MongoDB',
      tailwindcss: 'Tailwind',
      jest: 'Jest',
      vitest: 'Vitest',
      playwright: 'Playwright',
      cypress: 'Cypress',
      eslint: 'ESLint',
      prettier: 'Prettier'
    };

    for (const [dependency, label] of Object.entries(tools)) {
      if (allDependencies.some((dep) => dep.includes(dependency)) && !result.techStack.includes(label)) {
        result.techStack.push(label);
      }
    }
  }

  private async scanDirectory(
    directory: string,
    maxDepth: number,
    depth = 0,
    relativePath = ''
  ): Promise<StructureEntry[]> {
    if (depth >= maxDepth) {
      return [];
    }

    const entries: StructureEntry[] = [];

    try {
      const items = await fs.readdir(directory, {withFileTypes: true});
      for (const item of items) {
        if (IGNORED_DIRS.has(item.name) || (item.name.startsWith('.') && depth > 0)) {
          continue;
        }

        const nextRelativePath = relativePath ? `${relativePath}/${item.name}` : item.name;

        if (item.isDirectory()) {
          const children = await this.scanDirectory(
            path.join(directory, item.name),
            maxDepth,
            depth + 1,
            nextRelativePath
          );

          entries.push({
            type: 'dir',
            path: nextRelativePath,
            children: children.length
          });
          entries.push(...children);
          continue;
        }

        entries.push({
          type: 'file',
          path: nextRelativePath
        });
      }
    } catch {
      // permission denied or transient fs errors
    }

    return entries;
  }

  private extractKeywords(query: string): string[] {
    return [...new Set(
      query
        .toLowerCase()
        .replace(/[^\w\u4e00-\u9fa5-]/g, ' ')
        .split(/\s+/)
        .filter((word) => word.length > 1 && !STOP_WORDS.has(word))
    )];
  }

  private async searchFiles(
    directory: string,
    keywords: string[],
    results: RelevantFile[],
    relativePath: string,
    maxDepth: number,
    depth = 0
  ): Promise<void> {
    if (depth >= maxDepth) {
      return;
    }

    try {
      const items = await fs.readdir(directory, {withFileTypes: true});
      for (const item of items) {
        if (IGNORED_DIRS.has(item.name) || item.name.startsWith('.')) {
          continue;
        }

        const nextRelativePath = relativePath ? `${relativePath}/${item.name}` : item.name;

        if (item.isDirectory()) {
          await this.searchFiles(
            path.join(directory, item.name),
            keywords,
            results,
            nextRelativePath,
            maxDepth,
            depth + 1
          );
          continue;
        }

        if (!item.isFile()) {
          continue;
        }

        const score = this.scoreFile(item.name, nextRelativePath, keywords);
        if (score > 0) {
          results.push({
            path: nextRelativePath,
            name: item.name,
            score
          });
        }
      }
    } catch {
      // skip inaccessible directory
    }
  }

  private scoreFile(fileName: string, filePath: string, keywords: string[]): number {
    let score = 0;
    const lowerFileName = fileName.toLowerCase();
    const lowerPath = filePath.toLowerCase();

    for (const keyword of keywords) {
      if (lowerFileName.includes(keyword)) {
        score += 10;
      } else if (lowerPath.includes(keyword)) {
        score += 5;
      }
    }

    const extension = path.extname(lowerFileName);
    if (SOURCE_EXTENSIONS.has(extension)) {
      score += 2;
    }

    if (/^(index|main|app|server)\.\w+$/.test(lowerFileName)) {
      score += 3;
    }

    return score;
  }
}

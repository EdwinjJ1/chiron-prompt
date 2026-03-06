/**
 * Chiron Context Engine
 * Scans and analyzes the repository to gather intelligent context
 * for prompt enhancement.
 */

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

const IGNORED_DIRS = new Set([
    'node_modules', '.git', '.next', 'dist', 'build', '__pycache__',
    '.cache', '.vscode', '.idea', 'coverage', '.pytest_cache',
    'vendor', 'target', '.gradle', 'venv', '.env', '.tox',
    'bower_components', '.nuxt', '.output', '.turbo', '.vercel',
]);

const PROJECT_MARKERS = {
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
    'pubspec.yaml': 'dart',
};

// Chinese + English stop words for keyword extraction
const STOP_WORDS = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'can', 'need', 'to', 'of', 'in', 'for',
    'on', 'with', 'at', 'by', 'from', 'and', 'or', 'not', 'but', 'if',
    'then', 'else', 'when', 'this', 'that', 'it', 'its', 'my', 'your',
    'what', 'which', 'who', 'where', 'how', 'why', 'make', 'use',
    '我', '你', '他', '的', '了', '是', '在', '和', '有', '就', '不',
    '也', '要', '会', '这', '那', '都', '帮', '帮我', '请', '一下',
    '能', '把', '给', '让', '可以', '我们', '他们', '你们',
]);

const SOURCE_EXTS = new Set([
    '.js', '.ts', '.jsx', '.tsx', '.mjs', '.cjs',
    '.py', '.rs', '.go', '.java', '.rb', '.php',
    '.vue', '.svelte', '.astro', '.swift', '.kt',
]);

export class ContextEngine {
    constructor(cwd) {
        this.cwd = cwd || process.cwd();
    }

    /**
     * Scan the project and return comprehensive context.
     */
    async scanProject(maxDepth = 3) {
        const result = {
            root: this.cwd,
            projectType: null,
            language: null,
            framework: null,
            techStack: [],
            structure: [],
            keyFiles: {},
            stats: { files: 0, dirs: 0 },
        };

        // 1. Detect project type
        for (const [marker, type] of Object.entries(PROJECT_MARKERS)) {
            try {
                await fs.access(path.join(this.cwd, marker));
                result.projectType = type;
                result.language = type;
                break;
            } catch { /* not found */ }
        }

        // 2. Read key configuration files
        await this._readKeyFiles(result);

        // 3. Scan directory structure
        result.structure = await this._scanDir(this.cwd, maxDepth);
        result.stats.files = result.structure.filter(e => e.type === 'file').length;
        result.stats.dirs = result.structure.filter(e => e.type === 'dir').length;

        // 4. Detect tech stack from dependencies
        this._detectTechStack(result);

        return result;
    }

    /**
     * Find files relevant to a search query.
     */
    async findRelevantFiles(query, options = {}) {
        const { maxResults = 10, includeContent = true } = options;
        const keywords = this._extractKeywords(query);
        const results = [];

        await this._searchFiles(this.cwd, keywords, results, '', 4);

        // Sort by relevance
        results.sort((a, b) => b.score - a.score);
        const limited = results.slice(0, maxResults);

        if (includeContent) {
            for (const item of limited) {
                try {
                    const content = await fs.readFile(
                        path.join(this.cwd, item.path), 'utf-8'
                    );
                    item.content = content.length > 3000
                        ? content.slice(0, 3000) + '\n// ... truncated'
                        : content;
                    item.lines = content.split('\n').length;
                } catch {
                    item.content = null;
                }
            }
        }

        return limited;
    }

    /**
     * Get current git context (branch, recent commits, changes).
     */
    async getGitContext() {
        const ctx = { branch: null, commits: [], changed: [], status: [] };

        const run = (cmd) => {
            try {
                return execSync(cmd, { cwd: this.cwd, encoding: 'utf-8', timeout: 5000 }).trim();
            } catch { return ''; }
        };

        ctx.branch = run('git rev-parse --abbrev-ref HEAD') || null;

        const log = run('git log --oneline -8');
        if (log) ctx.commits = log.split('\n').filter(Boolean);

        const diff = run('git diff --stat HEAD');
        if (diff) ctx.changed = diff.split('\n').filter(Boolean);

        const status = run('git status --short');
        if (status) ctx.status = status.split('\n').filter(Boolean);

        return ctx;
    }

    // ── Private helpers ──────────────────────────────────────

    async _readKeyFiles(result) {
        const tryRead = async (name, parser) => {
            try {
                const raw = await fs.readFile(path.join(this.cwd, name), 'utf-8');
                result.keyFiles[name] = parser ? parser(raw) : raw.slice(0, 1500);
            } catch { /* not found */ }
        };

        await tryRead('package.json', (raw) => {
            const pkg = JSON.parse(raw);
            return {
                name: pkg.name,
                version: pkg.version,
                deps: Object.keys(pkg.dependencies || {}),
                devDeps: Object.keys(pkg.devDependencies || {}),
                scripts: Object.keys(pkg.scripts || {}),
            };
        });

        await tryRead('tsconfig.json', (raw) => {
            const ts = JSON.parse(raw);
            return { compilerOptions: ts.compilerOptions, include: ts.include };
        });

        await tryRead('CLAUDE.md');
        await tryRead('README.md');
        await tryRead('pyproject.toml');
    }

    _detectTechStack(result) {
        const pkg = result.keyFiles['package.json'];
        if (!pkg) return;

        const allDeps = [...(pkg.deps || []), ...(pkg.devDeps || [])];

        const detect = (map) => {
            for (const [pattern, label] of Object.entries(map)) {
                if (allDeps.some(d => d.includes(pattern))) {
                    result.techStack.push(label);
                    return label;
                }
            }
            return null;
        };

        // Framework detection (first match = primary framework)
        result.framework = detect({
            'next': 'Next.js', 'nuxt': 'Nuxt', 'remix': 'Remix',
            'astro': 'Astro', 'svelte': 'SvelteKit', 'vue': 'Vue',
            'react': 'React', 'angular': 'Angular',
            'express': 'Express', 'fastify': 'Fastify', 'hono': 'Hono',
        });

        // Language
        if (allDeps.includes('typescript')) {
            result.techStack.push('TypeScript');
            result.language = 'typescript';
        }

        // Other tools
        const tools = {
            'prisma': 'Prisma', 'drizzle-orm': 'Drizzle', 'mongoose': 'MongoDB',
            'tailwindcss': 'Tailwind', 'jest': 'Jest', 'vitest': 'Vitest',
            'playwright': 'Playwright', 'cypress': 'Cypress',
            'eslint': 'ESLint', 'prettier': 'Prettier',
        };
        for (const [dep, label] of Object.entries(tools)) {
            if (allDeps.some(d => d.includes(dep)) && !result.techStack.includes(label)) {
                result.techStack.push(label);
            }
        }
    }

    async _scanDir(dir, maxDepth, depth = 0, rel = '') {
        if (depth >= maxDepth) return [];
        const entries = [];

        try {
            const items = await fs.readdir(dir, { withFileTypes: true });
            for (const item of items) {
                if (IGNORED_DIRS.has(item.name) || (item.name.startsWith('.') && depth > 0)) continue;
                const itemRel = rel ? `${rel}/${item.name}` : item.name;

                if (item.isDirectory()) {
                    const children = await this._scanDir(
                        path.join(dir, item.name), maxDepth, depth + 1, itemRel
                    );
                    entries.push({ type: 'dir', path: itemRel, children: children.length });
                    entries.push(...children);
                } else {
                    entries.push({ type: 'file', path: itemRel });
                }
            }
        } catch { /* permission denied etc */ }

        return entries;
    }

    _extractKeywords(query) {
        return [...new Set(
            query
                .toLowerCase()
                .replace(/[^\w\u4e00-\u9fa5-]/g, ' ')
                .split(/\s+/)
                .filter(w => w.length > 1 && !STOP_WORDS.has(w))
        )];
    }

    async _searchFiles(dir, keywords, results, rel, maxDepth, depth = 0) {
        if (depth >= maxDepth) return;

        try {
            const items = await fs.readdir(dir, { withFileTypes: true });
            for (const item of items) {
                if (IGNORED_DIRS.has(item.name) || item.name.startsWith('.')) continue;
                const itemRel = rel ? `${rel}/${item.name}` : item.name;

                if (item.isDirectory()) {
                    await this._searchFiles(
                        path.join(dir, item.name), keywords, results, itemRel, maxDepth, depth + 1
                    );
                } else if (item.isFile()) {
                    const score = this._scoreFile(item.name, itemRel, keywords);
                    if (score > 0) results.push({ path: itemRel, name: item.name, score });
                }
            }
        } catch { /* skip */ }
    }

    _scoreFile(name, filePath, keywords) {
        let score = 0;
        const lower = name.toLowerCase();
        const pathLower = filePath.toLowerCase();

        for (const kw of keywords) {
            if (lower.includes(kw)) score += 10;
            else if (pathLower.includes(kw)) score += 5;
        }

        // Boost source code files
        const ext = path.extname(lower);
        if (SOURCE_EXTS.has(ext)) score += 2;

        // Boost entry points
        if (/^(index|main|app|server)\.\w+$/.test(lower)) score += 3;

        return score;
    }
}

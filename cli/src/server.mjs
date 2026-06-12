#!/usr/bin/env node
/**
 * Chiron MCP Server
 *
 * Provides three tools to Claude Code:
 *   1. enhance_prompt  — Enhance a raw prompt with full repo context
 *   2. scan_project    — Analyze project structure and tech stack
 *   3. find_relevant_code — Search for code relevant to a query
 *
 * Start:  node src/server.mjs
 * Config: Add to Claude Code MCP settings (see README)
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    ListResourcesRequestSchema,
    ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { ContextEngine } from './context-engine.mjs';
import { Enhancer } from './enhancer.mjs';

// ── Server setup ─────────────────────────────────────────
const server = new Server(
    { name: 'chiron-prompt', version: '2.0.0' },
    { capabilities: { tools: {}, resources: {} } },
);

const engine = new ContextEngine(process.env.CHIRON_CWD || process.cwd());
const enhancer = new Enhancer();

// ── Tools ────────────────────────────────────────────────
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
        {
            name: 'enhance_prompt',
            description:
                'Enhance a raw prompt by scanning the repository and injecting ' +
                'relevant context, tech stack info, and related code. Returns a ' +
                'structured, expert-grade specification. Use when the user invokes ' +
                '/enhance or /e, or when you detect an underspecified request.',
            inputSchema: {
                type: 'object',
                properties: {
                    prompt: {
                        type: 'string',
                        description: 'The raw prompt text to enhance',
                    },
                    strategy: {
                        type: 'string',
                        enum: [
                            'auto', 'detailed', 'concise', 'creative',
                            'professional', 'analytical', 'educational', 'action',
                        ],
                        description: 'Enhancement strategy (default: auto-detect)',
                    },
                    include_snippets: {
                        type: 'boolean',
                        description: 'Include relevant code snippets (default: true)',
                    },
                },
                required: ['prompt'],
            },
        },
        {
            name: 'scan_project',
            description:
                'Scan and analyze the current project: structure, tech stack, ' +
                'framework, dependencies, key config files. Returns JSON.',
            inputSchema: {
                type: 'object',
                properties: {
                    depth: {
                        type: 'number',
                        description: 'Max directory depth (default: 3)',
                    },
                },
            },
        },
        {
            name: 'find_relevant_code',
            description:
                'Search the codebase for files relevant to a query using ' +
                'keyword matching and path analysis. Returns ranked results.',
            inputSchema: {
                type: 'object',
                properties: {
                    query: {
                        type: 'string',
                        description: 'Search query',
                    },
                    max_results: {
                        type: 'number',
                        description: 'Max results to return (default: 10)',
                    },
                    include_content: {
                        type: 'boolean',
                        description: 'Include file contents (default: true)',
                    },
                },
                required: ['query'],
            },
        },
    ],
}));

// ── Tool execution ───────────────────────────────────────
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
        switch (name) {
            // ── enhance_prompt ──
            case 'enhance_prompt': {
                const prompt = args?.prompt;
                if (typeof prompt !== 'string' || !prompt.trim()) {
                    throw new Error('enhance_prompt requires a non-empty "prompt" string');
                }
                const strategy = args.strategy || 'auto';
                const includeSnippets = args.include_snippets !== false;

                // Step 1: Scan project
                const projectContext = await engine.scanProject();

                // Step 2: Find relevant files
                const relevantFiles = await engine.findRelevantFiles(prompt, {
                    includeContent: includeSnippets,
                    maxResults: 8,
                });

                // Step 3: Git context
                const gitContext = await engine.getGitContext();

                // Step 4: Detect or use given strategy
                const finalStrategy =
                    strategy === 'auto' ? enhancer.detectStrategy(prompt) : strategy;

                // Step 5: Build enhanced prompt
                const enhanced = enhancer.enhance({
                    rawPrompt: prompt,
                    strategy: finalStrategy,
                    projectContext,
                    relevantFiles,
                    gitContext,
                });

                return { content: [{ type: 'text', text: enhanced }] };
            }

            // ── scan_project ──
            case 'scan_project': {
                const depth = args?.depth ?? 3;
                const ctx = await engine.scanProject(depth);
                return {
                    content: [{
                        type: 'text',
                        text: JSON.stringify(ctx, null, 2),
                    }],
                };
            }

            // ── find_relevant_code ──
            case 'find_relevant_code': {
                if (typeof args?.query !== 'string' || !args.query.trim()) {
                    throw new Error('find_relevant_code requires a non-empty "query" string');
                }
                const results = await engine.findRelevantFiles(args.query, {
                    maxResults: args?.max_results ?? 10,
                    includeContent: args?.include_content !== false,
                });
                return {
                    content: [{
                        type: 'text',
                        text: JSON.stringify(results, null, 2),
                    }],
                };
            }

            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    } catch (err) {
        return {
            content: [{ type: 'text', text: `❌ Error: ${err.message}` }],
            isError: true,
        };
    }
});

// ── Resources ────────────────────────────────────────────
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: [
        {
            uri: 'chiron://project-context',
            name: 'Chiron Project Context',
            description:
                'Live project analysis: tech stack, structure, key files',
            mimeType: 'application/json',
        },
    ],
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    if (request.params.uri === 'chiron://project-context') {
        const ctx = await engine.scanProject();
        return {
            contents: [{
                uri: request.params.uri,
                mimeType: 'application/json',
                text: JSON.stringify(ctx, null, 2),
            }],
        };
    }
    throw new Error(`Unknown resource: ${request.params.uri}`);
});

// ── Start ────────────────────────────────────────────────
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('🏹 Chiron MCP Server v2.0.0 running on stdio');
}

main().catch((err) => {
    console.error('Fatal:', err);
    process.exit(1);
});

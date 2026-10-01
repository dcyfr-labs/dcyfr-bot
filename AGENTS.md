# AGENTS.md - dcyfr-bot

## Project Overview

`dcyfr-bot-marketplace` is a Next.js 16 / React 19 site for the DCYFR bot marketplace.

## Architecture

- Routes and layouts: `app/`
- Shared UI: `components/`
- Reusable logic: `lib/`
- Static/content data: `data/`

## Commands

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
```

## Working Rules

- Keep marketplace behavior and content aligned with the existing app structure.
- Favor minimal App Router changes over introducing new frameworks or patterns.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

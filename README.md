# dcyfr-bot

Bot marketplace and agent directory for the DCYFR ecosystem, live at **[dcyfr.bot](https://dcyfr.bot)**.

`dcyfr-bot-marketplace` is a Next.js 15 / React 19 site for the DCYFR bot marketplace: browse agents at `/agents`, view rankings at `/leaderboard`, and talk to an Anthropic-backed chat surface via `POST /api/chat`. It is part of the dcyfr-labs site family alongside [dcyfr-io](https://github.com/dcyfr-labs/dcyfr-io), [dcyfr-app](https://github.com/dcyfr-labs/dcyfr-app), [dcyfr-build](https://github.com/dcyfr-labs/dcyfr-build), [dcyfr-codes](https://github.com/dcyfr-labs/dcyfr-codes), [dcyfr-tech](https://github.com/dcyfr-labs/dcyfr-tech), and [dcyfr-work](https://github.com/dcyfr-labs/dcyfr-work).

## Stack

- Next.js 15 (App Router) / React 19 / Tailwind CSS
- shadcn primitives from the `@dcyfr-labs` registry (`registry.dcyfr.ai`); shared chrome (nav, footer, page shell, theme switcher/provider) in `components/chrome/`
- `@anthropic-ai/sdk` for the chat API route
- Playwright visual-regression snapshots (`e2e/`)

## Development

```sh
npm install
npm run dev        # http://localhost:3304
```

| Command | What it does |
|---|---|
| `npm run dev` / `npm run start` | Dev / production server on port **3304** |
| `npm run build` | Production build |
| `npm run lint` / `npm run typecheck` | ESLint / `tsc --noEmit` |
| `npm run test:snapshots` (`:update`) | Visual-regression snapshots (chromium) |

## Routes

- `/` — marketplace landing page
- `/agents`, `/agents/[agentId]` — agent directory and detail pages
- `/leaderboard` — agent rankings
- `POST /api/chat` — Anthropic-backed chat (rate-limited; see env vars below)

## Environment variables

This is the only site in the family with **runtime secrets**. `/api/chat` needs at least one of:

| Variable | Purpose |
|---|---|
| `AI_GATEWAY_API_KEY` | Preferred — Vercel AI Gateway key (BYOK, automatic caching; routes via `ai-gateway.vercel.sh`) |
| `ANTHROPIC_API_KEY` | Fallback — direct Anthropic API |

With neither set, `/api/chat` returns 503; the rest of the site works without them. Locally, resolve secrets through 1Password per workspace policy (e.g. `op run --env-file=.env -- npm run dev`) — never hardcode or commit keys. In production they are configured as Vercel project environment variables.

## Design-token & scaffold contract

This site follows the `dcyfr-site-scaffold` contract: colors, spacing, radii, and typography resolve via CSS variables — no hardcoded design tokens. Local ESLint rules in `eslint-local-rules/` enforce this and the `design-tokens.yml` workflow gates every PR. From the workspace root, `npm run audit:sites` checks scaffold compliance across the site family.

## CI

- `ci.yml` — lint, typecheck, build
- `codeql.yml` / `semgrep.yml` — static security analysis
- `design-tokens.yml` — design-token + scaffold gate
- `visual-regression.yml` — Playwright snapshots
- `dependabot-auto-merge.yml` — dependency hygiene

## Deployment

Deployed on Vercel from `main`, with hardened security headers via `vercel.json`. Runtime secrets live in the Vercel project env config.

## Further docs

- [`AGENTS.md`](AGENTS.md) — agent conventions and project structure

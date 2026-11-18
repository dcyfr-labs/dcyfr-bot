# dcyfr-bot

Bot marketplace and agent directory for the DCYFR ecosystem, live at **[dcyfr.bot](https://dcyfr.bot)**.

`dcyfr-bot-marketplace` is a Next.js 16 / React 19 site for the DCYFR bot marketplace: browse agents at `/agents`, view rankings at `/leaderboard`, and talk to an Anthropic-backed chat surface via `POST /api/chat`. It is part of the dcyfr-labs site family alongside [dcyfr-io](https://github.com/dcyfr-labs/dcyfr-io), [dcyfr-app](https://github.com/dcyfr-labs/dcyfr-app), [dcyfr-build](https://github.com/dcyfr-labs/dcyfr-build), [dcyfr-codes](https://github.com/dcyfr-labs/dcyfr-codes), [dcyfr-tech](https://github.com/dcyfr-labs/dcyfr-tech), and [dcyfr-work](https://github.com/dcyfr-labs/dcyfr-work).

## Stack

- Next.js 16 (App Router) / React 19 / Tailwind CSS
- shadcn primitives from the `@dcyfr-labs` registry (`registry.dcyfr.ai`); shared chrome (nav, footer, page shell, theme switcher/provider) in `components/chrome/`
- `@anthropic-ai/sdk` for the chat API route
- Sentry instrumentation through `@sentry/nextjs`
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
| `npm run test:contrast` | Contrast spec (chromium) |
| `npm run test:snapshots` (`:update`, `:rebaseline`) | Visual-regression snapshots (chromium) |
| `npm run check:theme-wiring` | Verifies the theme files, the `globals.css` imports and the `data-identity` stamp |

## Routes

- `/` — marketplace landing page
- `/agents`, `/agents/[agentId]` — agent directory and detail pages
- `/leaderboard` — agent rankings
- `POST /api/chat` — Anthropic-backed chat (rate-limited; see env vars below)
- `/privacy`: privacy notice
- `/robots.txt`, `/sitemap.xml`: generated from `app/robots.ts` and `app/sitemap.ts`
- `/indexnow.txt`: IndexNow key file; the route returns 404 when `INDEXNOW_KEY` is unset
- `/.well-known/security.txt`: RFC 9116 security contact

## Environment variables

This is the only site in the family with **runtime secrets**. `/api/chat` needs at least one of:

| Variable | Purpose |
|---|---|
| `AI_GATEWAY_API_KEY` | Local dev only — Vercel AI Gateway key. Deployed builds authenticate to the gateway with the project's Vercel OIDC token (`@vercel/oidc`), so do not set it in the Vercel project env |
| `ANTHROPIC_API_KEY` | Fallback — direct Anthropic API |

Two non-secret switches (logic in `lib/chat-config.ts`):

| Variable | Purpose |
|---|---|
| `CHAT_ENABLED` | Chat is **off in Production** until the AI Gateway has paid credits (the free tier refuses Anthropic models). Set `true` in the Production env and redeploy to turn it on; Preview and local dev are always on |
| `CHAT_MODEL` | Gateway model override for testing, e.g. `inclusionai/ling-3.1-flash-free` in the Preview env. Ignored in Production, because free models carry no no-training or zero-retention guarantee |

Optional variables shared with the other sites: `NEXT_PUBLIC_SENTRY_DSN` (client Sentry), `SENTRY_DSN` (server and edge; falls back to `NEXT_PUBLIC_SENTRY_DSN`), `SENTRY_ORG` / `SENTRY_PROJECT` (build-time source-map upload; default to `dcyfr-labs` / `dcyfr-bot`) and `INDEXNOW_KEY` (served at `/indexnow.txt`).

With neither credential set, `/api/chat` returns 503; the rest of the site works without them. Locally, resolve secrets through 1Password per workspace policy (e.g. `op run --env-file=.env -- npm run dev`) — never hardcode or commit keys. In production they are configured as Vercel project environment variables.

## Design-token & scaffold contract

This site follows the `dcyfr-site-scaffold` contract: colors, spacing, radii, and typography resolve via CSS variables. Local ESLint rules in `eslint-local-rules/` enforce part of this: `no-hardcoded-colors`, `no-deprecated-design-tokens` and `no-legacy-dcyfr-palette` are errors, while `no-hardcoded-spacing` and `no-hardcoded-typography` are switched off in `eslint.config.mjs`. The `design-tokens.yml` workflow gates every PR. From the workspace root, `npm run audit:sites` checks scaffold compliance across the site family.

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

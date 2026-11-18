# AGENTS.md - dcyfr-bot

## What this is

Bot marketplace and agent directory for the DCYFR ecosystem: an agent directory, a leaderboard and an Anthropic-backed chat. Production URL is https://dcyfr.bot (package name `dcyfr-bot-marketplace`, dev port 3304). It is one of seven sibling sites built from the `dcyfr-site-scaffold` contract, so layout, tooling and CI match the other `dcyfr-*` site repos. It is the only site in the family with runtime secrets.

## Stack

- Next.js `16.4.1` (pinned) with React `^19.0.0`, TypeScript `^5`
- Tailwind CSS `^4.3.3` through `@tailwindcss/postcss`; there is no Tailwind config file
- shadcn (`new-york` style) with the `@dcyfr-labs` registry (`https://registry.dcyfr.ai/r/{name}.json`, see `components.json`)
- `@anthropic-ai/sdk` for `/api/chat`; `@sentry/nextjs` `^10.70.0`, `@vercel/analytics`, `@vercel/speed-insights`, `next-themes`
- Playwright `^1.59.1`; ESLint `^9` flat config (`eslint.config.mjs`)

## Directory map

- `app/` : routes `/`, `/agents`, `/agents/[agentId]`, `/leaderboard`, `/privacy`; `robots.ts`, `sitemap.ts`, `indexnow.txt`, `.well-known/security.txt`, icons, OG image, theme CSS files
- `app/api/chat` : `POST` chat route (see Chat route below)
- `components/` : `AgentCard`, `AgentDirectory`, `CapabilityBadge`, `ChatInterface`
- `components/chrome/` : shared nav, footer, theme provider and toggle (registry-owned)
- `components/ui/` : `button`, `sheet`
- `data/` : `agents.json` (16 agents) and `reputation.json`
- `lib/` : `agent-system-prompt.ts`, `chat-config.ts`, `types.ts`, `utils.ts`
- `hooks/` : `use-dropdown`, `use-media-query`
- `e2e/` : Playwright specs (`contrast`, `snapshots`); there is no `e2e/README.md`
- `eslint-local-rules/` : the five local ESLint rules; `scripts/check-theme-wiring.mjs`
- `proxy.ts` : apex to `www` redirect (Next 16 middleware)

## Chat route

- `POST /api/chat` streams a server-sent-event response. Only public agents with `tlpClearance` of `GREEN` can be chatted with.
- Limits: messages over 2000 characters are rejected, `max_tokens` is 1024, and each IP gets 100 requests per hour from an in-memory counter.
- Credentials, in order: the Vercel OIDC token, then `AI_GATEWAY_API_KEY`, then `ANTHROPIC_API_KEY`. The gateway base URL is `https://ai-gateway.vercel.sh`. The default gateway model is `anthropic/claude-sonnet-4.6`, and the direct model is `claude-sonnet-4-6`.
- `lib/chat-config.ts` decides whether chat is on: it is enabled everywhere except when `VERCEL_ENV` is `production` and `CHAT_ENABLED` is not `true`. A disabled route returns 503 with `Chat is paused`. `CHAT_MODEL` overrides the gateway model and is ignored in production.

## Scripts

There is no `test:e2e` script in this repo.

- `dev` and `start` run `next dev -p 3304` and `next start -p 3304`. `build` runs `next build`, `lint` runs `eslint .`, `typecheck` runs `tsc --noEmit`.
- `test:contrast` and `test:snapshots` run one spec each (`e2e/contrast.spec.ts`, `e2e/snapshots.spec.ts`) on chromium. `test:snapshots:update` and `test:snapshots:rebaseline` add `--update-snapshots` and `--update-snapshots=all`.
- `check:theme-wiring` runs `node scripts/check-theme-wiring.mjs`.

## Environment variables

There is no `.env.example`. These are the names the code reads. Never commit values for them.

- `AI_GATEWAY_API_KEY` : local development gateway key. Deployed builds use the project's Vercel OIDC token.
- `ANTHROPIC_API_KEY` : fallback for direct Anthropic access
- `CHAT_ENABLED`, `CHAT_MODEL` : non-secret chat switches (see Chat route)
- `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_DSN` (falls back to `NEXT_PUBLIC_SENTRY_DSN`)
- `SENTRY_ORG`, `SENTRY_PROJECT` (build-time source maps; default to `dcyfr-labs` and `dcyfr-bot`)
- `INDEXNOW_KEY` : served at `/indexnow.txt`; the route returns 404 when it is unset
- `VERCEL_ENV`, `NEXT_PUBLIC_VERCEL_ENV`, `NEXT_RUNTIME`, `CI` : set by the platform or CI
- `BASE_URL`, `VERCEL_AUTOMATION_BYPASS_SECRET` : Playwright only

Resolve secrets through 1Password for local runs, as the README describes.

## Testing

- Playwright has no `webServer` block. `playwright.config.ts` reads `BASE_URL` and falls back to `https://www.dcyfr.bot`, so start the app yourself and set `BASE_URL=http://localhost:3304` to test local changes.
- `contrast.spec.ts` covers `/`, `/agents`, `/leaderboard` and `/privacy`. `snapshots.spec.ts` covers `/` and `/agents` with a 5% `maxDiffPixelRatio`.
- Mobile snapshot baselines must be generated on x86 CI. Use the `visual-regression.yml` dispatch with `update_baselines` instead of a local run.
- There is no smoke spec and no unit-test runner.

## CI

- `ci.yml`: `typecheck`, `lint` and `build` matrix on Node 20.
- `design-tokens.yml`: palette and primitive-color guards, identity-clobber and theme-wiring checks.
- `visual-regression.yml`: runs on Vercel preview `deployment_status` or dispatch (`base_url`, `update_baselines`); contrast spec, then snapshots (Node 22).
- `codeql.yml`, `semgrep.yml`: weekly (Monday 09:00 UTC), PRs and pushes to `main`; Semgrep needs `SEMGREP_APP_TOKEN`. The Dependabot auto-merge workflows handle dependency PRs.

The `main protection` ruleset requires the `lint`, `typecheck` and `build` checks.

## Design system rules

- Colors, spacing, radii and type come from CSS variables and the vendored `app/dcyfr-theme-*.css` and `app/dcyfr-chrome.css` files. `app/layout.tsx` sets `data-identity="slate"` on `<html>`, and `npm run check:theme-wiring` verifies that wiring.
- ESLint errors: `no-hardcoded-colors`, `no-deprecated-design-tokens`, `no-legacy-dcyfr-palette`. `no-hardcoded-spacing` and `no-hardcoded-typography` are `off` in `eslint.config.mjs`.
- Add primitives with the shadcn CLI and the `@dcyfr-labs` registry instead of writing parallel copies.

## Conventions and gotchas

- `components/chrome/` is owned by the registry bundle. Update it by re-running the registry add command instead of editing the files.
- `proxy.ts` redirects `dcyfr.bot` to `www.dcyfr.bot` with a 308 and security headers. It stays inert while the Vercel project-level apex redirect exists. `metadataBase` is the apex URL.
- A legacy `.eslintrc.json` sits next to the flat config. ESLint 9 reads `eslint.config.mjs`.
- Keep marketplace behavior and content aligned with `data/agents.json`, `data/reputation.json` and the types in `lib/types.ts`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

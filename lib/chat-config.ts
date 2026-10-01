// Chat availability and model choice, shared by /api/chat and the agent page.

const DEFAULT_GATEWAY_MODEL = 'anthropic/claude-sonnet-4.6';
export const DIRECT_ANTHROPIC_MODEL = 'claude-sonnet-4-6';

// Production chat stays off until the AI Gateway has paid credits: the free tier
// refuses Anthropic models. Preview and local dev stay on so the gateway path can be
// tested. Set CHAT_ENABLED=true in the Production env (and redeploy, since the agent
// page is static) to turn it back on.
export function isChatEnabled(): boolean {
  return process.env.VERCEL_ENV !== 'production' || process.env.CHAT_ENABLED === 'true';
}

// CHAT_MODEL is a testing override, e.g. a free gateway model in the Preview env.
// Free models carry no no-training or zero-retention guarantee, so production
// ignores it and always uses the default.
export function gatewayModel(): string {
  if (process.env.VERCEL_ENV === 'production') return DEFAULT_GATEWAY_MODEL;
  return process.env.CHAT_MODEL?.trim() || DEFAULT_GATEWAY_MODEL;
}

import Link from 'next/link';
import type { Agent, ReputationEntry } from '@/lib/types';

interface Props {
  agent: Agent;
  reputation?: ReputationEntry;
  compact?: boolean;
}

// CATEGORY_COLORS — 6 agent categories mapped to semantic tokens where the
// intent matches, with 2 deliberate carveouts (documentation=cyan, devops=
// orange) that have no matching semantic on the violet+purple identity
// palette. See openspec/changes/dcyfr-bot-onboarding §2 for the mapping
// rationale.
// Lint exception recorded in the openspec change (carveouts intentional).
//
// These were tinted chips (`bg-warning/40 … text-warning`) until the identity
// codemod collapsed three distinct shades onto one token at three opacities.
// That reads as the same hue at two lightnesses, so every chip measured 1.4-2.9:1
// in light mode. The six hues survive; only the treatment changed.
//
// Solid fills rather than tints, because the *-foreground tokens are not
// uniformly the dark end of their hue here: --success-foreground and
// --warning-foreground are near-black, but --destructive-foreground and
// --secure-foreground are near-WHITE in light mode. They are the pair for a
// SOLID fill, not for a tint, so a tint would leave two of the four unreadable.
// Pairing each token with its own foreground is contrast-correct by
// construction in both schemes. The carveouts use -700 fills for the same
// reason: orange-600 with orange-50 measures 3.35:1, orange-700 gives 4.87.
const CATEGORY_COLORS: Record<Agent['category'], string> = {
  general:       'bg-secure border-secure text-secure-foreground',
  architecture:  'bg-warning border-warning text-warning-foreground',
  governance:    'bg-success border-success text-success-foreground',
  documentation: 'bg-cyan-700 border-cyan-700 text-cyan-50',
  devops:        'bg-orange-700 border-orange-700 text-orange-50',
  security:      'bg-destructive border-destructive text-destructive-foreground',
};

const CATEGORY_LABELS: Record<Agent['category'], string> = {
  general:       'General',
  architecture:  'Architecture',
  governance:    'Governance',
  documentation: 'Documentation',
  devops:        'DevOps',
  security:      'Security',
};

export function AgentCard({ agent, reputation, compact = false }: Readonly<Props>) {
  return (
    <Link
      href={`/agents/${agent.agentId}`}
      className="group block bg-card/20 border border-border/30 rounded-xl p-5 hover:bg-muted/30 hover:border-primary/50 transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground/80 group-hover:text-foreground transition-colors truncate">
            {agent.name}
          </h3>
          <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate">{agent.agentId}</p>
        </div>
        {reputation && (
          <div className="shrink-0 text-right">
            <p className="text-lg font-bold text-muted-foreground">{reputation.score}</p>
            <p className="text-xs text-muted-foreground">score</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${CATEGORY_COLORS[agent.category]}`}>
          {CATEGORY_LABELS[agent.category]}
        </span>
        {/* Outline rather than a second solid pill: the category chip beside it
            is already solid, and two filled chips read as equal weight when the
            clearance is secondary. --success is a mid-tone fill and was
            unreadable as text on its own /30 tint in light, so light mode takes
            the dark end of the hue and dark mode takes the fill. */}
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border border-success/60 text-success-foreground dark:text-success">
          {agent.tlpClearance}
        </span>
      </div>

      {!compact && (
        <p className="text-sm text-muted-foreground line-clamp-2">{agent.description}</p>
      )}

      {reputation && !compact && (
        <div className="mt-3 pt-3 border-t border-border/40 flex items-center gap-4 text-xs text-muted-foreground">
          <span>★ {reputation.avgRating.toFixed(1)}</span>
          <span>{reputation.totalRatings} ratings</span>
          <span>{(reputation.successRate * 100).toFixed(0)}% success</span>
        </div>
      )}
    </Link>
  );
}

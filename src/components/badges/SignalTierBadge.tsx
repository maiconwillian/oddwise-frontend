import { Badge } from '@/components/ui/label';
import type { MatchInsightSignalTier } from '@/types/matchInsight';

const LABELS: Record<MatchInsightSignalTier, string> = {
  EV_PLUS: 'EV+',
  NEAR: 'Quase',
  WEAK: 'Fraco',
  NO_STATS: '—',
};

const VARIANTS: Record<
  MatchInsightSignalTier,
  'success' | 'warning' | 'secondary' | 'danger'
> = {
  EV_PLUS: 'success',
  NEAR: 'warning',
  WEAK: 'secondary',
  NO_STATS: 'secondary',
};

export function SignalTierBadge({ tier }: { tier: MatchInsightSignalTier }) {
  return <Badge variant={VARIANTS[tier]}>{LABELS[tier]}</Badge>;
}

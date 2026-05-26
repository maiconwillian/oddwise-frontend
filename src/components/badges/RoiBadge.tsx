import { Badge } from '@/components/ui/label';
import { formatPercent, valueColorClass } from '@/utils/numbers';
import { cn } from '@/lib/utils';

export function RoiBadge({ roi }: { roi: number | null | undefined }) {
  if (roi == null) return <Badge variant="secondary">—</Badge>;
  return (
    <Badge variant={roi >= 0 ? 'success' : 'danger'} className={cn('tabular-nums', valueColorClass(roi))}>
      {formatPercent(roi)}
    </Badge>
  );
}

export function EvBadge({ ev }: { ev: number | null | undefined }) {
  if (ev == null) return <Badge variant="secondary">—</Badge>;
  return (
    <Badge variant={ev >= 0 ? 'success' : 'danger'} className={cn('tabular-nums', valueColorClass(ev))}>
      EV {formatPercent(ev)}
    </Badge>
  );
}

export function ClvBadge({ clv }: { clv: number | null | undefined }) {
  if (clv == null) return <Badge variant="secondary">—</Badge>;
  return (
    <Badge variant={clv >= 0 ? 'success' : 'danger'} className={cn('tabular-nums', valueColorClass(clv))}>
      CLV {formatPercent(clv)}
    </Badge>
  );
}

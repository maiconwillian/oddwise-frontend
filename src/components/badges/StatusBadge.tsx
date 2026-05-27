import { Badge } from '@/components/ui/label';
import { formatStatus } from '@/utils/formatters';

const statusVariant: Record<string, 'default' | 'success' | 'danger' | 'warning' | 'secondary'> = {
  PROPOSED: 'default',
  REJECTED: 'secondary',
  PENDING: 'warning',
  WON: 'success',
  LOST: 'danger',
  VOID: 'secondary',
  NS: 'default',
  TBD: 'secondary',
  LIVE: 'warning',
  FT: 'success',
  HT: 'warning',
  ET: 'warning',
  ONE_H: 'warning',
  TWO_H: 'warning',
  PST: 'secondary',
  CANC: 'danger',
  ABD: 'danger',
  SUSP: 'warning',
  '1H': 'warning',
  '2H': 'warning',
};

export function StatusBadge({ status }: { status: string | null | undefined }) {
  if (!status) return <Badge variant="secondary">—</Badge>;
  const key = status.toUpperCase();
  return (
    <Badge variant={statusVariant[key] ?? 'secondary'}>
      {formatStatus(status)}
    </Badge>
  );
}

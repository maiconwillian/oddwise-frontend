import { Badge } from '@/components/ui/label';
import { formatLeague } from '@/utils/formatters';

type LeagueBadgeProps = {
  league: string | null | undefined;
  country?: string | null;
};

export function LeagueBadge({ league, country }: LeagueBadgeProps) {
  if (!league) return <Badge variant="secondary">—</Badge>;
  return <Badge variant="outline">{formatLeague(league, country)}</Badge>;
}

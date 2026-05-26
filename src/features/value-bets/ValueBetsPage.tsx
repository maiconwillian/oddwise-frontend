import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/data-table/DataTable';
import { LeagueBadge } from '@/components/badges/LeagueBadge';
import { EvBadge } from '@/components/badges/RoiBadge';
import { ErrorState } from '@/components/states/ErrorState';
import { TableSkeleton } from '@/components/states/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { DateInput } from '@/components/ui/date-input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { valueBetService } from '@/services/valueBetService';
import { LEAGUES } from '@/types/api';
import type { ValueBetOpportunity } from '@/types/valueBet';
import { formatDateTimeBR, toISODate } from '@/utils/dates';
import { formatCurrency, formatOdd } from '@/utils/numbers';
import { formatMarket } from '@/utils/formatters';

export function ValueBetsPage() {
  const [date, setDate] = useState(toISODate(new Date()));
  const [league, setLeague] = useState('');

  const query = useQuery({
    queryKey: ['value-bets', date, league],
    queryFn: () =>
      valueBetService.getValueBets({
        date,
        league: league || undefined,
      }),
  });

  const columns: ColumnDef<ValueBetOpportunity, unknown>[] = [
    {
      header: 'Partida',
      id: 'match',
      cell: ({ row }) => (
        <div className="min-w-[160px]">
          <Link
            to={`/matches/${row.original.matchId}`}
            className="font-medium hover:text-primary hover:underline"
          >
            {row.original.homeTeamName} vs {row.original.awayTeamName}
          </Link>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatDateTimeBR(row.original.matchDate)}
          </p>
        </div>
      ),
    },
    {
      header: 'Liga',
      id: 'league',
      cell: ({ row }) => (
        <LeagueBadge league={row.original.leagueName} country={row.original.leagueCountry} />
      ),
    },
    {
      header: 'Odd',
      id: 'odd',
      cell: ({ row }) => (
        <span className="font-mono text-sm">
          {formatOdd(row.original.odd)} · {row.original.bookmaker}
        </span>
      ),
    },
    {
      header: 'EV',
      accessorKey: 'expectedValue',
      cell: ({ row }) => <EvBadge ev={row.original.expectedValue * 100} />,
    },
    {
      header: 'Conf.',
      accessorKey: 'confidence',
      cell: ({ row }) => `${row.original.confidence.toFixed(0)}%`,
    },
    {
      header: 'Kelly',
      id: 'kelly',
      cell: ({ row }) => (
        <div className="text-sm">
          <p>{formatCurrency(row.original.suggestedStake)}</p>
          <p className="text-xs text-muted-foreground">
            f={(row.original.kellyFraction * 100).toFixed(1)}%
          </p>
        </div>
      ),
    },
    {
      header: 'Ação',
      id: 'action',
      cell: ({ row }) => (
        <Link to={`/suggestions/new?matchId=${row.original.matchId}`}>
          <Button variant="ghost" size="sm">
            <Plus className="mr-1 h-3 w-3" />
            Sugestão
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Oportunidades EV+"
        description="Value bets Over 2.5 — modelo vs odd de mercado (Phase 1.5c)"
      />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Como funciona</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            Lista partidas do dia com odds capturadas, confiança e EV+ acima dos limiares do backend.
            Use <strong className="text-foreground">Criar sugestão</strong> para registrar a aposta manualmente.
            Mercado: {formatMarket('OVER_2_5')}.
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-border bg-card p-4">
        <div className="space-y-1">
          <Label htmlFor="vb-date" className="cursor-pointer">
            Data
          </Label>
          <DateInput id="vb-date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="vb-league">Liga</Label>
          <Select
            id="vb-league"
            value={league}
            onChange={(e) => setLeague(e.target.value)}
            className="min-w-[180px]"
          >
            <option value="">Todas suportadas</option>
            {LEAGUES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {query.isLoading ? (
        <TableSkeleton />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : (
        <DataTable
          columns={columns}
          data={query.data ?? []}
          page={0}
          totalPages={1}
          onPageChange={() => {}}
          emptyTitle="Nenhuma oportunidade EV+"
          emptyDescription="Sincronize partidas, capture odds e ajuste limiares no backend se necessário."
        />
      )}
    </div>
  );
}

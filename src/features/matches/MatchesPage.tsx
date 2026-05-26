import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/data-table/DataTable';
import { LeagueBadge } from '@/components/badges/LeagueBadge';
import { StatusBadge } from '@/components/badges/StatusBadge';
import { EvBadge } from '@/components/badges/RoiBadge';
import { SignalTierBadge } from '@/components/badges/SignalTierBadge';
import { ErrorState } from '@/components/states/ErrorState';
import { TableSkeleton } from '@/components/states/LoadingSkeleton';
import { DateInput } from '@/components/ui/date-input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { matchService } from '@/services/matchService';
import { valueBetService } from '@/services/valueBetService';
import { LEAGUES, MATCH_STATUSES, leagueFromApiNameAndCountry, type League, type SpringPage } from '@/types/api';
import type { MatchInsightRow } from '@/types/matchInsight';
import type { Match } from '@/types/match';
import { formatDateTimeBR, toISODate } from '@/utils/dates';
import { filterSupportedLeagueMatches, matchesStatusFilter } from '@/utils/matches';

function filterMatches(matches: Match[], league: string, status: string): Match[] {
  return filterSupportedLeagueMatches(matches).filter((match) => {
    if (league) {
      const matchLeague = leagueFromApiNameAndCountry(match.leagueName, match.leagueCountry);
      if (matchLeague !== league) return false;
    }
    if (!matchesStatusFilter(match.status, status)) return false;
    return true;
  });
}

function toPage(matches: Match[], page: number, size: number): SpringPage<Match> {
  const start = page * size;
  const content = matches.slice(start, start + size);
  const totalPages = Math.max(1, Math.ceil(matches.length / size));

  return {
    content,
    totalElements: matches.length,
    totalPages,
    number: page,
    size,
    numberOfElements: content.length,
    first: page === 0,
    last: page >= totalPages - 1,
    empty: matches.length === 0,
  };
}

function formatInsightEv(expectedValue: number | null | undefined) {
  if (expectedValue == null) return null;
  return expectedValue * 100;
}

const baseColumns: ColumnDef<Match, unknown>[] = [
  {
    header: 'Partida',
    id: 'match',
    cell: ({ row }) => (
      <Link
        to={`/matches/${row.original.id}`}
        className="font-medium hover:text-primary hover:underline"
      >
        {row.original.homeTeamName} vs {row.original.awayTeamName}
      </Link>
    ),
  },
  {
    header: 'Liga',
    accessorKey: 'leagueName',
    cell: ({ row }) => (
      <LeagueBadge league={row.original.leagueName} country={row.original.leagueCountry} />
    ),
  },
  {
    header: 'Data',
    accessorKey: 'matchDate',
    cell: ({ row }) => formatDateTimeBR(row.original.matchDate),
  },
  {
    header: 'Placar',
    id: 'score',
    cell: ({ row }) => {
      const { homeGoals, awayGoals } = row.original;
      if (homeGoals == null || awayGoals == null) return '—';
      return `${homeGoals} × ${awayGoals}`;
    },
  },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];

function buildInsightColumns(
  insightByMatchId: Map<string, MatchInsightRow>,
): ColumnDef<Match, unknown>[] {
  return [
    baseColumns[0],
    baseColumns[1],
    baseColumns[2],
    {
      header: 'Confiança',
      id: 'confidence',
      cell: ({ row }) => {
        const insight = insightByMatchId.get(row.original.id);
        if (!insight?.statsReady) return '—';
        return `${insight.confidence.toFixed(0)}%`;
      },
    },
    {
      header: 'Stats',
      id: 'stats',
      cell: ({ row }) => {
        const insight = insightByMatchId.get(row.original.id);
        if (!insight) return '—';
        return (
          <span className={insight.statsReady ? 'text-emerald-400' : 'text-amber-400'}>
            {insight.statsReady ? 'OK' : 'Pendente'}
          </span>
        );
      },
    },
    {
      header: 'Odds',
      id: 'odds',
      cell: ({ row }) => {
        const insight = insightByMatchId.get(row.original.id);
        if (!insight) return '—';
        return insight.hasOdds ? 'Sim' : 'Não';
      },
    },
    {
      header: 'EV',
      id: 'ev',
      cell: ({ row }) => {
        const insight = insightByMatchId.get(row.original.id);
        return <EvBadge ev={formatInsightEv(insight?.expectedValue)} />;
      },
    },
    {
      header: 'Sinal',
      id: 'signal',
      cell: ({ row }) => {
        const insight = insightByMatchId.get(row.original.id);
        if (!insight) return '—';
        return <SignalTierBadge tier={insight.signalTier} />;
      },
    },
    baseColumns[3],
    baseColumns[4],
  ];
}

export function MatchesPage() {
  const [page, setPage] = useState(0);
  const [date, setDate] = useState(toISODate(new Date()));
  const [league, setLeague] = useState('');
  const [status, setStatus] = useState('');

  const insightsQuery = useQuery({
    queryKey: ['match-insights', date, league],
    queryFn: () =>
      valueBetService.getMatchInsights({
        date,
        league: league || undefined,
      }),
    enabled: Boolean(date),
  });

  const query = useQuery({
    queryKey: ['matches', page, date, league, status],
    queryFn: async () => {
      if (date) {
        const matches = filterMatches(await matchService.getMatchesByDate(date), league, status);
        return toPage(matches, page, 10);
      }

      if (league) {
        const matches = filterMatches(
          await matchService.getMatchesByLeague(league as League),
          '',
          status,
        );
        return toPage(matches, page, 10);
      }

      return matchService.getMatches({ page, size: 10 });
    },
  });

  const insightByMatchId = useMemo(() => {
    const map = new Map<string, MatchInsightRow>();
    for (const row of insightsQuery.data?.insights ?? []) {
      map.set(row.matchId, row);
    }
    return map;
  }, [insightsQuery.data?.insights]);

  const columns = useMemo(
    () => (date ? buildInsightColumns(insightByMatchId) : baseColumns),
    [date, insightByMatchId],
  );

  const loading = query.isLoading || (Boolean(date) && insightsQuery.isLoading);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Partidas"
        description="Partidas das ligas suportadas — com filtro por data, confiança e sinal na rodada"
      />

      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-border bg-card p-4">
        <div className="space-y-1">
          <Label htmlFor="filter-date" className="cursor-pointer">
            Data
          </Label>
          <DateInput
            id="filter-date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setPage(0);
            }}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="filter-league">Liga</Label>
          <Select
            id="filter-league"
            value={league}
            onChange={(e) => {
              setLeague(e.target.value);
              setPage(0);
            }}
            className="min-w-[180px]"
          >
            <option value="">Todas</option>
            {LEAGUES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="filter-status">Status</Label>
          <Select
            id="filter-status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(0);
            }}
            className="min-w-[140px]"
          >
            <option value="">Todos</option>
            {MATCH_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {date && (
        <p className="text-sm text-muted-foreground">
          Colunas de análise carregadas em lote para {date} (sem abrir cada partida).
        </p>
      )}

      {loading ? (
        <TableSkeleton />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : insightsQuery.isError && date ? (
        <ErrorState error={insightsQuery.error} onRetry={() => insightsQuery.refetch()} />
      ) : (
        <DataTable
          columns={columns}
          data={query.data?.content ?? []}
          page={page}
          totalPages={query.data?.totalPages ?? 1}
          onPageChange={setPage}
          emptyTitle="Nenhuma partida encontrada"
          emptyDescription="Sincronize partidas em Admin / Sync para a data selecionada."
        />
      )}
    </div>
  );
}

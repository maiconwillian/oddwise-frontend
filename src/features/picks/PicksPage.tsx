import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { Link, useSearchParams } from 'react-router-dom';
import { Eye, Plus, Trophy } from 'lucide-react';
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
import { Badge } from '@/components/ui/label';
import { pickService } from '@/services/pickService';
import { LEAGUES } from '@/types/api';
import type { MatchPick } from '@/types/pick';
import { formatDateTimeBR, toISODate } from '@/utils/dates';
import { formatMarket } from '@/utils/formatters';
import { formatOdd } from '@/utils/numbers';

function formatPickEv(ev: number | null | undefined) {
  if (ev == null) return null;
  return ev * 100;
}

function primaryRecommendation(pick: MatchPick) {
  return pick.recommendations[0];
}

const columns: ColumnDef<MatchPick, unknown>[] = [
  {
    header: '#',
    accessorKey: 'rank',
    cell: ({ row }) => (
      <span className="font-mono text-sm text-muted-foreground">{row.original.rank ?? '—'}</span>
    ),
  },
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
    header: 'Mercado',
    id: 'market',
    cell: ({ row }) => {
      const rec = primaryRecommendation(row.original);
      return rec ? formatMarket(rec.market) : '—';
    },
  },
  {
    header: 'Confiança',
    id: 'confidence',
    cell: ({ row }) => {
      const rec = primaryRecommendation(row.original);
      return rec ? `${rec.confidence.toFixed(0)}%` : '—';
    },
  },
  {
    header: 'EV',
    id: 'ev',
    cell: ({ row }) => <EvBadge ev={formatPickEv(primaryRecommendation(row.original)?.ev)} />,
  },
  {
    header: 'Odd',
    id: 'odd',
    cell: ({ row }) => {
      const rec = primaryRecommendation(row.original);
      if (!rec?.odd) return '—';
      return (
        <span className="font-mono text-sm">
          {formatOdd(rec.odd)}
          {rec.bookmaker ? ` · ${rec.bookmaker}` : ''}
        </span>
      );
    },
  },
  {
    header: 'Motivo',
    id: 'reason',
    cell: ({ row }) => (
      <p className="max-w-[220px] text-xs text-muted-foreground">
        {row.original.bestPick?.reason ?? 'Sem pick acionável (stats/odd/EV)'}
      </p>
    ),
  },
  {
    header: 'Ação',
    id: 'action',
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        <Link to={`/matches/${row.original.matchId}`}>
          <Button variant="ghost" size="sm">
            <Eye className="mr-1 h-3 w-3" />
            Partida
          </Button>
        </Link>
        <Link to={`/suggestions/new?matchId=${row.original.matchId}`}>
          <Button variant="ghost" size="sm">
            <Plus className="mr-1 h-3 w-3" />
            Sugestão
          </Button>
        </Link>
      </div>
    ),
  },
];

export function PicksPage() {
  const [searchParams] = useSearchParams();
  const [date, setDate] = useState(searchParams.get('date') ?? toISODate(new Date()));
  const [league, setLeague] = useState(searchParams.get('league') ?? '');

  const query = useQuery({
    queryKey: ['round-picks', date, league],
    queryFn: () =>
      pickService.getRoundPicks({
        date,
        league: league || undefined,
      }),
  });

  const top = query.data?.topPick;
  const topRec = top ? primaryRecommendation(top) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Picks da rodada"
        description="Melhor recomendação Over 2.5 por jogo e ranking do dia — independente do filtro EV+ automático"
      />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Como funciona</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">Pick recomendado</strong> escolhe o melhor mercado
            do jogo (v1: só Over 2.5) com EV positivo e maior confiança. Pode aparecer aqui mesmo
            abaixo de 65% de confiança — diferente de{' '}
            <Link to="/value-bets" className="text-primary hover:underline">
              Oportunidades EV+
            </Link>
            , que exige limiares automáticos (65% / 5% EV).
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-border bg-card p-4">
        <div className="space-y-1">
          <Label htmlFor="picks-date" className="cursor-pointer">
            Data
          </Label>
          <DateInput id="picks-date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="picks-league">Liga</Label>
          <Select
            id="picks-league"
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
        <>
          {query.data?.hint && (
            <p className="text-sm text-muted-foreground">{query.data.hint}</p>
          )}

          {top && top.bestPick && topRec ? (
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Trophy className="h-5 w-5 text-primary" />
                  Pick da rodada #{top.rank}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link
                      to={`/matches/${top.matchId}`}
                      className="text-lg font-semibold hover:text-primary hover:underline"
                    >
                      {top.homeTeamName} vs {top.awayTeamName}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTimeBR(top.matchDate)} ·{' '}
                      <LeagueBadge league={top.leagueName} country={top.leagueCountry} />
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {top.bestPick.eligibleForAutoOpportunity ? (
                      <Badge variant="success">Também é oportunidade EV+</Badge>
                    ) : (
                      <Badge variant="warning">Abaixo do limiar EV+ automático</Badge>
                    )}
                    <EvBadge ev={formatPickEv(topRec.ev)} />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{top.bestPick.reason}</p>
                <p className="font-mono text-sm">
                  {formatMarket(topRec.market)} @ {formatOdd(topRec.odd)} · conf.{' '}
                  {topRec.confidence.toFixed(0)}%
                </p>
                <div className="flex flex-wrap gap-2">
                  <Link to={`/matches/${top.matchId}`}>
                    <Button variant="outline" size="sm">
                      Ver partida
                    </Button>
                  </Link>
                  <Link to={`/suggestions/new?matchId=${top.matchId}`}>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Criar sugestão
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6 text-sm text-muted-foreground">
                Nenhum pick com EV positivo nesta data. Enriqueça análise, capture odds Over 2.5 e
                confira{' '}
                <Link to="/value-bets" className="text-primary hover:underline">
                  Oportunidades EV+
                </Link>
                .
              </CardContent>
            </Card>
          )}

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Ranking da rodada</h2>
            <p className="text-sm text-muted-foreground">
              {query.data?.actionablePicks ?? 0} pick(s) acionável(is) de{' '}
              {query.data?.matchesConsidered ?? 0} partida(s) — score = confiança × (1 + EV) quando
              EV &gt; 0.
            </p>
            <DataTable
              columns={columns}
              data={query.data?.rankedPicks ?? []}
              page={0}
              totalPages={1}
              onPageChange={() => {}}
              emptyTitle="Nenhum jogo na rodada"
              emptyDescription="Sincronize partidas para esta data em Admin / Sync."
            />
          </section>
        </>
      )}
    </div>
  );
}

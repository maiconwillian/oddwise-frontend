import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { Link } from 'react-router-dom';
import { AlertTriangle, Eye, Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/data-table/DataTable';
import { LeagueBadge } from '@/components/badges/LeagueBadge';
import { EvBadge } from '@/components/badges/RoiBadge';
import { SignalTierBadge } from '@/components/badges/SignalTierBadge';
import { ErrorState } from '@/components/states/ErrorState';
import { TableSkeleton } from '@/components/states/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { DateInput } from '@/components/ui/date-input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { valueBetService } from '@/services/valueBetService';
import { LEAGUES } from '@/types/api';
import type { MatchInsightRow } from '@/types/matchInsight';
import type { ValueBetOpportunity } from '@/types/valueBet';
import { formatDateTimeBR, toISODate } from '@/utils/dates';
import { formatCurrency, formatOdd } from '@/utils/numbers';
import { formatMarket } from '@/utils/formatters';

function formatInsightEv(expectedValue: number | null | undefined) {
  if (expectedValue == null) return null;
  return expectedValue * 100;
}

const opportunityColumns: ColumnDef<ValueBetOpportunity, unknown>[] = [
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

const radarColumns: ColumnDef<MatchInsightRow, unknown>[] = [
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
    header: 'Confiança',
    accessorKey: 'confidence',
    cell: ({ row }) =>
      row.original.statsReady ? `${row.original.confidence.toFixed(0)}%` : '—',
  },
  {
    header: 'EV',
    id: 'ev',
    cell: ({ row }) => (
      <div className="text-sm">
        <EvBadge ev={formatInsightEv(row.original.expectedValue)} />
        {row.original.referenceOdd != null && (
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">
            @ {formatOdd(row.original.referenceOdd)}
            {row.original.bookmaker ? ` · ${row.original.bookmaker}` : ''}
          </p>
        )}
      </div>
    ),
  },
  {
    header: 'Stats',
    id: 'stats',
    cell: ({ row }) => (
      <span className={row.original.statsReady ? 'text-emerald-400' : 'text-amber-400'}>
        {row.original.statsReady ? 'OK' : 'Pendente'}
      </span>
    ),
  },
  {
    header: 'Odds',
    id: 'odds',
    cell: ({ row }) => (row.original.hasOdds ? 'Sim' : 'Não'),
  },
  {
    header: 'Sinal',
    id: 'signal',
    cell: ({ row }) => <SignalTierBadge tier={row.original.signalTier} />,
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

export function ValueBetsPage() {
  const [date, setDate] = useState(toISODate(new Date()));
  const [league, setLeague] = useState('');

  const scanQuery = useQuery({
    queryKey: ['value-bets', date, league],
    queryFn: () =>
      valueBetService.getValueBets({
        date,
        league: league || undefined,
      }),
  });

  const insightsQuery = useQuery({
    queryKey: ['match-insights', date, league],
    queryFn: () =>
      valueBetService.getMatchInsights({
        date,
        league: league || undefined,
      }),
  });

  const opportunities = scanQuery.data?.opportunities ?? [];
  const insights = insightsQuery.data?.insights ?? [];
  const minConf = insightsQuery.data?.minConfidence ?? 65;
  const minEvPct = (insightsQuery.data?.minEv ?? 0.05) * 100;
  const loading = scanQuery.isLoading || insightsQuery.isLoading;
  const error = scanQuery.isError ? scanQuery.error : insightsQuery.error;
  const refetch = () => {
    scanQuery.refetch();
    insightsQuery.refetch();
  };

  const showEmptyOpportunitiesHint =
    !scanQuery.data?.statsIncomplete && opportunities.length === 0 && !loading && !error;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Oportunidades EV+"
        description="Hub da rodada: oportunidades que passam limiares EV+ e radar de análise do dia"
      />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Como funciona</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">Oportunidades EV+</strong> lista apenas jogos que
            passam confiança e EV mínimos com odd Over 2.5 capturada.{' '}
            <strong className="text-foreground">Análise da rodada</strong> mostra todos os jogos
            elegíveis do dia (mesmo abaixo do limiar) para decisão rápida sem abrir cada partida.
            Mercado: {formatMarket('OVER_2_5')}. Para o{' '}
            <strong className="text-foreground">melhor pick do dia</strong> (mesmo abaixo do limiar
            EV+), use{' '}
            <Link to={`/picks?date=${date}`} className="text-primary hover:underline">
              Picks da rodada
            </Link>
            .
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
        <Link
          to={`/picks?date=${date}${league ? `&league=${league}` : ''}`}
          className="text-sm text-primary hover:underline"
        >
          Ver picks da rodada →
        </Link>
      </div>

      {scanQuery.data?.statsIncomplete && scanQuery.data.hint && (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardContent className="flex gap-3 pt-6 text-sm">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
            <div>
              <p className="font-medium text-amber-200">Stats incompletas para EV+ automático</p>
              <p className="mt-1 text-muted-foreground">{scanQuery.data.hint}</p>
              <p className="mt-2 text-muted-foreground">
                Rotina: Admin → Enriquecer análise para{' '}
                <strong className="text-foreground">{date}</strong> → capturar odds.{' '}
                <Link to="/admin/sync" className="text-primary hover:underline">
                  Abrir Admin Sync
                </Link>
                .
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {scanQuery.data.matchesWithEnrichedStats}/{scanQuery.data.matchesConsidered}{' '}
                partidas com stats enriquecidas nesta data.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <TableSkeleton />
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Oportunidades EV+</h2>
            {showEmptyOpportunitiesHint && (
              <p className="text-sm text-muted-foreground">
                Nenhum jogo passou confiança ≥ {minConf.toFixed(0)}% e EV ≥ {minEvPct.toFixed(0)}%
                com odd Over 2.5 capturada. Veja <strong className="text-foreground">Análise da
                rodada</strong> abaixo — jogos próximos do limiar (ex. ~55–64% confiança) aparecem
                com sinal &quot;Quase&quot;.
              </p>
            )}
            <DataTable
              columns={opportunityColumns}
              data={opportunities}
              page={0}
              totalPages={1}
              onPageChange={() => {}}
              emptyTitle="Nenhuma oportunidade EV+ nesta data"
              emptyDescription={
                scanQuery.data?.statsIncomplete
                  ? 'Enriqueça a análise (Admin) e capture odds Over 2.5 antes de esperar sinais automáticos.'
                  : `Stats OK (${scanQuery.data?.matchesWithEnrichedStats ?? 0}/${scanQuery.data?.matchesConsidered ?? 0}), mas nenhuma partida passou os limiares EV+.`
              }
            />
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Análise da rodada</h2>
            <p className="text-sm text-muted-foreground">
              {insights.length} jogo(s) elegível(is) (NS/TBD, ligas suportadas), ordenados por
              confiança.
            </p>
            <DataTable
              columns={radarColumns}
              data={insights}
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

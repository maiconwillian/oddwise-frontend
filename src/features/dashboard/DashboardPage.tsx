import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, DollarSign, Percent, Target, Trophy, Users } from 'lucide-react';
import { pickService } from '@/services/pickService';
import { proposalService } from '@/services/proposalService';
import { startOfWeek, endOfWeek } from 'date-fns';
import { formatMarket } from '@/utils/formatters';
import { Link } from 'react-router-dom';
import { type ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '@/components/layout/PageHeader';
import { MetricCard } from '@/components/badges/MetricCard';
import { StatusBadge } from '@/components/badges/StatusBadge';
import { EvBadge } from '@/components/badges/RoiBadge';
import { DataTable } from '@/components/data-table/DataTable';
import { PerformanceChart } from '@/components/charts/PerformanceChart';
import { LoadingSkeleton } from '@/components/states/LoadingSkeleton';
import { ErrorState } from '@/components/states/ErrorState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/label';
import { reportService } from '@/services/reportService';
import { suggestionService } from '@/services/suggestionService';
import { adminService } from '@/services/adminService';
import type { Suggestion } from '@/types/suggestion';
import { statusCount, totalSuggestions } from '@/types/reports';
import { defaultDateRange, formatDateTimeBR, toISODate } from '@/utils/dates';
import { formatCurrency, formatPercent, valueColorClass } from '@/utils/numbers';
import { formatOdd } from '@/utils/numbers';

const { from, to } = defaultDateRange();

const suggestionColumns: ColumnDef<Suggestion, unknown>[] = [
  {
    header: 'Mercado',
    accessorKey: 'market',
  },
  {
    header: 'Odd',
    accessorKey: 'pickedOdd',
    cell: ({ row }) => formatOdd(row.original.pickedOdd),
  },
  {
    header: 'EV',
    accessorKey: 'expectedValue',
    cell: ({ row }) => <EvBadge ev={row.original.expectedValue} />,
  },
  {
    header: 'Stake',
    accessorKey: 'stake',
    cell: ({ row }) => formatCurrency(row.original.stake),
  },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    header: '',
    id: 'actions',
    cell: ({ row }) => (
      <Link
        to={`/matches/${row.original.matchId}`}
        className="text-sm text-primary hover:underline"
      >
        Ver partida
      </Link>
    ),
  },
];

export function DashboardPage() {
  const statusQuery = useQuery({
    queryKey: ['status-summary'],
    queryFn: () => reportService.getStatusSummary(),
  });

  const roiQuery = useQuery({
    queryKey: ['roi', from, to],
    queryFn: () => reportService.getROIReport(from, to),
  });

  const suggestionsQuery = useQuery({
    queryKey: ['suggestions', 'recent'],
    queryFn: () => suggestionService.getSuggestions({ page: 0, size: 5 }),
  });

  const syncQuery = useQuery({
    queryKey: ['sync-status'],
    queryFn: () => adminService.getSyncStatus(),
  });

  const today = toISODate(new Date());
  const weekFrom = toISODate(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const weekTo = toISODate(endOfWeek(new Date(), { weekStartsOn: 1 }));

  const proposedQuery = useQuery({
    queryKey: ['proposed-suggestions', weekFrom, weekTo],
    queryFn: () => proposalService.getProposed({ from: weekFrom, to: weekTo }),
  });

  const roundPicksQuery = useQuery({
    queryKey: ['round-picks', today, ''],
    queryFn: () => pickService.getRoundPicks({ date: today }),
  });

  const isLoading = statusQuery.isLoading || roiQuery.isLoading;
  const hasError = statusQuery.isError || roiQuery.isError;

  if (hasError) {
    return (
      <ErrorState
        error={statusQuery.error ?? roiQuery.error}
        onRetry={() => {
          statusQuery.refetch();
          roiQuery.refetch();
        }}
      />
    );
  }

  const status = statusQuery.data;
  const roi = roiQuery.data;
  const sync = syncQuery.data;

  const chartData =
    roi?.dailyData?.map((d) => ({ date: d.date, profit: d.profit })) ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Visão geral de performance, sugestões e sincronização — Over 2.5 Goals"
      />

      {isLoading ? (
        <LoadingSkeleton count={6} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <MetricCard
            title="ROI do período"
            value={formatPercent(roi?.roi)}
            valueClassName={valueColorClass(roi?.roi)}
            icon={Percent}
          />
          <MetricCard
            title="Lucro / Prejuízo"
            value={formatCurrency(roi?.totalProfit)}
            valueClassName={valueColorClass(roi?.totalProfit)}
            icon={DollarSign}
          />
          <MetricCard
            title="Winrate"
            value={formatPercent(roi?.winRate)}
            icon={Trophy}
          />
          <MetricCard
            title="Sugestões"
            value={String(totalSuggestions(status) || roi?.totalSuggestions || 0)}
            icon={Target}
          />
          <MetricCard
            title="Partidas sincronizadas"
            value={String(sync?.totalMatchesSynced ?? 0)}
            icon={Users}
          />
          <MetricCard
            title="Pendentes"
            value={String(statusCount(status, 'PENDING'))}
            subtitle={`${statusCount(status, 'WON')} ganhas · ${statusCount(status, 'LOST')} perdidas`}
            icon={AlertTriangle}
          />
        </div>
      )}

      {proposedQuery.data && (
        <Card className="border-border bg-card">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="text-sm">
              <p className="font-medium">Propostas esta semana</p>
              <p className="text-2xl font-bold text-primary">
                {proposedQuery.data.length}/5
              </p>
              <p className="text-xs text-muted-foreground">Aguardando sua revisão</p>
            </div>
            <Link
              to="/suggestions/proposed"
              className="text-sm font-medium text-primary hover:underline"
            >
              Revisar propostas →
            </Link>
          </CardContent>
        </Card>
      )}

      {roundPicksQuery.data?.topPick?.bestPick && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="text-sm">
              <p className="font-medium text-primary">Melhor pick hoje</p>
              <p className="mt-1 text-foreground">
                {roundPicksQuery.data.topPick.homeTeamName} vs{' '}
                {roundPicksQuery.data.topPick.awayTeamName}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatMarket(roundPicksQuery.data.topPick.bestPick.market)} ·{' '}
                {roundPicksQuery.data.topPick.recommendations[0]?.confidence.toFixed(0)}% conf.
              </p>
            </div>
            <Link
              to={`/picks?date=${today}`}
              className="text-sm font-medium text-primary hover:underline"
            >
              Ver picks da rodada →
            </Link>
          </CardContent>
        </Card>
      )}

      {sync && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <div className="text-sm">
              <span className="font-medium">Sincronização: </span>
              {sync.totalMatchesSynced} partidas · Última verificação:{' '}
              {formatDateTimeBR(sync.lastSyncCheck)}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Resumo por status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pendentes</span>
              <Badge variant="warning">{statusCount(status, 'PENDING')}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Ganhas</span>
              <Badge variant="success">{statusCount(status, 'WON')}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Perdidas</span>
              <Badge variant="danger">{statusCount(status, 'LOST')}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Void</span>
              <Badge variant="secondary">{statusCount(status, 'VOID')}</Badge>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <PerformanceChart data={chartData} />
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Sugestões recentes</CardTitle>
          <Link to="/suggestions" className="text-sm text-primary hover:underline">
            Ver todas
          </Link>
        </CardHeader>
        <CardContent>
          {suggestionsQuery.isLoading ? (
            <LoadingSkeleton count={1} />
          ) : suggestionsQuery.isError ? (
            <ErrorState error={suggestionsQuery.error} onRetry={() => suggestionsQuery.refetch()} />
          ) : (
            <DataTable
              columns={suggestionColumns}
              data={suggestionsQuery.data?.content ?? []}
              emptyTitle="Nenhuma sugestão"
              emptyDescription="Sincronize partidas e aguarde sugestões geradas pelo backend."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

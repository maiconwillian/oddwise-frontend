import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { AlertTriangle, FlaskConical } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { MetricCard } from '@/components/badges/MetricCard';
import { StatusBadge } from '@/components/badges/StatusBadge';
import { DataTable } from '@/components/data-table/DataTable';
import { PerformanceChart } from '@/components/charts/PerformanceChart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { backtestingService } from '@/services/backtestingService';
import { LEAGUE_VALUES, LEAGUES } from '@/types/api';
import type { BacktestBetResult, BacktestResult } from '@/types/backtesting';
import { formatCurrency, formatPercent, valueColorClass } from '@/utils/numbers';
import { formatOdd } from '@/utils/numbers';
import { getApiErrorMessage } from '@/utils/formatters';

const schema = z.object({
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  league: z.enum(LEAGUE_VALUES),
  strategyVersion: z.string().min(1),
  stake: z.coerce.number().gt(0),
  minimumConfidence: z.coerce.number().min(0).max(100),
  simulationMode: z.literal('FIXED_STAKE'),
});

type FormData = z.infer<typeof schema>;

const betColumns: ColumnDef<BacktestBetResult, unknown>[] = [
  {
    header: 'Data',
    accessorKey: 'matchDate',
    cell: ({ row }) => row.original.matchDate?.slice(0, 10) ?? '—',
  },
  { header: 'Mercado', accessorKey: 'market' },
  {
    header: 'Odd',
    accessorKey: 'oddsCaptured',
    cell: ({ row }) => formatOdd(row.original.oddsCaptured),
  },
  {
    header: 'EV',
    accessorKey: 'expectedValue',
    cell: ({ row }) =>
      row.original.expectedValue != null
        ? formatPercent(row.original.expectedValue)
        : '—',
  },
  {
    header: 'Lucro',
    accessorKey: 'profitLoss',
    cell: ({ row }) => (
      <span className={valueColorClass(row.original.profitLoss)}>
        {formatCurrency(row.original.profitLoss)}
      </span>
    ),
  },
  {
    header: 'Resultado',
    accessorKey: 'result',
    cell: ({ row }) => <StatusBadge status={row.original.result} />,
  },
];

export function BacktestingPage() {
  const [result, setResult] = useState<BacktestResult | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      league: 'BRASILEIRAO',
      simulationMode: 'FIXED_STAKE',
    },
  });

  const mutation = useMutation({
    mutationFn: backtestingService.runBacktest,
    onSuccess: (data) => {
      setResult(data);
      toast.success('Backtest concluído');
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const chartData =
    result?.bets.reduce<{ date: string; profit: number; cumulative: number }[]>(
      (acc, bet, i) => {
        const cumulative =
          (acc[i - 1]?.cumulative ?? 0) + (bet.profitLoss ?? 0);
        acc.push({
          date: bet.matchDate?.slice(0, 10) ?? `Bet ${i + 1}`,
          profit: bet.profitLoss ?? 0,
          cumulative,
        });
        return acc;
      },
      [],
    ) ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Backtesting"
        description="Simule estratégias em dados históricos — Over 2.5 Goals"
      />

      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="flex items-start gap-3 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          <p className="text-sm text-muted-foreground">
            Backtesting deve considerar apenas dados disponíveis antes da partida,
            evitando data leakage.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FlaskConical className="h-4 w-4" />
            Configuração da simulação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit((data) => mutation.mutate(data))}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            <div className="space-y-1">
              <Label htmlFor="startDate">Data inicial</Label>
              <Input id="startDate" type="date" {...register('startDate')} />
              {errors.startDate && (
                <p className="text-xs text-rose-400">{errors.startDate.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="endDate">Data final</Label>
              <Input id="endDate" type="date" {...register('endDate')} />
              {errors.endDate && (
                <p className="text-xs text-rose-400">{errors.endDate.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="league">Liga</Label>
              <Select id="league" {...register('league')}>
                {LEAGUES.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="strategyVersion">Versão da estratégia *</Label>
              <Input id="strategyVersion" placeholder="OVER25_V1" {...register('strategyVersion')} />
              {errors.strategyVersion && (
                <p className="text-xs text-rose-400">{errors.strategyVersion.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="stake">Stake fixo (R$)</Label>
              <Input id="stake" type="number" {...register('stake')} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="minimumConfidence">Confiança mínima (%)</Label>
              <Input id="minimumConfidence" type="number" {...register('minimumConfidence')} />
            </div>
            <input type="hidden" {...register('simulationMode')} value="FIXED_STAKE" />
            <div className="sm:col-span-2 lg:col-span-3">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Executando...' : 'Executar backtest'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {result && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            <MetricCard
              title="ROI"
              value={formatPercent(result.roi)}
              valueClassName={valueColorClass(result.roi)}
            />
            <MetricCard title="Lucro" value={formatCurrency(result.profit)} valueClassName={valueColorClass(result.profit)} />
            <MetricCard title="Winrate" value={formatPercent(result.winRate)} />
            <MetricCard
              title="Max Drawdown"
              value={formatCurrency(result.maxDrawdown)}
              valueClassName="text-amber-400"
            />
            <MetricCard title="Profit Factor" value={result.profitFactor.toFixed(2)} />
            <MetricCard title="Odd média" value={formatOdd(result.averageOdd)} />
            <MetricCard
              title="EV médio"
              value={formatPercent(result.averageEV)}
              valueClassName={valueColorClass(result.averageEV)}
            />
            <MetricCard
              title="CLV médio"
              value={formatPercent(result.averageCLV)}
              valueClassName={valueColorClass(result.averageCLV)}
            />
            <MetricCard
              title="Apostas"
              value={String(result.betsPlaced)}
              subtitle={`${result.matchesAnalyzed} partidas analisadas`}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Wins / Losses / Voids</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-6">
              <div>
                <p className="text-2xl font-bold text-emerald-400">{result.wins}</p>
                <p className="text-xs text-muted-foreground">Wins</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-rose-400">{result.losses}</p>
                <p className="text-xs text-muted-foreground">Losses</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-muted-foreground">{result.voids}</p>
                <p className="text-xs text-muted-foreground">Voids</p>
              </div>
            </CardContent>
          </Card>

          <PerformanceChart data={chartData} title="Lucro acumulado (simulação)" />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Apostas simuladas</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={betColumns}
                data={result.bets}
                emptyTitle="Nenhuma aposta na simulação"
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

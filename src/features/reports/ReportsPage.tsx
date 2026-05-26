import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { DateRangeFilter } from '@/components/layout/DateRangeFilter';
import { MetricCard } from '@/components/badges/MetricCard';
import { PerformanceChart } from '@/components/charts/PerformanceChart';
import { LoadingSkeleton } from '@/components/states/LoadingSkeleton';
import { ErrorState } from '@/components/states/ErrorState';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/label';
import { reportService } from '@/services/reportService';
import { statusCount } from '@/types/reports';
import { defaultDateRange } from '@/utils/dates';
import { formatCurrency, formatPercent, valueColorClass } from '@/utils/numbers';

export function ReportsPage() {
  const defaults = defaultDateRange();
  const [from, setFrom] = useState(defaults.from);
  const [to, setTo] = useState(defaults.to);
  const [dailyDate, setDailyDate] = useState(defaults.to);
  const [month, setMonth] = useState(defaults.to.slice(0, 7));

  const roiQuery = useQuery({
    queryKey: ['reports-roi', from, to],
    queryFn: () => reportService.getROIReport(from, to),
  });

  const dailyQuery = useQuery({
    queryKey: ['reports-daily', dailyDate],
    queryFn: () => reportService.getDailyROI(dailyDate),
  });

  const monthlyQuery = useQuery({
    queryKey: ['reports-monthly', month],
    queryFn: () => reportService.getMonthlyROI(month),
  });

  const statusQuery = useQuery({
    queryKey: ['reports-status'],
    queryFn: () => reportService.getStatusSummary(),
  });

  const roi = roiQuery.data;
  const chartData = roi?.dailyData?.map((d) => ({ date: d.date, profit: d.profit })) ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios"
        description="Performance por período, dia e mês — ROI, lucro e winrate"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtro por período</CardTitle>
        </CardHeader>
        <CardContent>
          <DateRangeFilter
            from={from}
            to={to}
            onFromChange={setFrom}
            onToChange={setTo}
          />
        </CardContent>
      </Card>

      {roiQuery.isLoading ? (
        <LoadingSkeleton count={4} />
      ) : roiQuery.isError ? (
        <ErrorState error={roiQuery.error} onRetry={() => roiQuery.refetch()} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="ROI"
              value={formatPercent(roi?.roi)}
              valueClassName={valueColorClass(roi?.roi)}
            />
            <MetricCard
              title="Lucro / Prejuízo"
              value={formatCurrency(roi?.totalProfit)}
              valueClassName={valueColorClass(roi?.totalProfit)}
            />
            <MetricCard title="Total apostado" value={formatCurrency(roi?.totalStake)} />
            <MetricCard
              title="Sugestões"
              value={String(roi?.totalSuggestions ?? 0)}
              subtitle={`Winrate ${formatPercent(roi?.winRate)}`}
            />
          </div>

          <PerformanceChart data={chartData} title="Performance no período" />
        </>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Relatório diário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Data</Label>
              <Input type="date" value={dailyDate} onChange={(e) => setDailyDate(e.target.value)} className="w-auto" />
            </div>
            {dailyQuery.isLoading ? (
              <LoadingSkeleton count={2} />
            ) : dailyQuery.data ? (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">ROI</p>
                  <p className={`font-bold ${valueColorClass(dailyQuery.data.roi)}`}>
                    {formatPercent(dailyQuery.data.roi)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Lucro</p>
                  <p className={`font-bold ${valueColorClass(dailyQuery.data.totalProfit)}`}>
                    {formatCurrency(dailyQuery.data.totalProfit)}
                  </p>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Relatório mensal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Mês</Label>
              <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="w-auto" />
            </div>
            {monthlyQuery.isLoading ? (
              <LoadingSkeleton count={2} />
            ) : monthlyQuery.data ? (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">ROI</p>
                  <p className={`font-bold ${valueColorClass(monthlyQuery.data.roi)}`}>
                    {formatPercent(monthlyQuery.data.roi)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Lucro</p>
                  <p className={`font-bold ${valueColorClass(monthlyQuery.data.totalProfit)}`}>
                    {formatCurrency(monthlyQuery.data.totalProfit)}
                  </p>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {statusQuery.data && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resumo por status</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="text-center">
              <Badge variant="warning" className="mb-1">{statusCount(statusQuery.data, 'PENDING')}</Badge>
              <p className="text-xs text-muted-foreground">Pendentes</p>
            </div>
            <div className="text-center">
              <Badge variant="success" className="mb-1">{statusCount(statusQuery.data, 'WON')}</Badge>
              <p className="text-xs text-muted-foreground">Ganhas</p>
            </div>
            <div className="text-center">
              <Badge variant="danger" className="mb-1">{statusCount(statusQuery.data, 'LOST')}</Badge>
              <p className="text-xs text-muted-foreground">Perdidas</p>
            </div>
            <div className="text-center">
              <Badge variant="secondary" className="mb-1">{statusCount(statusQuery.data, 'VOID')}</Badge>
              <p className="text-xs text-muted-foreground">Void</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

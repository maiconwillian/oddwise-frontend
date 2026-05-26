import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/numbers';
import { formatDateBR, formatTimeBR } from '@/utils/dates';

interface PerformanceChartProps {
  data: { date: string; profit: number; cumulative?: number }[];
  title?: string;
}

export function PerformanceChart({ data, title = 'Performance acumulada' }: PerformanceChartProps) {
  const chartData = data.map((item, index) => {
    const cumulative =
      item.cumulative ??
      data.slice(0, index + 1).reduce((sum, d) => sum + (d.profit ?? 0), 0);
    return { ...item, cumulative, label: formatDateBR(item.date) };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Sem dados para o período selecionado
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [formatCurrency(value), 'Lucro acumulado']}
              />
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke="#34d399"
                fill="url(#profitGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

interface OddsHistoryChartProps {
  data: { capturedAt: string | number[]; oddsValue: number; bookmaker: string }[];
}

export function OddsHistoryChart({ data }: OddsHistoryChartProps) {
  const chartData = data.map((item) => ({
    ...item,
    label: formatTimeBR(item.capturedAt),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Evolução de odds</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhuma odd capturada
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <YAxis domain={['auto', 'auto']} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [value.toFixed(2), 'Odd']}
              />
              <Area
                type="monotone"
                dataKey="oddsValue"
                stroke="#22d3ee"
                fill="#22d3ee20"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

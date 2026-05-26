export function formatCurrency(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatPercent(
  value: number | null | undefined,
  decimals = 1,
): string {
  if (value == null || Number.isNaN(value)) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

export function formatOdd(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—';
  return value.toFixed(2);
}

export function formatNumber(
  value: number | null | undefined,
  decimals = 2,
): string {
  if (value == null || Number.isNaN(value)) return '—';
  return value.toFixed(decimals);
}

export function isPositive(value: number | null | undefined): boolean {
  return value != null && value > 0;
}

export function isNegative(value: number | null | undefined): boolean {
  return value != null && value < 0;
}

export function valueColorClass(value: number | null | undefined): string {
  if (value == null || value === 0) return 'text-muted-foreground';
  return value > 0 ? 'text-emerald-400' : 'text-rose-400';
}

import { format, parseISO, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/** Spring/Jackson pode serializar LocalDateTime como array [y, m, d, h, min, s, nano]. */
type DateInput = string | Date | number[] | null | undefined;

export function toDate(value: DateInput): Date | null {
  if (value == null) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (Array.isArray(value)) {
    const [y, m, d, h = 0, min = 0, s = 0, nano = 0] = value;
    if (typeof y !== 'number' || typeof m !== 'number' || typeof d !== 'number') return null;
    const ms = new Date(y, m - 1, d, h, min, s, Math.floor(nano / 1_000_000));
    return Number.isNaN(ms.getTime()) ? null : ms;
  }
  if (typeof value === 'string') {
    const parsed = parseISO(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

export function formatDateBR(date: DateInput): string {
  const d = toDate(date);
  if (!d) return '—';
  try {
    return format(d, 'dd/MM/yyyy', { locale: ptBR });
  } catch {
    return '—';
  }
}

export function formatDateTimeBR(date: DateInput): string {
  const d = toDate(date);
  if (!d) return '—';
  try {
    return format(d, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  } catch {
    return '—';
  }
}

export function formatTimeBR(date: DateInput): string {
  const d = toDate(date);
  if (!d) return '—';
  try {
    return format(d, 'HH:mm', { locale: ptBR });
  } catch {
    return '—';
  }
}

export function formatMonthBR(month: string): string {
  try {
    const d = parseISO(`${month}-01`);
    return format(d, 'MMMM yyyy', { locale: ptBR });
  } catch {
    return month;
  }
}

export function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function defaultDateRange(): { from: string; to: string } {
  const to = new Date();
  const from = subDays(to, 30);
  return { from: toISODate(from), to: toISODate(to) };
}

export function toInputDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'yyyy-MM-dd');
}

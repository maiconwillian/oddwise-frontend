import { LEAGUES, SUPPORTED_MARKETS, leagueFromApiNameAndCountry, leagueLabel } from '@/types/api';

export function formatLeague(
  league: string | null | undefined,
  country?: string | null,
): string {
  if (!league) return '—';
  const byEnum = LEAGUES.find((l) => l.value === league);
  if (byEnum) return byEnum.label;
  const resolved = leagueFromApiNameAndCountry(league, country);
  if (resolved) return leagueLabel(resolved);
  const unique = LEAGUES.filter((l) => l.apiName === league);
  if (unique.length === 1) return unique[0].label;
  return league.replace(/_/g, ' ');
}

export function formatMarket(market: string | null | undefined): string {
  if (!market) return '—';
  const found = SUPPORTED_MARKETS.find((m) => m.value === market);
  return found?.label ?? market.replace(/_/g, ' ');
}

export function formatStatus(status: string | null | undefined): string {
  if (!status) return '—';
  const map: Record<string, string> = {
    PENDING: 'Pendente',
    WON: 'Ganho',
    LOST: 'Perdido',
    VOID: 'Void',
    CANCELLED: 'Cancelado',
    NS: 'Não iniciada',
    TBD: 'A definir',
    LIVE: 'Ao vivo',
    FT: 'Finalizada',
    HT: 'Intervalo',
    ET: 'Prorrogação',
    PST: 'Adiada',
    CANC: 'Cancelada',
    ABD: 'Abandonada',
    SUSP: 'Suspensa',
    ONE_H: '1º tempo',
    TWO_H: '2º tempo',
    '1H': '1º tempo',
    '2H': '2º tempo',
  };
  return map[status.toUpperCase()] ?? status;
}

export function getApiErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as {
      response?: { data?: { message?: string; error?: string } };
      message?: string;
    };
    return (
      axiosError.response?.data?.message ??
      axiosError.response?.data?.error ??
      axiosError.message ??
      'Erro inesperado'
    );
  }
  if (error instanceof Error) return error.message;
  return 'Erro inesperado';
}

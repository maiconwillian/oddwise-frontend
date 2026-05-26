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

  if (country?.trim()) {
    return `${league} (${country.trim()})`;
  }

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
    WIN: 'Ganho',
    LOSS: 'Perdido',
    NS: 'Não iniciada',
    FT: 'Finalizada',
    LIVE: 'Ao vivo',
    HT: 'Intervalo',
    PST: 'Adiada',
    CANC: 'Cancelada',
  };
  return map[status.toUpperCase()] ?? status;
}

export function formatLeagueEnum(league: string | null | undefined): string {
  if (!league) return '—';
  return leagueLabel(league as never) ?? league;
}

export function getApiErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  if (error instanceof Error) return error.message;
  return 'Erro desconhecido';
}

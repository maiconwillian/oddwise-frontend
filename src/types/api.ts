export type SpringPage<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  numberOfElements?: number;
  first: boolean;
  last: boolean;
  empty?: boolean;
};

/** Alinhado com com.betanalyzer.domain.enums.SupportedLeague */
export const LEAGUE_VALUES = [
  'CHAMPIONS_LEAGUE',
  'PREMIER_LEAGUE',
  'LA_LIGA',
  'BUNDESLIGA',
  'SERIE_A',
  'BRASILEIRAO',
] as const;

export type League = (typeof LEAGUE_VALUES)[number];

export type LeagueOption = {
  value: League;
  label: string;
  apiName: string;
};

/** Aliases de país — espelho de SupportedLeague.matchesCountry no backend */
const LEAGUE_COUNTRY_ALIASES: Record<League, string[]> = {
  CHAMPIONS_LEAGUE: ['world', 'europe', 'eu', 'international'],
  PREMIER_LEAGUE: ['england', 'en', 'uk', 'united kingdom'],
  LA_LIGA: ['spain', 'es'],
  BUNDESLIGA: ['germany', 'de'],
  SERIE_A: ['italy', 'it', 'italia'],
  BRASILEIRAO: ['brazil', 'br', 'brasil'],
};

export const LEAGUES: LeagueOption[] = [
  { value: 'CHAMPIONS_LEAGUE', label: 'Champions League', apiName: 'UEFA Champions League' },
  { value: 'PREMIER_LEAGUE', label: 'Premier League (Inglaterra)', apiName: 'Premier League' },
  { value: 'LA_LIGA', label: 'La Liga', apiName: 'La Liga' },
  { value: 'BUNDESLIGA', label: 'Bundesliga', apiName: 'Bundesliga' },
  { value: 'SERIE_A', label: 'Serie A (Itália)', apiName: 'Serie A' },
  { value: 'BRASILEIRAO', label: 'Brasileirão', apiName: 'Serie A' },
];

export type SupportedMarket = 'OVER_2_5' | 'BTTS';

export const SUPPORTED_MARKETS: { value: SupportedMarket; label: string }[] = [
  { value: 'OVER_2_5', label: 'Over 2.5 Goals' },
  { value: 'BTTS', label: 'Both Teams To Score' },
];

export const DEFAULT_MARKET: SupportedMarket = 'OVER_2_5';

export const MATCH_STATUSES = [
  { value: 'NS', label: 'Não iniciada' },
  { value: 'LIVE', label: 'Ao vivo' },
  { value: 'FT', label: 'Finalizada' },
  { value: 'HT', label: 'Intervalo' },
  { value: 'PST', label: 'Adiada' },
  { value: 'CANC', label: 'Cancelada' },
] as const;

export function leagueApiName(value: League): string {
  return LEAGUES.find((l) => l.value === value)?.apiName ?? value;
}

export function leagueLabel(value: League): string {
  return LEAGUES.find((l) => l.value === value)?.label ?? value;
}

const LEAGUE_CANONICAL_COUNTRY: Record<League, string> = {
  CHAMPIONS_LEAGUE: 'World',
  PREMIER_LEAGUE: 'England',
  LA_LIGA: 'Spain',
  BUNDESLIGA: 'Germany',
  SERIE_A: 'Italy',
  BRASILEIRAO: 'Brazil',
};

/** Verifica se o país da API corresponde à liga suportada (espelho de SupportedLeague.matchesCountry). */
export function matchesLeagueCountry(league: League, country?: string | null): boolean {
  const normalized = country?.trim();
  if (!normalized) return false;

  if (normalized.localeCompare(LEAGUE_CANONICAL_COUNTRY[league], undefined, { sensitivity: 'accent' }) === 0) {
    return true;
  }

  return LEAGUE_COUNTRY_ALIASES[league].some(
    (alias) => alias.localeCompare(normalized, undefined, { sensitivity: 'accent' }) === 0,
  );
}

/**
 * Resolve enum de liga apenas quando nome da API e país batem com SupportedLeague.
 * Homônimos (ex.: Premier League Egito) retornam undefined.
 */
export function leagueFromApiNameAndCountry(
  apiName: string,
  country?: string | null,
): League | undefined {
  const trimmedName = apiName.trim();

  for (const option of LEAGUES) {
    if (option.apiName !== trimmedName) continue;
    if (matchesLeagueCountry(option.value, country)) {
      return option.value;
    }
  }

  return undefined;
}

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



export const LEAGUES: LeagueOption[] = [

  { value: 'CHAMPIONS_LEAGUE', label: 'Champions League', apiName: 'UEFA Champions League' },

  { value: 'PREMIER_LEAGUE', label: 'Premier League', apiName: 'Premier League' },

  { value: 'LA_LIGA', label: 'La Liga', apiName: 'La Liga' },

  { value: 'BUNDESLIGA', label: 'Bundesliga', apiName: 'Bundesliga' },

  { value: 'SERIE_A', label: 'Serie A (Itália)', apiName: 'Serie A' },

  { value: 'BRASILEIRAO', label: 'Brasileirão', apiName: 'Serie A' },

];



/** Alinhado com com.betanalyzer.domain.enums.SupportedMarket */

export type SupportedMarket = 'OVER_2_5' | 'BTTS';



export const SUPPORTED_MARKETS: { value: SupportedMarket; label: string }[] = [

  { value: 'OVER_2_5', label: 'Over 2.5 Goals' },

  { value: 'BTTS', label: 'Both Teams To Score' },

];



export const DEFAULT_MARKET: SupportedMarket = 'OVER_2_5';



/** Alinhado com com.betanalyzer.domain.enums.MatchStatus */

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



export function leagueFromApiNameAndCountry(apiName: string, country?: string | null): League | undefined {
  const normalizedCountry = country?.trim().toLowerCase() ?? '';

  if (apiName === 'Serie A') {
    if (normalizedCountry.includes('ital')) return 'SERIE_A';
    if (normalizedCountry.includes('brazil') || normalizedCountry === 'br') return 'BRASILEIRAO';
    return undefined;
  }

  const matches = LEAGUES.filter((l) => l.apiName === apiName);
  if (matches.length === 1) return matches[0].value;
  return undefined;
}



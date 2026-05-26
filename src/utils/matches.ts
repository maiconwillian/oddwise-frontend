import { leagueFromApiNameAndCountry, type League } from '@/types/api';
import type { Match } from '@/types/match';

/** Partidas em andamento (API Football usa LIVE, 1H/ONE_H, HT, 2H/TWO_H, etc.). */
export const IN_PLAY_MATCH_STATUSES = [
  'LIVE',
  'HT',
  'ONE_H',
  'TWO_H',
  'ET',
  '1H',
  '2H',
] as const;

/** Partidas em que ainda dá para sugerir aposta (não finalizadas/canceladas). */
export const SUGGESTABLE_MATCH_STATUSES = [
  'NS',
  'TBD',
  ...IN_PLAY_MATCH_STATUSES,
] as const;

export function matchesStatusFilter(matchStatus: string, filterStatus: string): boolean {
  if (!filterStatus) return true;
  if (filterStatus === 'LIVE') {
    return (IN_PLAY_MATCH_STATUSES as readonly string[]).includes(matchStatus);
  }
  return matchStatus === filterStatus;
}

export function isSupportedLeagueMatch(match: Match): boolean {
  return leagueFromApiNameAndCountry(match.leagueName, match.leagueCountry) != null;
}

export function isSuggestableMatch(match: Match): boolean {
  return (SUGGESTABLE_MATCH_STATUSES as readonly string[]).includes(match.status);
}

/** Mesma regra da sugestão: pré-jogo ou ao vivo (não FT/CANC/etc.). */
export function canCaptureOdds(match: Pick<Match, 'status'>): boolean {
  return (SUGGESTABLE_MATCH_STATUSES as readonly string[]).includes(match.status);
}

export const ODDS_CAPTURE_DISABLED_TOOLTIP =
  'Só é possível capturar odds de jogos não finalizados (pré-jogo ou ao vivo).';

export function leagueFromMatch(match: Pick<Match, 'leagueName' | 'leagueCountry'>): League | undefined {
  return leagueFromApiNameAndCountry(match.leagueName, match.leagueCountry);
}

export function filterSupportedLeagueMatches(matches: Match[]): Match[] {
  return matches.filter(isSupportedLeagueMatch);
}

export function filterSuggestableMatches(matches: Match[]): Match[] {
  return matches.filter(isSuggestableMatch);
}

export function sortMatchesByDate(matches: Match[]): Match[] {
  return [...matches].sort(
    (a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime(),
  );
}

export type MatchInsightSignalTier = 'EV_PLUS' | 'NEAR' | 'WEAK' | 'NO_STATS';

export type MatchInsightRow = {
  matchId: string;
  homeTeamName: string;
  awayTeamName: string;
  leagueName: string;
  leagueCountry?: string | null;
  matchDate: string;
  status: string;
  statsReady: boolean;
  hasOdds: boolean;
  confidence: number;
  expectedValue: number | null;
  referenceOdd: number | null;
  bookmaker: string | null;
  passesEvFilters: boolean;
  signalTier: MatchInsightSignalTier;
};

export type MatchInsightsParams = {
  date: string;
  league?: string;
};

export type MatchInsightsResponse = {
  date: string;
  insights: MatchInsightRow[];
  minConfidence: number;
  minEv: number;
  matchesConsidered: number;
};

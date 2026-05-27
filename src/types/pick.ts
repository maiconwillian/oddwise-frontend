export type MarketRecommendation = {
  market: string;
  probability: number;
  ev: number | null;
  odd: number | null;
  bookmaker: string | null;
  confidence: number;
  eligibleForAutoOpportunity: boolean;
};

export type BestPick = {
  market: string;
  reason: string;
  eligibleForAutoOpportunity: boolean;
};

export type MatchPick = {
  matchId: string;
  homeTeamName: string;
  awayTeamName: string;
  leagueName: string;
  leagueCountry?: string | null;
  matchDate: string;
  status: string;
  recommendations: MarketRecommendation[];
  bestPick: BestPick | null;
  pickScore: number;
  rank: number | null;
};

export type RoundPicksResponse = {
  date: string;
  topPick: MatchPick | null;
  rankedPicks: MatchPick[];
  matchesConsidered: number;
  actionablePicks: number;
  minConfidence: number;
  minEv: number;
  hint: string | null;
};

export type RoundPicksParams = {
  date: string;
  league?: string;
};

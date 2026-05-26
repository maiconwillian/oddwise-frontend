export type ValueBetOpportunity = {
  matchId: string;
  homeTeamName: string;
  awayTeamName: string;
  leagueName: string;
  leagueCountry?: string | null;
  market: string;
  bookmaker: string;
  odd: number;
  modelProbability: number;
  confidence: number;
  expectedValue: number;
  kellyFraction: number;
  suggestedStake: number;
  strategyName: string;
  reasoning: string;
  matchDate: string;
};

export type ValueBetParams = {
  date: string;
  league?: string;
};

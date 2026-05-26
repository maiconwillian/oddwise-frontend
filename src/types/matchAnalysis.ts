export type MatchStatsAnalysis = {
  matchId: string;
  homeTeamForm: string | null;
  awayTeamForm: string | null;
  homeTeamGoalsAvg: number | null;
  awayTeamGoalsAvg: number | null;
  homeTeamGoalsConcededAvg: number | null;
  awayTeamGoalsConcededAvg: number | null;
  homeOver25Rate: number | null;
  awayOver25Rate: number | null;
  homeLeaguePosition: number | null;
  awayLeaguePosition: number | null;
  headToHead: string | null;
  lastUpdate: string | null;
  statsEnriched: boolean;
};

export type ModelInsight = {
  strategyName: string;
  market: string;
  confidence: number | null;
  expectedValue: number | null;
  suggestedOdd: number | null;
  bookmaker: string | null;
  reasoning: string | null;
  wouldPassValueBetFilters: boolean;
};

export type MatchAnalysis = {
  matchId: string;
  homeTeamName: string;
  awayTeamName: string;
  stats: MatchStatsAnalysis | null;
  modelInsight: ModelInsight | null;
  statsEnriched: boolean;
};

export type EnrichResult = {
  date?: string | null;
  matchesProcessed: number;
  enriched: number;
  failed: number;
  errors: string[];
  message: string | null;
};

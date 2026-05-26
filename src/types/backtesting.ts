import type { League } from './api';

export type BacktestRequest = {
  startDate: string;
  endDate: string;
  league: League;
  strategyVersion: string;
  stake: number;
  minimumConfidence: number;
  simulationMode: 'FIXED_STAKE';
};

export type BacktestBetResult = {
  matchId: string;
  strategyVersion: string;
  market: string;
  oddsCaptured: number;
  closingOdd: number;
  clv: number;
  stake: number;
  confidenceScore: number;
  expectedValue: number;
  result: string;
  profitLoss: number;
  matchDate: string;
  score: string;
  features: Record<string, unknown>;
  reasoning: string;
};

export type BacktestResult = {
  strategyVersion: string;
  matchesAnalyzed: number;
  betsPlaced: number;
  wins: number;
  losses: number;
  voids: number;
  winRate: number;
  roi: number;
  profit: number;
  maxDrawdown: number;
  averageOdd: number;
  averageEV: number;
  averageCLV: number;
  profitFactor: number;
  bets: BacktestBetResult[];
  lowSample?: boolean;
  minSampleBets?: number;
};

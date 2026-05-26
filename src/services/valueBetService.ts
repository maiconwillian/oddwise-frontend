import { api } from './api';
import type { MatchInsightsParams, MatchInsightsResponse } from '@/types/matchInsight';
import type {
  ValueBetOpportunity,
  ValueBetParams,
  ValueBetsScanResponse,
} from '@/types/valueBet';

export const valueBetService = {
  getValueBets(params: ValueBetParams) {
    return api
      .get<ValueBetsScanResponse>('/api/analysis/value-bets', { params })
      .then((r) => r.data);
  },

  getValueBetForMatch(matchId: string) {
    return api
      .get<ValueBetOpportunity>(`/api/analysis/value-bets/match/${matchId}`)
      .then((r) => r.data);
  },

  getMatchInsights(params: MatchInsightsParams) {
    return api
      .get<MatchInsightsResponse>('/api/analysis/match-insights', { params })
      .then((r) => r.data);
  },
};

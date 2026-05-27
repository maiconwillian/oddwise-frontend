import { api } from './api';
import type { MatchPick, RoundPicksParams, RoundPicksResponse } from '@/types/pick';

export const pickService = {
  getRoundPicks(params: RoundPicksParams) {
    return api
      .get<RoundPicksResponse>('/api/analysis/round-picks', { params })
      .then((r) => r.data);
  },

  getMatchPicks(matchId: string) {
    return api.get<MatchPick>(`/api/analysis/match/${matchId}/picks`).then((r) => r.data);
  },
};

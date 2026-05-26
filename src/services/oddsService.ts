import { api } from './api';
import type { CLVResponse, Odds, OddsPayload } from '@/types/odds';

export const oddsService = {
  captureOdds(matchId: string) {
    return api.post<Odds[]>(`/api/odds/capture/${matchId}`).then((r) => r.data);
  },

  getOddsHistory(matchId: string) {
    return api.get<Odds[]>(`/api/odds/history/${matchId}`).then((r) => r.data);
  },

  calculateCLV(matchId: string, pickedOddId: string, finalOddId: string) {
    return api
      .get<CLVResponse>(`/api/odds/${matchId}/clv`, {
        params: { pickedOddId, finalOddId },
      })
      .then((r) => r.data);
  },

  getOddsByMatch(matchId: string) {
    return api.get<Odds[]>(`/api/odds/match/${matchId}`).then((r) => r.data);
  },

  getLatestOddsByMatch(matchId: string) {
    return api
      .get<Odds>(`/api/odds/match/${matchId}/latest`)
      .then((r) => r.data);
  },

  getOddsByBookmaker(bookmaker: string) {
    return api
      .get<Odds[]>(`/api/odds/bookmaker/${bookmaker}`)
      .then((r) => r.data);
  },

  saveOdds(payload: OddsPayload) {
    return api.post<Odds>('/api/odds', payload).then((r) => r.data);
  },
};

import { api } from './api';
import type { League, SpringPage } from '@/types/api';
import type { Match, MatchParams, MatchPayload } from '@/types/match';

export const matchService = {
  getMatches(params?: MatchParams) {
    return api.get<SpringPage<Match>>('/api/matches', { params }).then((r) => r.data);
  },

  getMatchById(id: string) {
    return api.get<Match>(`/api/matches/${id}`).then((r) => r.data);
  },

  getMatchesByDate(date: string) {
    return api.get<Match[]>(`/api/matches/date/${date}`).then((r) => r.data);
  },

  getMatchesByLeague(league: League) {
    return api.get<Match[]>(`/api/matches/supported-league/${league}`).then((r) => r.data);
  },

  createMatch(payload: MatchPayload) {
    return api.post<Match>('/api/matches', payload).then((r) => r.data);
  },

  updateMatch(id: string, payload: Partial<MatchPayload>) {
    return api.put<Match>(`/api/matches/${id}`, payload).then((r) => r.data);
  },

  deleteMatch(id: string) {
    return api.delete(`/api/matches/${id}`).then((r) => r.data);
  },
};

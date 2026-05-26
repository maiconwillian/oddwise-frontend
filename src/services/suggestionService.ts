import { api } from './api';
import type { SpringPage } from '@/types/api';
import type { SettlePendingResult } from '@/types/settlement';
import type {
  Suggestion,
  SuggestionParams,
  SuggestionPayload,
  SuggestionResultPayload,
} from '@/types/suggestion';

export const suggestionService = {
  getSuggestions(params?: SuggestionParams) {
    return api
      .get<SpringPage<Suggestion>>('/api/suggestions', { params })
      .then((r) => r.data);
  },

  getSuggestionById(id: string) {
    return api.get<Suggestion>(`/api/suggestions/${id}`).then((r) => r.data);
  },

  createSuggestion(payload: SuggestionPayload) {
    return api.post<Suggestion>('/api/suggestions', payload).then((r) => r.data);
  },

  updateSuggestionResult(id: string, payload: SuggestionResultPayload) {
    return api
      .put<Suggestion>(`/api/suggestions/${id}/result`, payload)
      .then((r) => r.data);
  },

  getSuggestionsByMatch(matchId: string) {
    return api
      .get<Suggestion[]>(`/api/suggestions/match/${matchId}`)
      .then((r) => r.data);
  },

  settlePending() {
    return api
      .post<SettlePendingResult>('/api/suggestions/settle-pending')
      .then((r) => r.data);
  },
};

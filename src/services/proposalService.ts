import { api } from './api';
import type {
  AcceptProposalPayload,
  GenerateWeeklyResult,
  Proposal,
  ProposedParams,
} from '@/types/proposal';
import type { Suggestion } from '@/types/suggestion';

export const proposalService = {
  getProposed(params?: ProposedParams) {
    return api
      .get<Proposal[]>('/api/suggestions/proposed', { params })
      .then((r) => r.data);
  },

  generateWeekly(from?: string, to?: string) {
    return api
      .post<GenerateWeeklyResult>('/api/suggestions/generate-weekly', null, {
        params: { from, to },
      })
      .then((r) => r.data);
  },

  acceptProposal(id: string, payload?: AcceptProposalPayload) {
    return api
      .post<Suggestion>(`/api/suggestions/proposed/${id}/accept`, payload ?? {})
      .then((r) => r.data);
  },

  rejectProposal(id: string) {
    return api
      .post<Suggestion>(`/api/suggestions/proposed/${id}/reject`)
      .then((r) => r.data);
  },
};

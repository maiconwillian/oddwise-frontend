import { api } from './api';
import type { ValueBetOpportunity, ValueBetParams } from '@/types/valueBet';

export const valueBetService = {
  getValueBets(params: ValueBetParams) {
    return api
      .get<ValueBetOpportunity[]>('/api/analysis/value-bets', { params })
      .then((r) => r.data);
  },
};

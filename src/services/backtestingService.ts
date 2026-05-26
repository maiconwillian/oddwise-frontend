import { api } from './api';
import type { BacktestRequest, BacktestResult } from '@/types/backtesting';

export const backtestingService = {
  runBacktest(payload: BacktestRequest) {
    return api
      .post<BacktestResult>('/api/backtesting/run', payload)
      .then((r) => r.data);
  },
};

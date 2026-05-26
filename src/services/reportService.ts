import { api } from './api';
import type { ROIReport, StatusSummary } from '@/types/reports';

export const reportService = {
  getROIReport(from: string, to: string) {
    return api
      .get<ROIReport>('/api/reports/roi', { params: { from, to } })
      .then((r) => r.data);
  },

  getDailyROI(date: string) {
    return api
      .get<ROIReport>('/api/reports/roi/daily', { params: { date } })
      .then((r) => r.data);
  },

  getMonthlyROI(month: string) {
    return api
      .get<ROIReport>('/api/reports/roi/monthly', { params: { month } })
      .then((r) => r.data);
  },

  getStatusSummary() {
    return api.get<StatusSummary>('/api/reports/status-summary').then((r) => r.data);
  },
};

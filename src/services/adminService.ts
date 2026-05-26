import { api } from './api';
import type { SyncResult, SyncStatus } from '@/types/admin';
import type { EnrichResult } from '@/types/matchAnalysis';

export const adminService = {
  syncFixtures(date: string) {
    return api
      .post<SyncResult>('/api/admin/sync/fixtures', null, { params: { date } })
      .then((r) => r.data);
  },

  syncFixturesRange(from: string, to: string) {
    return api
      .post<SyncResult>('/api/admin/sync/fixtures/range', null, {
        params: { from, to },
      })
      .then((r) => r.data);
  },

  getSyncStatus() {
    return api.get<SyncStatus>('/api/admin/sync/status').then((r) => r.data);
  },

  enrichFixtures(date: string) {
    return api
      .post<EnrichResult>('/api/admin/enrich/fixtures', null, { params: { date } })
      .then((r) => r.data);
  },

  enrichFixturesRange(from: string, to: string) {
    return api
      .post<EnrichResult>('/api/admin/enrich/fixtures/range', null, {
        params: { from, to },
      })
      .then((r) => r.data);
  },
};

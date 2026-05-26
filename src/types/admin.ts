export type SyncStatus = {
  totalMatchesSynced: number;
  lastSyncCheck: string;
};

export type SyncResult = {
  totalProcessed?: number;
  created?: number;
  updated?: number;
  skipped?: number;
  skippedSettlement?: number;
  settled?: number;
  won?: number;
  lost?: number;
  voided?: number;
  errors?: string[];
  message?: string;
};

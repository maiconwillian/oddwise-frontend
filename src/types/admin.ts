export type SyncStatus = {
  totalMatchesSynced: number;
  lastSyncCheck: string;
};

export type SyncResult = {
  totalProcessed?: number;
  created?: number;
  updated?: number;
  skipped?: number;
  errors?: string[];
  message?: string;
};

export type SettlePendingResult = {
  settled: number;
  won: number;
  lost: number;
  voided: number;
  skipped: number;
  errors?: string[];
};

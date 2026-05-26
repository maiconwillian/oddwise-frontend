export type ROIReport = {
  from: string;
  to: string;
  totalStake: number;
  totalProfit: number;
  roi: number;
  winRate: number;
  totalSuggestions: number;
  wins: number;
  losses: number;
  voids: number;
  dailyData?: DailyROIData[];
};

export type DailyROIData = {
  date: string;
  profit: number;
  roi: number;
  stake: number;
  suggestions: number;
};

/** Map<SuggestionStatus, Long> serializado pelo Spring */
export type StatusSummary = {
  PENDING?: number;
  WON?: number;
  LOST?: number;
  VOID?: number;
};

export function statusCount(summary: StatusSummary | undefined, key: keyof StatusSummary): number {
  return summary?.[key] ?? 0;
}

export function totalSuggestions(summary: StatusSummary | undefined): number {
  return (
    statusCount(summary, 'PENDING') +
    statusCount(summary, 'WON') +
    statusCount(summary, 'LOST') +
    statusCount(summary, 'VOID')
  );
}

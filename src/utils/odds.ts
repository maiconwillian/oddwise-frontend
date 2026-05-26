import type { SupportedMarket } from '@/types/api';
import type { Odds } from '@/types/odds';
import { toDate } from '@/utils/dates';

const MARKET_KEYS: Record<SupportedMarket, string[]> = {
  OVER_2_5: ['TOTALS_OVER_2_5'],
  BTTS: ['BTTS_YES', 'BTTS'],
};

export function filterOddsByMarket(odds: Odds[], market: string): Odds[] {
  const keys = MARKET_KEYS[market as SupportedMarket];
  if (!keys) return odds;
  return odds.filter((o) => keys.some((k) => o.market === k || o.market.includes(k)));
}

/** Uma linha por bookmaker — fica a captura mais recente. */
export function latestOddPerBookmaker(odds: Odds[]): Odds[] {
  const byBookmaker = new Map<string, Odds>();

  for (const odd of odds) {
    const existing = byBookmaker.get(odd.bookmaker);
    if (!existing) {
      byBookmaker.set(odd.bookmaker, odd);
      continue;
    }
    const existingDate = toDate(existing.capturedAt)?.getTime() ?? 0;
    const oddDate = toDate(odd.capturedAt)?.getTime() ?? 0;
    if (oddDate >= existingDate) {
      byBookmaker.set(odd.bookmaker, odd);
    }
  }

  return Array.from(byBookmaker.values()).sort((a, b) => a.bookmaker.localeCompare(b.bookmaker));
}

export function sortOddsByValue(odds: Odds[]): Odds[] {
  return [...odds].sort((a, b) => b.oddsValue - a.oddsValue);
}

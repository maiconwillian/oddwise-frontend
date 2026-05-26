export type Odds = {
  id: string;
  matchId: string;
  bookmaker: string;
  bookmakerKey: string;
  market: string;
  oddsValue: number;
  /** ISO string ou array Jackson [y, m, d, h, min, s, nano] */
  capturedAt: string | number[];
  createdAt: string | number[] | null;
};

export type CLVResponse = {
  matchId: string;
  pickedOdd: number;
  finalOdd: number;
  clv: number;
  result: string;
};

export type OddsPayload = {
  matchId: string;
  bookmaker: string;
  bookmakerKey?: string;
  market: string;
  oddsValue: number;
};

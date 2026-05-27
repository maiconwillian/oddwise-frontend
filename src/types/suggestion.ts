export type SuggestionStatus = 'PROPOSED' | 'REJECTED' | 'PENDING' | 'WON' | 'LOST' | 'VOID';

export type Suggestion = {
  id: string;
  matchId: string;
  homeTeamName?: string;
  awayTeamName?: string;
  leagueName?: string;
  market: string;
  pickedOdd: number;
  pickedBookmaker: string;
  confidence: number;
  expectedValue: number;
  stake: number;
  status: SuggestionStatus;
  roi: number | null;
  proposalReason?: string | null;
};

export type SuggestionParams = {
  page?: number;
  size?: number;
  status?: string;
  date?: string;
};

export type SuggestionPayload = {
  matchId: string;
  market: string;
  pickedOdd: number;
  pickedBookmaker: string;
  confidence: number;
  expectedValue: number;
  stake: number;
};

export type SuggestionResultPayload = {
  actualResult: SuggestionStatus;
};

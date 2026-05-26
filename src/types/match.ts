export type Match = {
  id: string;
  apiId: number | null;
  homeTeamName: string;
  awayTeamName: string;
  homeGoals: number | null;
  awayGoals: number | null;
  matchDate: string;
  leagueName: string;
  leagueCountry?: string | null;
  status: string;
};

export type MatchParams = {
  page?: number;
  size?: number;
};

export type MatchPayload = Omit<Match, 'id'>;

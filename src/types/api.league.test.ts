import { describe, expect, it } from 'vitest';
import { leagueFromApiNameAndCountry } from './api';

describe('leagueFromApiNameAndCountry', () => {
  it('maps Premier League England to PREMIER_LEAGUE', () => {
    expect(leagueFromApiNameAndCountry('Premier League', 'England')).toBe('PREMIER_LEAGUE');
    expect(leagueFromApiNameAndCountry('Premier League', 'UK')).toBe('PREMIER_LEAGUE');
  });

  it('rejects Premier League Egypt homonym', () => {
    expect(leagueFromApiNameAndCountry('Premier League', 'Egypt')).toBeUndefined();
  });

  it('distinguishes Serie A Italy vs Brazil', () => {
    expect(leagueFromApiNameAndCountry('Serie A', 'Italy')).toBe('SERIE_A');
    expect(leagueFromApiNameAndCountry('Serie A', 'Brazil')).toBe('BRASILEIRAO');
  });
});

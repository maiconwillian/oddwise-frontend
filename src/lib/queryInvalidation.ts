import type { QueryClient } from '@tanstack/react-query';

/** Invalida server state afetado por sync ou liquidação de sugestões. */
export function invalidateOperationalQueries(queryClient: QueryClient) {
  const keys = [
    'sync-status',
    'matches',
    'match',
    'suggestions',
    'suggestions-match',
    'status-summary',
    'roi',
    'reports-status',
    'reports-roi',
    'reports-daily',
    'reports-monthly',
    'value-bets',
  ] as const;

  for (const key of keys) {
    queryClient.invalidateQueries({ queryKey: [key] });
  }
}

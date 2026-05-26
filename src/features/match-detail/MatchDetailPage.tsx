import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { LeagueBadge } from '@/components/badges/LeagueBadge';
import { StatusBadge } from '@/components/badges/StatusBadge';
import { EvBadge } from '@/components/badges/RoiBadge';
import { OddsHistoryChart } from '@/components/charts/PerformanceChart';
import { ErrorState } from '@/components/states/ErrorState';
import { TableSkeleton } from '@/components/states/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { matchService } from '@/services/matchService';
import { oddsService } from '@/services/oddsService';
import { suggestionService } from '@/services/suggestionService';
import { formatDateTimeBR } from '@/utils/dates';
import { formatCurrency, formatOdd } from '@/utils/numbers';
import { MatchAnalysisCard } from '@/features/match-detail/MatchAnalysisCard';
import { getApiErrorMessage, formatMarket } from '@/utils/formatters';
import { canCaptureOdds, ODDS_CAPTURE_DISABLED_TOOLTIP } from '@/utils/matches';

export function MatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const matchQuery = useQuery({
    queryKey: ['match', id],
    queryFn: () => matchService.getMatchById(id!),
    enabled: !!id,
  });

  const oddsQuery = useQuery({
    queryKey: ['odds-match', id],
    queryFn: () => oddsService.getOddsByMatch(id!),
    enabled: !!id,
  });

  const oddsHistoryQuery = useQuery({
    queryKey: ['odds-history', id],
    queryFn: () => oddsService.getOddsHistory(id!),
    enabled: !!id,
  });

  const suggestionsQuery = useQuery({
    queryKey: ['suggestions-match', id],
    queryFn: () => suggestionService.getSuggestionsByMatch(id!),
    enabled: !!id,
  });

  const captureMutation = useMutation({
    mutationFn: () => oddsService.captureOdds(id!),
    onSuccess: (data) => {
      if (data.length === 0) {
        toast.warning('Nenhuma odd encontrada para esta partida.');
      } else {
        toast.success(`${data.length} odds capturadas`);
      }
      queryClient.invalidateQueries({ queryKey: ['odds-match', id] });
      queryClient.invalidateQueries({ queryKey: ['odds-history', id] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  if (matchQuery.isLoading) return <TableSkeleton rows={3} />;
  if (matchQuery.isError) {
    return <ErrorState error={matchQuery.error} onRetry={() => matchQuery.refetch()} />;
  }

  const match = matchQuery.data!;
  const oddsList = oddsQuery.data ?? [];
  const oddsCaptureAllowed = canCaptureOdds(match);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${match.homeTeamName} vs ${match.awayTeamName}`}
        description="Detalhes da partida, odds e sugestões vinculadas"
        actions={
          <Button
            onClick={() => captureMutation.mutate()}
            disabled={captureMutation.isPending || !oddsCaptureAllowed}
            title={oddsCaptureAllowed ? undefined : ODDS_CAPTURE_DISABLED_TOOLTIP}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${captureMutation.isPending ? 'animate-spin' : ''}`} />
            Capturar odds
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Liga</CardTitle>
          </CardHeader>
          <CardContent>
            <LeagueBadge league={match.leagueName} country={match.leagueCountry} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Data</CardTitle>
          </CardHeader>
          <CardContent>{formatDateTimeBR(match.matchDate)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBadge status={match.status} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Placar</CardTitle>
          </CardHeader>
          <CardContent className="text-xl font-bold tabular-nums">
            {match.homeGoals != null && match.awayGoals != null
              ? `${match.homeGoals} × ${match.awayGoals}`
              : '—'}
          </CardContent>
        </Card>
      </div>

      <MatchAnalysisCard
        matchId={match.id}
        homeTeamName={match.homeTeamName}
        awayTeamName={match.awayTeamName}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Odds capturadas {oddsList.length > 0 && `(${oddsList.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {oddsQuery.isLoading ? (
              <TableSkeleton rows={3} />
            ) : oddsQuery.isError ? (
              <ErrorState error={oddsQuery.error} onRetry={() => oddsQuery.refetch()} />
            ) : oddsList.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma odd capturada ainda.</p>
            ) : (
              <div className="max-h-80 space-y-2 overflow-y-auto">
                {oddsList.map((odd) => (
                  <div
                    key={odd.id}
                    className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                  >
                    <div>
                      <p className="font-medium">{odd.bookmaker}</p>
                      <p className="text-xs text-muted-foreground">{odd.market}</p>
                    </div>
                    <span className="font-mono text-lg font-bold">{formatOdd(odd.oddsValue)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <OddsHistoryChart data={oddsHistoryQuery.data ?? []} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Sugestões vinculadas</CardTitle>
          <Link to={`/suggestions/new?matchId=${match.id}`} className="text-sm text-primary hover:underline">
            Nova sugestão
          </Link>
        </CardHeader>
        <CardContent>
          {suggestionsQuery.isLoading ? (
            <TableSkeleton rows={2} />
          ) : (suggestionsQuery.data?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma sugestão para esta partida.</p>
          ) : (
            <div className="space-y-2">
              {suggestionsQuery.data?.map((s) => (
                <div
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border px-3 py-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm">{formatMarket(s.market)}</span>
                    <EvBadge ev={s.expectedValue} />
                    <StatusBadge status={s.status} />
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span>Odd {formatOdd(s.pickedOdd)}</span>
                    <span>Stake {formatCurrency(s.stake)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

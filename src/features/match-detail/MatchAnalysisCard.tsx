import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Brain, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { EvBadge } from '@/components/badges/RoiBadge';
import { ErrorState } from '@/components/states/ErrorState';
import { TableSkeleton } from '@/components/states/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { matchService } from '@/services/matchService';
import { formatDateTimeBR } from '@/utils/dates';
import { getApiErrorMessage } from '@/utils/formatters';
import { formatOdd } from '@/utils/numbers';

function formatAvg(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return '—';
  return value.toFixed(2);
}

function formatRate(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return '—';
  return `${value.toFixed(0)}%`;
}

/** Forma da API pode vir longa; exibimos os últimos 5 resultados. */
function formatForm(form: string | null | undefined) {
  if (!form || form === 'TBD' || form === 'N/A') return '—';
  const trimmed = form.trim();
  return trimmed.length > 5 ? trimmed.slice(-5) : trimmed;
}

function formatModelEv(expectedValue: number | null | undefined) {
  if (expectedValue == null || expectedValue < 0) return null;
  return expectedValue * 100;
}

type Props = {
  matchId: string;
  homeTeamName: string;
  awayTeamName: string;
};

export function MatchAnalysisCard({ matchId, homeTeamName, awayTeamName }: Props) {
  const queryClient = useQueryClient();

  const analysisQuery = useQuery({
    queryKey: ['match-analysis', matchId],
    queryFn: () => matchService.getMatchAnalysis(matchId),
  });

  const enrichMutation = useMutation({
    mutationFn: () => matchService.enrichMatch(matchId),
    onSuccess: (data) => {
      if (data.enriched > 0) {
        toast.success(data.message ?? 'Análise atualizada');
      } else {
        toast.warning(data.message ?? 'Não foi possível enriquecer a partida');
      }
      queryClient.invalidateQueries({ queryKey: ['match-analysis', matchId] });
      queryClient.invalidateQueries({ queryKey: ['value-bets'] });
      queryClient.invalidateQueries({ queryKey: ['match-insights'] });
      queryClient.invalidateQueries({ queryKey: ['value-bet-match', matchId] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const analysis = analysisQuery.data;
  const stats = analysis?.stats;
  const insight = analysis?.modelInsight;
  const enriched = analysis?.statsEnriched ?? stats?.statsEnriched ?? false;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Brain className="h-4 w-4" />
          Análise da partida
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => enrichMutation.mutate()}
          disabled={enrichMutation.isPending}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${enrichMutation.isPending ? 'animate-spin' : ''}`}
          />
          Atualizar análise
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {analysisQuery.isLoading ? (
          <TableSkeleton rows={2} />
        ) : analysisQuery.isError ? (
          <ErrorState error={analysisQuery.error} onRetry={() => analysisQuery.refetch()} />
        ) : !enriched ? (
          <p className="text-sm text-muted-foreground">
            Dados de forma e médias ainda não carregados. Após o sync, use{' '}
            <strong className="text-foreground">Atualizar análise</strong> ou, no Admin,{' '}
            <strong className="text-foreground">Enriquecer análise desta data</strong>.
          </p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-md border border-border p-3">
                <p className="text-xs font-medium text-muted-foreground">Casa — {homeTeamName}</p>
                <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
                  <dt className="text-muted-foreground">Forma</dt>
                  <dd className="font-mono" title={stats?.homeTeamForm ?? undefined}>
                    {formatForm(stats?.homeTeamForm)}
                  </dd>
                  <dt className="text-muted-foreground">Gols/jogo</dt>
                  <dd>{formatAvg(stats?.homeTeamGoalsAvg)}</dd>
                  <dt className="text-muted-foreground">Sofridos/jogo</dt>
                  <dd>{formatAvg(stats?.homeTeamGoalsConcededAvg)}</dd>
                  <dt className="text-muted-foreground">Over 2.5</dt>
                  <dd>{formatRate(stats?.homeOver25Rate)}</dd>
                  <dt className="text-muted-foreground">Posição</dt>
                  <dd>{stats?.homeLeaguePosition ?? '—'}</dd>
                </dl>
              </div>
              <div className="rounded-md border border-border p-3">
                <p className="text-xs font-medium text-muted-foreground">Fora — {awayTeamName}</p>
                <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
                  <dt className="text-muted-foreground">Forma</dt>
                  <dd className="font-mono" title={stats?.awayTeamForm ?? undefined}>
                    {formatForm(stats?.awayTeamForm)}
                  </dd>
                  <dt className="text-muted-foreground">Gols/jogo</dt>
                  <dd>{formatAvg(stats?.awayTeamGoalsAvg)}</dd>
                  <dt className="text-muted-foreground">Sofridos/jogo</dt>
                  <dd>{formatAvg(stats?.awayTeamGoalsConcededAvg)}</dd>
                  <dt className="text-muted-foreground">Over 2.5</dt>
                  <dd>{formatRate(stats?.awayOver25Rate)}</dd>
                  <dt className="text-muted-foreground">Posição</dt>
                  <dd>{stats?.awayLeaguePosition ?? '—'}</dd>
                </dl>
              </div>
            </div>
            {stats?.lastUpdate && (
              <p className="text-xs text-muted-foreground">
                Última atualização: {formatDateTimeBR(stats.lastUpdate)}
              </p>
            )}
          </>
        )}

        {insight && insight.confidence != null && (
          <div className="rounded-md border border-border bg-muted/20 p-3 text-sm">
            <p className="font-medium">Sinal Over 2.5</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <span>Confiança {insight.confidence.toFixed(0)}%</span>
              {formatModelEv(insight.expectedValue) != null ? (
                <EvBadge ev={formatModelEv(insight.expectedValue)} />
              ) : (
                <span className="text-muted-foreground">EV — (sem oportunidade automática)</span>
              )}
              {insight.wouldPassValueBetFilters ? (
                <span className="text-emerald-400">Oportunidade EV+</span>
              ) : (
                <span className="text-muted-foreground">Fora dos critérios EV+</span>
              )}
            </div>
            {insight.reasoning && (
              <p className="mt-2 text-muted-foreground">{insight.reasoning}</p>
            )}
            {insight.suggestedOdd != null && insight.bookmaker && (
              <p className="mt-1 text-xs text-muted-foreground">
                Referência: odd {formatOdd(insight.suggestedOdd)} · {insight.bookmaker}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

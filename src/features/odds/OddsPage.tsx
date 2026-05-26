import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { RefreshCw, Search } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ClvBadge } from '@/components/badges/RoiBadge';
import { OddsHistoryChart } from '@/components/charts/PerformanceChart';
import { ErrorState } from '@/components/states/ErrorState';
import { TableSkeleton } from '@/components/states/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { DateInput } from '@/components/ui/date-input';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { matchService } from '@/services/matchService';
import { oddsService } from '@/services/oddsService';
import { formatDateTimeBR, toISODate } from '@/utils/dates';
import { formatOdd } from '@/utils/numbers';
import { getApiErrorMessage } from '@/utils/formatters';
import {
  canCaptureOdds,
  filterSuggestableMatches,
  filterSupportedLeagueMatches,
  ODDS_CAPTURE_DISABLED_TOOLTIP,
  sortMatchesByDate,
} from '@/utils/matches';

export function OddsPage() {
  const [date, setDate] = useState(toISODate(new Date()));
  const [matchId, setMatchId] = useState('');
  const [bookmaker, setBookmaker] = useState('');
  const [pickedOddId, setPickedOddId] = useState('');
  const [finalOddId, setFinalOddId] = useState('');

  const matchesQuery = useQuery({
    queryKey: ['matches', 'odds-select', date],
    queryFn: () => matchService.getMatchesByDate(date),
    select: (data) =>
      sortMatchesByDate(
        filterSuggestableMatches(filterSupportedLeagueMatches(data)),
      ),
  });

  useEffect(() => {
    setMatchId('');
    setPickedOddId('');
    setFinalOddId('');
  }, [date]);

  const oddsQuery = useQuery({
    queryKey: ['odds-match', matchId],
    queryFn: () => oddsService.getOddsByMatch(matchId),
    enabled: !!matchId,
  });

  const historyQuery = useQuery({
    queryKey: ['odds-history-page', matchId],
    queryFn: () => oddsService.getOddsHistory(matchId),
    enabled: !!matchId,
  });

  const bookmakerQuery = useQuery({
    queryKey: ['odds-bookmaker', bookmaker],
    queryFn: () => oddsService.getOddsByBookmaker(bookmaker),
    enabled: !!bookmaker,
  });

  const clvQuery = useQuery({
    queryKey: ['clv', matchId, pickedOddId, finalOddId],
    queryFn: () => oddsService.calculateCLV(matchId, pickedOddId, finalOddId),
    enabled: !!matchId && !!pickedOddId && !!finalOddId,
  });

  const captureMutation = useMutation({
    mutationFn: () => oddsService.captureOdds(matchId),
    onSuccess: (data) => {
      if (data.length === 0) {
        toast.warning('Nenhuma odd encontrada para esta partida (sem mercado ou times não bateram).');
      } else {
        toast.success(`${data.length} odds capturadas`);
      }
      oddsQuery.refetch();
      historyQuery.refetch();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const oddsList = oddsQuery.data ?? [];
  const capturableMatches = matchesQuery.data ?? [];
  const selectedMatch = capturableMatches.find((m) => m.id === matchId);
  const oddsCaptureAllowed = selectedMatch ? canCaptureOdds(selectedMatch) : false;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Odds"
        description="Visualize odds, histórico de movimentação e calcule CLV"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Buscar por partida</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="odds-date" className="cursor-pointer">
                Data
              </Label>
              <DateInput
                id="odds-date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="odds-match">Partida</Label>
              <Select
                id="odds-match"
                value={matchId}
                onChange={(e) => setMatchId(e.target.value)}
                disabled={matchesQuery.isLoading}
              >
                <option value="">
                  {matchesQuery.isLoading
                    ? 'Carregando partidas...'
                    : capturableMatches.length === 0
                      ? 'Nenhuma partida elegível nesta data'
                      : 'Selecione'}
                </option>
                {capturableMatches.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.homeTeamName} vs {m.awayTeamName} — {formatDateTimeBR(m.matchDate)} (
                    {m.status}) · {m.leagueName}
                  </option>
                ))}
              </Select>
              {matchesQuery.isError && (
                <ErrorState error={matchesQuery.error} onRetry={() => matchesQuery.refetch()} />
              )}
              {!matchesQuery.isLoading &&
                !matchesQuery.isError &&
                capturableMatches.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Sincronize a data em Admin, ou escolha outro dia. Só aparecem jogos não
                    finalizados (pré-jogo ou ao vivo) das 6 ligas.
                  </p>
                )}
            </div>
            {matchId && (
              <div className="space-y-2">
                <Button
                  onClick={() => captureMutation.mutate()}
                  disabled={captureMutation.isPending || !oddsCaptureAllowed}
                  title={oddsCaptureAllowed ? undefined : ODDS_CAPTURE_DISABLED_TOOLTIP}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${captureMutation.isPending ? 'animate-spin' : ''}`} />
                  Capturar odds
                </Button>
                {selectedMatch && !oddsCaptureAllowed && (
                  <p className="text-xs text-muted-foreground">{ODDS_CAPTURE_DISABLED_TOOLTIP}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Buscar por bookmaker</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Bookmaker</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Ex: bet365"
                  value={bookmaker}
                  onChange={(e) => setBookmaker(e.target.value)}
                />
                <Button variant="outline" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {matchId && (
        <>
          {oddsQuery.isLoading ? (
            <TableSkeleton />
          ) : oddsQuery.isError ? (
            <ErrorState error={oddsQuery.error} onRetry={() => oddsQuery.refetch()} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Odds da partida</CardTitle>
              </CardHeader>
              <CardContent>
                {oddsList.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma odd encontrada.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground">
                          <th className="px-3 py-2 text-left">Bookmaker</th>
                          <th className="px-3 py-2 text-left">Mercado</th>
                          <th className="px-3 py-2 text-right">Odd</th>
                          <th className="px-3 py-2 text-left">Capturada em</th>
                        </tr>
                      </thead>
                      <tbody>
                        {oddsList.map((odd) => (
                          <tr key={odd.id} className="border-b border-border">
                            <td className="px-3 py-2">{odd.bookmaker}</td>
                            <td className="px-3 py-2">{odd.market}</td>
                            <td className="px-3 py-2 text-right font-mono">{formatOdd(odd.oddsValue)}</td>
                            <td className="px-3 py-2">{formatDateTimeBR(odd.capturedAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <OddsHistoryChart data={historyQuery.data ?? []} />
        </>
      )}

      {bookmaker && bookmakerQuery.data && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Odds — {bookmaker}</CardTitle>
          </CardHeader>
          <CardContent>
            {(bookmakerQuery.data.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma odd para este bookmaker.</p>
            ) : (
              <p className="text-sm">{bookmakerQuery.data.length} registros encontrados</p>
            )}
          </CardContent>
        </Card>
      )}

      {matchId && oddsList.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Calcular CLV</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              CLV positivo indica que a odd escolhida foi melhor que a odd final de mercado,
              sugerindo vantagem contra o fechamento.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Odd escolhida (picked)</Label>
                <Select value={pickedOddId} onChange={(e) => setPickedOddId(e.target.value)}>
                  <option value="">Selecione</option>
                  {oddsList.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.bookmaker} — {formatOdd(o.oddsValue)} ({formatDateTimeBR(o.capturedAt)})
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Odd final (closing)</Label>
                <Select value={finalOddId} onChange={(e) => setFinalOddId(e.target.value)}>
                  <option value="">Selecione</option>
                  {oddsList.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.bookmaker} — {formatOdd(o.oddsValue)} ({formatDateTimeBR(o.capturedAt)})
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            {clvQuery.data && (
              <div className="rounded-lg border border-border p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Picked</p>
                    <p className="font-mono font-bold">{formatOdd(clvQuery.data.pickedOdd)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Final</p>
                    <p className="font-mono font-bold">{formatOdd(clvQuery.data.finalOdd)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">CLV</p>
                    <ClvBadge clv={clvQuery.data.clv} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Resultado</p>
                    <p className="text-sm">{clvQuery.data.result}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

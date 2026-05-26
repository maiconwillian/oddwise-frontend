import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatusBadge } from '@/components/badges/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { matchService } from '@/services/matchService';
import { oddsService } from '@/services/oddsService';
import { suggestionService } from '@/services/suggestionService';
import { DEFAULT_MARKET, LEAGUES, SUPPORTED_MARKETS, type League } from '@/types/api';
import { formatDateTimeBR } from '@/utils/dates';
import { getApiErrorMessage, formatMarket } from '@/utils/formatters';
import {
  filterSuggestableMatches,
  leagueFromMatch,
  sortMatchesByDate,
} from '@/utils/matches';
import { filterOddsByMarket, latestOddPerBookmaker, sortOddsByValue } from '@/utils/odds';
import { formatOdd } from '@/utils/numbers';

const schema = z.object({
  matchId: z.string().min(1, 'Partida obrigatória'),
  market: z.string().min(1, 'Mercado obrigatório'),
  pickedOdd: z.coerce.number().gt(1, 'Odd deve ser maior que 1'),
  pickedBookmaker: z.string().min(1, 'Bookmaker obrigatório'),
  confidence: z.coerce.number().min(0).max(100, 'Confiança entre 0 e 100'),
  expectedValue: z.coerce.number(),
  stake: z.coerce.number().gt(0, 'Stake deve ser maior que 0'),
});

type FormData = z.infer<typeof schema>;

export function NewSuggestionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedMatchId = searchParams.get('matchId') ?? '';

  const [league, setLeague] = useState<League | ''>('');

  const preselectQuery = useQuery({
    queryKey: ['match', preselectedMatchId],
    queryFn: () => matchService.getMatchById(preselectedMatchId),
    enabled: !!preselectedMatchId,
  });

  const leagueMatchesQuery = useQuery({
    queryKey: ['matches', 'suggestion', league],
    queryFn: () => matchService.getMatchesByLeague(league as League),
    enabled: !!league,
    select: (data) => sortMatchesByDate(filterSuggestableMatches(data)),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      matchId: preselectedMatchId,
      market: DEFAULT_MARKET,
    },
  });

  const selectedMatchId = watch('matchId');
  const selectedMarket = watch('market');
  const pickedOdd = watch('pickedOdd');
  const pickedBookmaker = watch('pickedBookmaker');

  const oddsQuery = useQuery({
    queryKey: ['odds-match', selectedMatchId],
    queryFn: () => oddsService.getOddsByMatch(selectedMatchId),
    enabled: !!selectedMatchId,
  });

  const marketOdds = sortOddsByValue(
    latestOddPerBookmaker(filterOddsByMarket(oddsQuery.data ?? [], selectedMarket)),
  );

  const selectedOddId =
    marketOdds.find((o) => o.bookmaker === pickedBookmaker)?.id ??
    marketOdds.find((o) => Math.abs(o.oddsValue - Number(pickedOdd)) < 0.001)?.id ??
    '';

  const applyOddSelection = (oddId: string) => {
    const odd = marketOdds.find((o) => o.id === oddId);
    if (!odd) return;
    setValue('pickedOdd', odd.oddsValue, { shouldValidate: true });
    setValue('pickedBookmaker', odd.bookmaker, { shouldValidate: true });
  };

  const suggestableMatches = leagueMatchesQuery.data ?? [];
  const selectedMatch =
    suggestableMatches.find((m) => m.id === selectedMatchId) ?? preselectQuery.data;
  const preselectedNotSuggestable =
    !!preselectQuery.data && !filterSuggestableMatches([preselectQuery.data]).length;

  useEffect(() => {
    setValue('pickedOdd', '' as unknown as number);
    setValue('pickedBookmaker', '');
  }, [selectedMatchId, selectedMarket, setValue]);

  useEffect(() => {
    const match = preselectQuery.data;
    if (!match) return;

    const leagueValue = leagueFromMatch(match);
    if (leagueValue) {
      setLeague(leagueValue);
    }
    setValue('matchId', match.id);
  }, [preselectQuery.data, setValue]);

  const mutation = useMutation({
    mutationFn: suggestionService.createSuggestion,
    onSuccess: () => {
      toast.success('Sugestão criada com sucesso');
      navigate('/suggestions');
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Nova sugestão"
        description="Escolha a liga e a partida — só jogos não finalizados (pré-jogo, ao vivo ou intervalo)"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados da sugestão</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit((data) => mutation.mutate(data))}
            className="space-y-4"
          >
            <div className="space-y-1">
              <Label htmlFor="league">Liga *</Label>
              <Select
                id="league"
                value={league}
                onChange={(e) => {
                  const value = e.target.value as League | '';
                  setLeague(value);
                  setValue('matchId', '');
                }}
              >
                <option value="">Selecione a liga</option>
                {LEAGUES.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="matchId">Partida *</Label>
              <Select
                id="matchId"
                {...register('matchId')}
                disabled={!league || leagueMatchesQuery.isLoading}
              >
                <option value="">
                  {!league
                    ? 'Selecione a liga primeiro'
                    : leagueMatchesQuery.isLoading
                      ? 'Carregando partidas...'
                      : suggestableMatches.length === 0
                        ? 'Nenhuma partida disponível nesta liga'
                        : 'Selecione a partida'}
                </option>
                {suggestableMatches.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.homeTeamName} vs {m.awayTeamName} — {formatDateTimeBR(m.matchDate)} (
                    {m.status})
                  </option>
                ))}
              </Select>
              {errors.matchId && (
                <p className="text-xs text-rose-400">{errors.matchId.message}</p>
              )}
              {league && !leagueMatchesQuery.isLoading && suggestableMatches.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Só aparecem jogos não iniciados, ao vivo ou no intervalo.
                </p>
              )}
              {preselectedNotSuggestable && (
                <p className="text-xs text-amber-400">
                  A partida selecionada já foi finalizada ou não está disponível para nova sugestão.
                </p>
              )}
            </div>

            {selectedMatch && (
              <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
                <span className="font-medium">
                  {selectedMatch.homeTeamName} vs {selectedMatch.awayTeamName}
                </span>
                <StatusBadge status={selectedMatch.status} />
                <span className="text-muted-foreground">
                  {formatDateTimeBR(selectedMatch.matchDate)}
                </span>
              </div>
            )}

            <div className="space-y-1">
              <Label htmlFor="market">Mercado *</Label>
              <Select id="market" {...register('market')}>
                {SUPPORTED_MARKETS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </Select>
              {errors.market && (
                <p className="text-xs text-rose-400">{errors.market.message}</p>
              )}
            </div>

            {marketOdds.length > 0 ? (
              <div className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="pickedOddSelect">Odd escolhida *</Label>
                  <Select
                    id="pickedOddSelect"
                    value={selectedOddId}
                    disabled={oddsQuery.isLoading}
                    onChange={(e) => applyOddSelection(e.target.value)}
                  >
                    <option value="">
                      {oddsQuery.isLoading ? 'Carregando odds...' : 'Selecione a linha de aposta'}
                    </option>
                    {marketOdds.map((o) => (
                      <option key={o.id} value={o.id}>
                        {formatOdd(o.oddsValue)} — {o.bookmaker} ({formatMarket(selectedMarket)})
                      </option>
                    ))}
                  </Select>
                  {(errors.pickedOdd || errors.pickedBookmaker) && (
                    <p className="text-xs text-rose-400">
                      {errors.pickedOdd?.message ?? errors.pickedBookmaker?.message}
                    </p>
                  )}
                </div>
                {selectedOddId && pickedBookmaker && (
                  <p className="text-sm text-muted-foreground">
                    {pickedBookmaker} · {formatOdd(Number(pickedOdd))}
                  </p>
                )}
                <input type="hidden" {...register('pickedOdd', { valueAsNumber: true })} />
                <input type="hidden" {...register('pickedBookmaker')} />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="pickedOdd">Odd escolhida *</Label>
                    <Input
                      id="pickedOdd"
                      type="number"
                      step="0.01"
                      disabled={!selectedMatchId}
                      {...register('pickedOdd', { valueAsNumber: true })}
                    />
                    {errors.pickedOdd && (
                      <p className="text-xs text-rose-400">{errors.pickedOdd.message}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="pickedBookmaker">Bookmaker *</Label>
                    <Input
                      id="pickedBookmaker"
                      disabled={!selectedMatchId}
                      {...register('pickedBookmaker')}
                    />
                    {errors.pickedBookmaker && (
                      <p className="text-xs text-rose-400">{errors.pickedBookmaker.message}</p>
                    )}
                  </div>
                </div>
                {selectedMatchId && !oddsQuery.isLoading && (
                  <p className="text-xs text-muted-foreground">
                    Nenhuma odd capturada para este mercado. Informe manualmente ou capture na aba Odds.
                  </p>
                )}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <Label htmlFor="confidence">Confiança (%) *</Label>
                <Input id="confidence" type="number" {...register('confidence')} />
                <p className="text-xs text-muted-foreground">Força do sinal (0–100)</p>
                {errors.confidence && (
                  <p className="text-xs text-rose-400">{errors.confidence.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="expectedValue">Expected Value (%) *</Label>
                <Input id="expectedValue" type="number" step="0.1" {...register('expectedValue')} />
                <p className="text-xs text-muted-foreground">Edge teórico vs odd justa (+ = value)</p>
                {errors.expectedValue && (
                  <p className="text-xs text-rose-400">{errors.expectedValue.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="stake">Stake (R$) *</Label>
                <Input id="stake" type="number" step="0.01" {...register('stake')} />
                <p className="text-xs text-muted-foreground">Valor apostado</p>
                {errors.stake && (
                  <p className="text-xs text-rose-400">{errors.stake.message}</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={mutation.isPending || preselectedNotSuggestable}>
                {mutation.isPending ? 'Salvando...' : 'Criar sugestão'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/suggestions')}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

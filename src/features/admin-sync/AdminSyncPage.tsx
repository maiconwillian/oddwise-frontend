import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Calendar, CalendarRange, Brain } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { MetricCard } from '@/components/badges/MetricCard';
import { ErrorState } from '@/components/states/ErrorState';
import { LoadingSkeleton } from '@/components/states/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { DateInput } from '@/components/ui/date-input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { invalidateOperationalQueries } from '@/lib/queryInvalidation';
import { adminService } from '@/services/adminService';
import { formatDateTimeBR, toISODate } from '@/utils/dates';
import { getApiErrorMessage } from '@/utils/formatters';
import type { SyncResult } from '@/types/admin';
import type { EnrichResult } from '@/types/matchAnalysis';

export function AdminSyncPage() {
  const [syncDate, setSyncDate] = useState(toISODate(new Date()));
  const [rangeFrom, setRangeFrom] = useState(toISODate(new Date()));
  const [rangeTo, setRangeTo] = useState(toISODate(new Date()));
  const [lastResult, setLastResult] = useState<SyncResult | null>(null);
  const [lastEnrichResult, setLastEnrichResult] = useState<EnrichResult | null>(null);
  const queryClient = useQueryClient();

  const statusQuery = useQuery({
    queryKey: ['sync-status'],
    queryFn: () => adminService.getSyncStatus(),
  });

  const syncDateMutation = useMutation({
    mutationFn: () => adminService.syncFixtures(syncDate),
    onSuccess: (data) => {
      setLastResult(data);
      toast.success(data.message ?? 'Sincronização concluída');
      invalidateOperationalQueries(queryClient);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const enrichMutation = useMutation({
    mutationFn: () => adminService.enrichFixtures(syncDate),
    onSuccess: (data) => {
      setLastEnrichResult(data);
      toast.success(data.message ?? 'Enriquecimento concluído');
      invalidateOperationalQueries(queryClient);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const syncRangeMutation = useMutation({
    mutationFn: () => adminService.syncFixturesRange(rangeFrom, rangeTo),
    onSuccess: (data) => {
      setLastResult(data);
      toast.success(data.message ?? 'Sincronização concluída');
      invalidateOperationalQueries(queryClient);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const enrichRangeMutation = useMutation({
    mutationFn: () => adminService.enrichFixturesRange(rangeFrom, rangeTo),
    onSuccess: (data) => {
      setLastEnrichResult(data);
      toast.success(data.message ?? 'Enriquecimento concluído');
      invalidateOperationalQueries(queryClient);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Administração / Sincronização"
        description="Sincronize partidas externas e acompanhe o status do sistema"
      />

      {statusQuery.isLoading ? (
        <LoadingSkeleton count={2} />
      ) : statusQuery.isError ? (
        <ErrorState error={statusQuery.error} onRetry={() => statusQuery.refetch()} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <MetricCard
            title="Partidas sincronizadas"
            value={String(statusQuery.data?.totalMatchesSynced ?? 0)}
            icon={RefreshCw}
          />
          <MetricCard
            title="Última verificação"
            value={formatDateTimeBR(statusQuery.data?.lastSyncCheck)}
            icon={Calendar}
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4" />
              Sincronizar por data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="sync-date" className="cursor-pointer">
                Data
              </Label>
              <DateInput
                id="sync-date"
                value={syncDate}
                onChange={(e) => setSyncDate(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => syncDateMutation.mutate()}
                disabled={syncDateMutation.isPending}
              >
                {syncDateMutation.isPending ? 'Sincronizando...' : 'Sincronizar'}
              </Button>
              <Button
                variant="outline"
                onClick={() => enrichMutation.mutate()}
                disabled={enrichMutation.isPending}
              >
                <Brain className={`mr-2 h-4 w-4 ${enrichMutation.isPending ? 'animate-pulse' : ''}`} />
                {enrichMutation.isPending ? 'Enriquecendo...' : 'Enriquecer análise desta data'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Após o sync, enriqueça para preencher médias/forma (API-Football). Consome quota da API.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarRange className="h-4 w-4" />
              Sincronizar intervalo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="sync-range-from" className="cursor-pointer">
                  De
                </Label>
                <DateInput
                  id="sync-range-from"
                  value={rangeFrom}
                  onChange={(e) => setRangeFrom(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="sync-range-to" className="cursor-pointer">
                  Até
                </Label>
                <DateInput
                  id="sync-range-to"
                  value={rangeTo}
                  onChange={(e) => setRangeTo(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => syncRangeMutation.mutate()}
                disabled={syncRangeMutation.isPending}
              >
                {syncRangeMutation.isPending ? 'Sincronizando...' : 'Sincronizar intervalo'}
              </Button>
              <Button
                variant="outline"
                onClick={() => enrichRangeMutation.mutate()}
                disabled={enrichRangeMutation.isPending}
              >
                <Brain
                  className={`mr-2 h-4 w-4 ${enrichRangeMutation.isPending ? 'animate-pulse' : ''}`}
                />
                {enrichRangeMutation.isPending ? 'Enriquecendo...' : 'Enriquecer intervalo'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {lastEnrichResult && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resultado do enriquecimento</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div>
              <p className="text-muted-foreground">Processadas</p>
              <p className="font-bold">{lastEnrichResult.matchesProcessed}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Enriquecidas</p>
              <p className="font-bold text-emerald-400">{lastEnrichResult.enriched}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Falhas</p>
              <p className="font-bold text-amber-400">{lastEnrichResult.failed}</p>
            </div>
            {lastEnrichResult.message && (
              <div className="col-span-2 sm:col-span-4">
                <p className="text-muted-foreground">{lastEnrichResult.message}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {lastResult && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resultado da sincronização</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lastResult.message && (
              <p className="text-sm font-medium text-emerald-400">{lastResult.message}</p>
            )}
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4 lg:grid-cols-7">
              <div>
                <p className="text-muted-foreground">Processadas</p>
                <p className="font-bold">
                  {lastResult.totalProcessed ??
                    (lastResult.created ?? 0) + (lastResult.updated ?? 0)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Criadas</p>
                <p className="font-bold text-emerald-400">{lastResult.created ?? 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Atualizadas</p>
                <p className="font-bold">{lastResult.updated ?? 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Ignoradas (liga)</p>
                <p className="font-bold text-amber-400">{lastResult.skippedUnsupported ?? 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Ignoradas (qualidade)</p>
                <p className="font-bold text-amber-400">{lastResult.skippedQuality ?? 0}</p>
              </div>
              {(lastResult.settled ?? 0) > 0 && (
                <>
                  <div>
                    <p className="text-muted-foreground">Liquidadas</p>
                    <p className="font-bold">{lastResult.settled}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Ganhas</p>
                    <p className="font-bold text-emerald-400">{lastResult.won ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Perdidas</p>
                    <p className="font-bold text-rose-400">{lastResult.lost ?? 0}</p>
                  </div>
                </>
              )}
            </div>
            {lastResult.errors && lastResult.errors.length > 0 && (
              <div className="rounded-md border border-rose-500/30 bg-rose-500/5 p-3">
                <p className="mb-2 text-sm font-medium text-rose-400">Erros</p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {lastResult.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Calendar, CalendarRange } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { MetricCard } from '@/components/badges/MetricCard';
import { ErrorState } from '@/components/states/ErrorState';
import { LoadingSkeleton } from '@/components/states/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { adminService } from '@/services/adminService';
import { formatDateTimeBR, toISODate } from '@/utils/dates';
import { getApiErrorMessage } from '@/utils/formatters';
import type { SyncResult } from '@/types/admin';

export function AdminSyncPage() {
  const [syncDate, setSyncDate] = useState(toISODate(new Date()));
  const [rangeFrom, setRangeFrom] = useState(toISODate(new Date()));
  const [rangeTo, setRangeTo] = useState(toISODate(new Date()));
  const [lastResult, setLastResult] = useState<SyncResult | null>(null);
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
      queryClient.invalidateQueries({ queryKey: ['sync-status'] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const syncRangeMutation = useMutation({
    mutationFn: () => adminService.syncFixturesRange(rangeFrom, rangeTo),
    onSuccess: (data) => {
      setLastResult(data);
      toast.success(data.message ?? 'Sincronização concluída');
      queryClient.invalidateQueries({ queryKey: ['sync-status'] });
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
              <Label>Data</Label>
              <Input
                type="date"
                value={syncDate}
                onChange={(e) => setSyncDate(e.target.value)}
              />
            </div>
            <Button
              onClick={() => syncDateMutation.mutate()}
              disabled={syncDateMutation.isPending}
            >
              {syncDateMutation.isPending ? 'Sincronizando...' : 'Sincronizar'}
            </Button>
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
                <Label>De</Label>
                <Input type="date" value={rangeFrom} onChange={(e) => setRangeFrom(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Até</Label>
                <Input type="date" value={rangeTo} onChange={(e) => setRangeTo(e.target.value)} />
              </div>
            </div>
            <Button
              onClick={() => syncRangeMutation.mutate()}
              disabled={syncRangeMutation.isPending}
            >
              {syncRangeMutation.isPending ? 'Sincronizando...' : 'Sincronizar intervalo'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {lastResult && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resultado da sincronização</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lastResult.message && (
              <p className="text-sm font-medium text-emerald-400">{lastResult.message}</p>
            )}
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div>
                <p className="text-muted-foreground">Processadas</p>
                <p className="font-bold">{lastResult.totalProcessed ?? 0}</p>
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
                <p className="text-muted-foreground">Ignoradas</p>
                <p className="font-bold">{lastResult.skipped ?? 0}</p>
              </div>
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

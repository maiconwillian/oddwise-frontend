import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/data-table/DataTable';
import { StatusBadge } from '@/components/badges/StatusBadge';
import { EvBadge, RoiBadge } from '@/components/badges/RoiBadge';
import { ErrorState } from '@/components/states/ErrorState';
import { TableSkeleton } from '@/components/states/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { suggestionService } from '@/services/suggestionService';
import type { Suggestion, SuggestionStatus } from '@/types/suggestion';
import { formatCurrency, formatOdd } from '@/utils/numbers';
import { formatLeague, formatMarket, getApiErrorMessage } from '@/utils/formatters';

function matchLabel(s: Suggestion): string {
  if (s.homeTeamName && s.awayTeamName) {
    return `${s.homeTeamName} vs ${s.awayTeamName}`;
  }
  return 'Partida';
}

export function SuggestionsPage() {
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['suggestions', page, status, date],
    queryFn: () =>
      suggestionService.getSuggestions({
        page,
        size: 10,
        status: status || undefined,
        date: date || undefined,
      }),
  });

  const updateResultMutation = useMutation({
    mutationFn: ({ id, newStatus }: { id: string; newStatus: SuggestionStatus }) =>
      suggestionService.updateSuggestionResult(id, { actualResult: newStatus }),
    onSuccess: () => {
      toast.success('Resultado atualizado');
      queryClient.invalidateQueries({ queryKey: ['suggestions'] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const columns: ColumnDef<Suggestion, unknown>[] = [
    {
      header: 'Partida',
      id: 'match',
      cell: ({ row }) => (
        <div className="min-w-[160px]">
          <Link
            to={`/matches/${row.original.matchId}`}
            className="font-medium hover:text-primary hover:underline"
          >
            {matchLabel(row.original)}
          </Link>
          {row.original.leagueName && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {formatLeague(row.original.leagueName)}
            </p>
          )}
        </div>
      ),
    },
    {
      header: 'Mercado',
      accessorKey: 'market',
      cell: ({ row }) => formatMarket(row.original.market),
    },
    {
      header: 'Linha',
      id: 'line',
      cell: ({ row }) => (
        <div className="text-sm">
          <span className="font-mono font-medium">{formatOdd(row.original.pickedOdd)}</span>
          <span className="text-muted-foreground"> · {row.original.pickedBookmaker}</span>
        </div>
      ),
    },
    {
      header: 'EV',
      accessorKey: 'expectedValue',
      cell: ({ row }) => <EvBadge ev={row.original.expectedValue} />,
    },
    {
      header: 'Confiança',
      accessorKey: 'confidence',
      cell: ({ row }) => `${row.original.confidence}%`,
    },
    {
      header: 'Stake',
      accessorKey: 'stake',
      cell: ({ row }) => formatCurrency(row.original.stake),
    },
    {
      header: 'ROI',
      accessorKey: 'roi',
      cell: ({ row }) => <RoiBadge roi={row.original.roi} />,
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      header: 'Resultado',
      id: 'actions',
      cell: ({ row }) =>
        row.original.status === 'PENDING' ? (
          <div className="flex gap-2">
            <button
              type="button"
              className="text-xs text-emerald-400 hover:underline disabled:opacity-50"
              disabled={updateResultMutation.isPending}
              onClick={() =>
                updateResultMutation.mutate({ id: row.original.id, newStatus: 'WON' })
              }
            >
              Ganho
            </button>
            <button
              type="button"
              className="text-xs text-rose-400 hover:underline disabled:opacity-50"
              disabled={updateResultMutation.isPending}
              onClick={() =>
                updateResultMutation.mutate({ id: row.original.id, newStatus: 'LOST' })
              }
            >
              Perdido
            </button>
            <button
              type="button"
              className="text-xs text-muted-foreground hover:underline disabled:opacity-50"
              disabled={updateResultMutation.isPending}
              onClick={() =>
                updateResultMutation.mutate({ id: row.original.id, newStatus: 'VOID' })
              }
            >
              Void
            </button>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sugestões"
        description="Registre apostas analisadas, acompanhe resultados e meça ROI"
        actions={
          <Link to="/suggestions/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova sugestão
            </Button>
          </Link>
        }
      />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Como funciona</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          <p>
            <strong className="text-foreground">Mercado / Linha</strong> — o que você apostou
            (ex.: Over 2.5 na Pinnacle @ 2.14).
          </p>
          <p>
            <strong className="text-foreground">EV</strong> — valor esperado positivo indica
            aposta com edge teórico sobre a odd justa.
          </p>
          <p>
            <strong className="text-foreground">Confiança</strong> — quão forte é o sinal do
            modelo (0–100%).
          </p>
          <p>
            <strong className="text-foreground">Stake</strong> — quanto apostou em R$.
          </p>
          <p>
            <strong className="text-foreground">ROI</strong> — lucro/prejuízo em % após marcar
            Ganho ou Perdido.
          </p>
          <p>
            <strong className="text-foreground">Ganho / Perdido</strong> — fecha a sugestão quando
            o jogo termina; o ROI é calculado automaticamente.
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-border bg-card p-4">
        <div className="space-y-1">
          <Label htmlFor="sug-date">Data de criação</Label>
          <Input
            id="sug-date"
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setPage(0);
            }}
            className="w-auto"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="sug-status">Status</Label>
          <Select
            id="sug-status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(0);
            }}
            className="min-w-[140px]"
          >
            <option value="">Todos</option>
            <option value="PENDING">Pendente</option>
            <option value="WON">Ganho</option>
            <option value="LOST">Perdido</option>
            <option value="VOID">Void</option>
          </Select>
        </div>
      </div>

      {query.isLoading ? (
        <TableSkeleton />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : (
        <DataTable
          columns={columns}
          data={query.data?.content ?? []}
          page={page}
          totalPages={query.data?.totalPages ?? 1}
          onPageChange={setPage}
          emptyTitle="Nenhuma sugestão"
          emptyDescription="Crie uma sugestão a partir de uma partida com odds capturadas."
        />
      )}
    </div>
  );
}

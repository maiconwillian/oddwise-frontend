import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataTable } from '@/components/data-table/DataTable';
import { LeagueBadge } from '@/components/badges/LeagueBadge';
import { EvBadge } from '@/components/badges/RoiBadge';
import { ErrorState } from '@/components/states/ErrorState';
import { TableSkeleton } from '@/components/states/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { DateInput } from '@/components/ui/date-input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { invalidateOperationalQueries } from '@/lib/queryInvalidation';
import { proposalService } from '@/services/proposalService';
import type { Proposal } from '@/types/proposal';
import { formatOdd } from '@/utils/numbers';
import { formatMarket, getApiErrorMessage } from '@/utils/formatters';
import { toISODate } from '@/utils/dates';
import { startOfWeek, endOfWeek, format, parseISO } from 'date-fns';

function weekDefaults() {
  const now = new Date();
  return {
    from: toISODate(startOfWeek(now, { weekStartsOn: 1 })),
    to: toISODate(endOfWeek(now, { weekStartsOn: 1 })),
  };
}

function formatEvPct(ev: number) {
  return ev * 100;
}

export function ProposedSuggestionsPage() {
  const defaults = weekDefaults();
  const [from, setFrom] = useState(defaults.from);
  const [to, setTo] = useState(defaults.to);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const query = useQuery({
    queryKey: ['proposed-suggestions', from, to],
    queryFn: () => proposalService.getProposed({ from, to }),
  });

  const generateMutation = useMutation({
    mutationFn: () => proposalService.generateWeekly(from, to),
    onSuccess: (data) => {
      toast.success(data.message ?? `${data.created} proposta(s) criada(s)`);
      queryClient.invalidateQueries({ queryKey: ['proposed-suggestions'] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const acceptMutation = useMutation({
    mutationFn: (id: string) => proposalService.acceptProposal(id),
    onSuccess: () => {
      toast.success('Proposta aceita — agora é sugestão pendente');
      invalidateOperationalQueries(queryClient);
      navigate('/suggestions');
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => proposalService.rejectProposal(id),
    onSuccess: () => {
      toast.success('Proposta rejeitada');
      queryClient.invalidateQueries({ queryKey: ['proposed-suggestions'] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const columns: ColumnDef<Proposal, unknown>[] = [
    {
      header: 'Partida',
      id: 'match',
      cell: ({ row }) => (
        <Link
          to={`/matches/${row.original.matchId}`}
          className="font-medium hover:text-primary hover:underline"
        >
          {row.original.homeTeamName} vs {row.original.awayTeamName}
        </Link>
      ),
    },
    {
      header: 'Liga',
      accessorKey: 'leagueName',
      cell: ({ row }) => <LeagueBadge league={row.original.leagueName} />,
    },
    {
      header: 'Mercado',
      accessorKey: 'market',
      cell: ({ row }) => formatMarket(row.original.market),
    },
    {
      header: 'Conf.',
      accessorKey: 'confidence',
      cell: ({ row }) => `${row.original.confidence.toFixed(0)}%`,
    },
    {
      header: 'EV',
      accessorKey: 'expectedValue',
      cell: ({ row }) => <EvBadge ev={formatEvPct(row.original.expectedValue)} />,
    },
    {
      header: 'Odd',
      id: 'odd',
      cell: ({ row }) => (
        <span className="font-mono text-sm">
          {formatOdd(row.original.pickedOdd)} · {row.original.pickedBookmaker}
        </span>
      ),
    },
    {
      header: 'Stake',
      accessorKey: 'stake',
      cell: ({ row }) => `R$ ${row.original.stake.toFixed(2)}`,
    },
    {
      header: 'Motivo',
      id: 'reason',
      cell: ({ row }) => (
        <p className="max-w-[200px] text-xs text-muted-foreground">
          {row.original.proposalReason ?? '—'}
        </p>
      ),
    },
    {
      header: 'Ação',
      id: 'action',
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            disabled={acceptMutation.isPending}
            onClick={() => {
              if (window.confirm('Aceitar esta proposta e registrar como aposta pendente?')) {
                acceptMutation.mutate(row.original.id);
              }
            }}
          >
            <Check className="mr-1 h-3 w-3 text-emerald-400" />
            Aceitar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={rejectMutation.isPending}
            onClick={() => {
              if (window.confirm('Rejeitar esta proposta?')) {
                rejectMutation.mutate(row.original.id);
              }
            }}
          >
            <X className="mr-1 h-3 w-3 text-rose-400" />
            Rejeitar
          </Button>
        </div>
      ),
    },
  ];

  const proposed = query.data ?? [];
  const maxPerWeek = 5;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Propostas da semana"
        description="Rascunhos gerados pelo motor — aceite para virar aposta pendente ou rejeite"
      />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Como funciona</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            Proposta ≠ aposta até você <strong className="text-foreground">Aceitar</strong>. O motor
            usa picks da rodada (Over 2.5, EV positivo) — pode incluir jogos abaixo de 65% de
            confiança. Máximo {maxPerWeek} propostas por semana. Rotina: sync → enrich → odds →{' '}
            <strong className="text-foreground">Gerar propostas</strong> → revisar aqui.
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-end gap-4 rounded-lg border border-border bg-card p-4">
        <div className="space-y-1">
          <Label htmlFor="prop-from">De</Label>
          <DateInput id="prop-from" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="prop-to">Até</Label>
          <DateInput id="prop-to" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <Button
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
        >
          <Sparkles className={`mr-2 h-4 w-4 ${generateMutation.isPending ? 'animate-pulse' : ''}`} />
          {generateMutation.isPending ? 'Gerando...' : 'Gerar propostas da semana'}
        </Button>
        <p className="w-full text-xs text-muted-foreground">
          Semana {format(parseISO(from), 'dd/MM')} – {format(parseISO(to), 'dd/MM')} ·{' '}
          {proposed.length}/{maxPerWeek} na fila
        </p>
      </div>

      {query.isLoading ? (
        <TableSkeleton />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : (
        <DataTable
          columns={columns}
          data={proposed}
          page={0}
          totalPages={1}
          onPageChange={() => {}}
          emptyTitle="Nenhuma proposta na fila"
          emptyDescription="Clique em Gerar propostas da semana após sync, enrich e odds nos jogos do período."
        />
      )}
    </div>
  );
}

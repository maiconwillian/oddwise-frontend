import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getApiErrorMessage } from '@/utils/formatters';

interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-rose-500/30 bg-rose-500/5 py-16 text-center">
      <AlertCircle className="mb-4 h-10 w-10 text-rose-400" />
      <h3 className="text-lg font-medium">Erro ao carregar dados</h3>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        {getApiErrorMessage(error)}
      </p>
      {onRetry && (
        <Button variant="outline" className="mt-4" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  );
}

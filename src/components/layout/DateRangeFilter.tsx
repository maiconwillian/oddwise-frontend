import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DateRangeFilterProps {
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
}

export function DateRangeFilter({
  from,
  to,
  onFromChange,
  onToChange,
}: DateRangeFilterProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <Label htmlFor="date-from">De</Label>
        <Input
          id="date-from"
          type="date"
          value={from}
          onChange={(e) => onFromChange(e.target.value)}
          className="w-auto"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="date-to">Até</Label>
        <Input
          id="date-to"
          type="date"
          value={to}
          onChange={(e) => onToChange(e.target.value)}
          className="w-auto"
        />
      </div>
    </div>
  );
}

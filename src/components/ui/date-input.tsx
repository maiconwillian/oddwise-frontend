import { forwardRef, useRef, type InputHTMLAttributes, type MutableRefObject, type Ref } from 'react';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

type DateInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

function mergeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (value: T | null) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === 'function') ref(value);
      else (ref as MutableRefObject<T | null>).current = value;
    }
  };
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ className, id, onClick, ...props }, ref) => {
    const innerRef = useRef<HTMLInputElement>(null);

    const openPicker = () => {
      const el = innerRef.current;
      if (!el) return;
      el.focus();
      try {
        el.showPicker();
      } catch {
        // Alguns browsers bloqueiam showPicker fora de gesto do usuário
      }
    };

    return (
      <div className={cn('relative inline-flex min-w-[11.5rem]', className)}>
        <input
          ref={mergeRefs(ref, innerRef)}
          id={id}
          type="date"
          className={cn(
            'flex h-9 w-full min-w-[11.5rem] cursor-pointer rounded-md border border-input bg-background px-3 py-1 pr-9 text-sm shadow-sm transition-colors',
            'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'disabled:cursor-not-allowed disabled:opacity-50',
            '[&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0',
            '[&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full',
            '[&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0',
          )}
          onClick={(e) => {
            onClick?.(e);
            openPicker();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openPicker();
            }
            props.onKeyDown?.(e);
          }}
          {...props}
        />
        <Calendar
          className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
      </div>
    );
  },
);

DateInput.displayName = 'DateInput';

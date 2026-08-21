'use client';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/utils/classes';

export function FiltrosRapidos({
  options,
  value,
  onChange,
  variant = 'outline',
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  variant?: 'outline' | 'solid';
}) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(nextValue) => nextValue && onChange(nextValue)}
      aria-label="Filtros"
      variant="outline"
      className="flex-wrap justify-start gap-2"
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={option}
          value={option}
          className={cn(
            'h-auto rounded-md px-3 py-1.5 text-xs font-semibold shadow-none',
            value === option
              ? variant === 'solid'
                ? 'border-green-dark bg-green-dark text-white hover:bg-green-dark hover:text-white'
                : 'border-green-mid bg-green-pale text-green-dark hover:bg-green-pale hover:text-green-dark'
              : 'border-border bg-card text-muted-foreground hover:bg-muted',
          )}
        >
          {option}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

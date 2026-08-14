import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

/** Grade de dias do mês reutilizada nas telas de agenda/calendário. */
export function DayPicker({
  value,
  onChange,
  days = 31,
  markedDays = [],
  tone = 'green',
}: {
  value: number;
  onChange: (day: number) => void;
  days?: number;
  markedDays?: number[];
  tone?: 'green' | 'navy';
}) {
  const selectedBg =
    tone === 'navy'
      ? 'bg-navy-mid hover:bg-navy-mid'
      : 'bg-green-mid hover:bg-green-mid';
  const dotBg = tone === 'navy' ? 'bg-navy-mid' : 'bg-green-mid';

  return (
    <div className="grid grid-cols-7 gap-1.5">
      {Array.from({ length: days }, (_, i) => i + 1).map((d) => (
        <Button
          key={d}
          type="button"
          variant={value === d ? 'default' : 'ghost'}
          onClick={() => onChange(d)}
          aria-label={`Selecionar dia ${d}`}
          className={cn(
            'relative aspect-square h-auto rounded-lg p-0 text-sm',
            value === d ? selectedBg : 'hover:bg-surface',
          )}
        >
          {d}
          {markedDays.includes(d) ? (
            <span
              className={cn(
                'absolute bottom-1.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full',
                value === d ? 'bg-white' : dotBg,
              )}
            />
          ) : null}
        </Button>
      ))}
    </div>
  );
}

/** Grade de horários selecionáveis. */
export function TimeSlotPicker({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (time: string) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map((h) => (
        <Button
          key={h}
          type="button"
          variant="outline"
          onClick={() => onChange(h)}
          aria-pressed={value === h}
          className={cn(
            'h-auto rounded-xl px-3 py-2.5 font-display text-sm',
            value === h &&
              'border-green-mid bg-green-pale font-semibold text-green-dark hover:bg-green-pale hover:text-green-dark',
          )}
        >
          {h}
        </Button>
      ))}
    </div>
  );
}

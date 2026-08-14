import { Clock, MapPin } from 'lucide-react';
import { useState } from 'react';

import { Card, PageHeader, Section } from '@/shared/components/campo-livre-ui';
import { Button } from '@/shared/components/ui/button';
import { reservas } from '@/mocks/data';
import { cn } from '@/shared/lib/utils';

const dias = Array.from({ length: 31 }, (_, i) => i + 1);
const comEventos = [3, 7, 10, 14, 17, 21, 24, 28];

export function Calendario() {
  const [dia, setDia] = useState(7);

  return (
    <>
      <PageHeader title="Calendário de reservas" subtitle="Agosto de 2026" />

      <Card>
        <div className="grid grid-cols-7 gap-1.5">
          {dias.map((d) => (
            <Button
              key={d}
              type="button"
              variant={dia === d ? 'default' : 'ghost'}
              onClick={() => setDia(d)}
              aria-label={`Selecionar dia ${d}`}
              className={cn(
                'relative aspect-square h-auto rounded-lg p-0 text-sm',
                dia === d
                  ? 'bg-navy-mid hover:bg-navy-mid'
                  : 'hover:bg-surface',
              )}
            >
              {d}
              {comEventos.includes(d) ? (
                <span
                  className={cn(
                    'absolute bottom-1.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full',
                    dia === d ? 'bg-white' : 'bg-navy-mid',
                  )}
                />
              ) : null}
            </Button>
          ))}
        </div>
      </Card>

      <Section
        title={`Eventos de hoje: ${String(dia).padStart(2, '0')}/08/2026`}
      >
        {reservas.map((r) => (
          <Card key={r.id} className="space-y-1">
            <p className="flex items-center gap-1 font-display font-semibold text-foreground">
              <MapPin className="h-4 w-4 text-navy-mid" /> {r.campo}
            </p>
            <p className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> {r.horario}
              </span>
              <span>{String(dia).padStart(2, '0')}/08/2026</span>
              <span>{r.campeonato}</span>
            </p>
          </Card>
        ))}
      </Section>
    </>
  );
}

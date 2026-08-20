'use client';

import { Clock, MapPin } from 'lucide-react';
import { useState } from 'react';
import { ptBR } from 'date-fns/locale';

import { Card, PageHeader, Section } from '@/shared/components/campo-livre-ui';
import { Calendar } from '@/shared/components/ui/calendar';
import { reservas } from '@/mocks/data';

const agosto2026 = new Date(2026, 7, 1);
const comEventos = [3, 7, 10, 14, 17, 21, 24, 28].map(
  (dia) => new Date(2026, 7, dia),
);

export function Calendario() {
  const [data, setData] = useState(new Date(2026, 7, 7));
  const dia = data.getDate();
  const dataSelecionada = `${String(dia).padStart(2, '0')}/08/2026`;
  const reservasDoDia = reservas.filter(
    (reserva) => reserva.data === dataSelecionada,
  );

  return (
    <>
      <PageHeader title="Calendário de reservas" subtitle="Agosto de 2026" />

      <Card>
        <Calendar
          mode="single"
          locale={ptBR}
          month={agosto2026}
          hideNavigation
          showOutsideDays={false}
          selected={data}
          onSelect={(nextDate) => nextDate && setData(nextDate)}
          modifiers={{ comEvento: comEventos }}
          modifiersClassNames={{
            comEvento:
              'after:absolute after:bottom-0.5 after:left-1/2 after:h-1 after:w-1 after:-translate-x-1/2 after:rounded-full after:bg-navy-mid',
          }}
          className="p-0"
          classNames={{
            selected:
              'bg-navy-mid text-white hover:bg-navy-mid hover:text-white rounded-md',
          }}
        />
      </Card>

      <Section
        title={`Eventos de hoje: ${String(dia).padStart(2, '0')}/08/2026`}
      >
        {reservasDoDia.map((reserva) => (
          <Card key={reserva.id} className="space-y-1">
            <p className="flex items-center gap-1 font-display font-semibold text-foreground">
              <MapPin className="h-4 w-4 text-navy-mid" /> {reserva.campo}
            </p>
            <p className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> {reserva.horario}
              </span>
              <span>{dataSelecionada}</span>
              <span>{reserva.campeonato}</span>
            </p>
          </Card>
        ))}
        {reservasDoDia.length === 0 ? (
          <p className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
            Nenhuma reserva nesta data.
          </p>
        ) : null}
      </Section>
    </>
  );
}

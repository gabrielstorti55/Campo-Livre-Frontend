'use client';

import { Clock, MapPin } from 'lucide-react';
import { useState } from 'react';
import { ptBR } from 'date-fns/locale';

import {
  formatMunicipalDate,
  useMunicipalOperationalState,
} from '@/features/prefeitura/state/municipal-operational-store';
import { Card, PageHeader, Section } from '@/shared/components/campo-livre-ui';
import { Calendar } from '@/shared/components/ui/calendar';

function isoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function Calendario() {
  const { state } = useMunicipalOperationalState();
  const approved = state.reservations.filter(
    (reservation) => reservation.status === 'APPROVED',
  );
  const [selectedDate, setSelectedDate] = useState(() => {
    const latestDate = approved
      .map((reservation) => reservation.date)
      .sort()
      .at(-1);
    const [year, month, day] = (latestDate ?? '2026-08-07')
      .split('-')
      .map(Number);
    return new Date(year!, month! - 1, day!);
  });
  const selectedIso = isoDate(selectedDate);
  const selectedLabel = formatMunicipalDate(selectedIso);
  const reservationsOfDay = approved.filter(
    (reservation) => reservation.date === selectedIso,
  );
  const eventDates = approved.map((reservation) => {
    const [year, month, day] = reservation.date.split('-').map(Number);
    return new Date(year!, month! - 1, day!);
  });

  return (
    <>
      <PageHeader
        title="Calendário de reservas"
        subtitle="Reservas aprovadas dos campos municipais"
      />

      <Card>
        <Calendar
          mode="single"
          locale={ptBR}
          defaultMonth={selectedDate}
          showOutsideDays={false}
          selected={selectedDate}
          onSelect={(nextDate) => nextDate && setSelectedDate(nextDate)}
          modifiers={{ hasEvent: eventDates }}
          modifiersClassNames={{
            hasEvent:
              'after:absolute after:bottom-0.5 after:left-1/2 after:h-1 after:w-1 after:-translate-x-1/2 after:rounded-full after:bg-navy-mid',
          }}
          className="p-0"
          classNames={{
            selected:
              'bg-navy-mid text-white hover:bg-navy-mid hover:text-white rounded-md',
          }}
        />
      </Card>

      <Section title={`Reservas de ${selectedLabel}`}>
        {reservationsOfDay.map((reservation) => (
          <article
            key={reservation.id}
            aria-label={`${reservation.championship} em ${reservation.field}`}
          >
            <Card className="space-y-1">
              <h2 className="flex items-center gap-1 font-display font-semibold text-foreground">
                <MapPin className="h-4 w-4 text-navy-mid" /> {reservation.field}
              </h2>
              <p className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {reservation.start}–
                  {reservation.end}
                </span>
                <span>{reservation.championship}</span>
                <span>{reservation.organizer}</span>
              </p>
            </Card>
          </article>
        ))}
        {reservationsOfDay.length === 0 ? (
          <p className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
            Nenhuma reserva aprovada nesta data.
          </p>
        ) : null}
      </Section>
    </>
  );
}

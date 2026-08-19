'use client';

import { useState } from 'react';
import { ptBR } from 'date-fns/locale';

import {
  Card,
  Field,
  PageHeader,
  Section,
} from '@/shared/components/campo-livre-ui';
import { Button } from '@/shared/components/ui/button';
import { Calendar } from '@/shared/components/ui/calendar';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/shared/components/ui/toggle-group';
import { campos, partidas } from '@/mocks/data';
import { cn } from '@/shared/lib/utils';

const agosto2026 = new Date(2026, 7, 1);
const horarios = ['09:00', '11:00', '14:00', '15:00', '17:00', '19:00'];

export function AgendarPartidas() {
  const [data, setData] = useState(new Date(2026, 7, 14));
  const [hora, setHora] = useState('15:00');
  const [campo, setCampo] = useState(String(campos[0]?.id ?? ''));
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const pendentes = partidas.filter((p) => !p.agendada);
  const dia = data.getDate();

  return (
    <>
      <PageHeader title="Agendar partidas" subtitle="Agosto de 2026" />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <p className="mb-3 font-display font-semibold text-foreground">
            Selecione a data
          </p>
          <Calendar
            mode="single"
            locale={ptBR}
            month={agosto2026}
            hideNavigation
            showOutsideDays={false}
            selected={data}
            onSelect={(nextDate) => nextDate && setData(nextDate)}
            className="p-0"
            classNames={{ selected: 'bg-green-mid text-white rounded-md' }}
          />
        </Card>

        <Card>
          <p className="mb-3 font-display font-semibold text-foreground">
            Selecione o horário
          </p>
          <ToggleGroup
            type="single"
            value={hora}
            onValueChange={(nextHora) => nextHora && setHora(nextHora)}
            aria-label="Selecione o horário"
            variant="outline"
            className="grid grid-cols-3 gap-2"
          >
            {horarios.map((horario) => (
              <ToggleGroupItem
                key={horario}
                value={horario}
                className="h-auto rounded-xl px-3 py-2.5 font-display text-sm data-[state=on]:border-green-mid data-[state=on]:bg-green-pale data-[state=on]:font-semibold data-[state=on]:text-green-dark"
              >
                {horario}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <div className="mt-4">
            <Field label="Campo" htmlFor="campo-field">
              <Select value={campo} onValueChange={setCampo}>
                <SelectTrigger id="campo-field">
                  <SelectValue placeholder="Selecione um campo" />
                </SelectTrigger>
                <SelectContent>
                  {campos.map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      {item.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </Card>
      </div>

      <Section title="Partidas pendentes de agendamento">
        <RadioGroup
          value={selecionada}
          onValueChange={setSelecionada}
          aria-label="Partidas pendentes de agendamento"
          className="gap-3"
        >
          {pendentes.map((partida) => (
            <RadioGroupItem
              key={partida.id}
              value={String(partida.id)}
              aria-label={`${partida.casa} vs ${partida.fora}, ${partida.rodada}`}
              className="h-auto w-full rounded-lg border-0 text-left shadow-none"
            >
              <Card
                className={cn(
                  'flex w-full items-center justify-between gap-3',
                  selecionada === String(partida.id) &&
                    'border-green-mid bg-green-pale',
                )}
              >
                <span className="min-w-0 truncate font-display text-sm font-semibold">
                  {partida.casa} vs {partida.fora}
                </span>
                <span className="text-xs text-muted-foreground">
                  {partida.rodada}
                </span>
              </Card>
            </RadioGroupItem>
          ))}
        </RadioGroup>
      </Section>

      <Button variant="campo" className="w-full">
        Salvar Data e Horário — {String(dia).padStart(2, '0')}/08/2026 às {hora}
      </Button>
    </>
  );
}

import { useState } from 'react';

import {
  Card,
  Field,
  PageHeader,
  PrimaryButton,
  Section,
} from '@/shared/components/campo-livre-ui';
import { Button } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { campos, partidas } from '@/mocks/data';
import { cn } from '@/shared/lib/utils';

const dias = Array.from({ length: 31 }, (_, i) => i + 1);
const horarios = ['09:00', '11:00', '14:00', '15:00', '17:00', '19:00'];

export function AgendarPartidas() {
  const [dia, setDia] = useState(14);
  const [hora, setHora] = useState('15:00');
  const [campo, setCampo] = useState(String(campos[0]?.id ?? ''));
  const [selecionada, setSelecionada] = useState<number | null>(null);
  const pendentes = partidas.filter((p) => !p.agendada);

  return (
    <>
      <PageHeader title="Agendar partidas" subtitle="Agosto de 2026" />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <p className="mb-3 font-display font-semibold text-foreground">
            Selecione a data
          </p>
          <div className="grid grid-cols-7 gap-1.5">
            {dias.map((d) => (
              <Button
                key={d}
                type="button"
                variant={dia === d ? 'default' : 'ghost'}
                onClick={() => setDia(d)}
                className={cn(
                  'aspect-square h-auto rounded-lg p-0 text-sm',
                  dia === d
                    ? 'bg-green-mid hover:bg-green-mid'
                    : 'hover:bg-surface',
                )}
              >
                {d}
              </Button>
            ))}
          </div>
        </Card>

        <Card>
          <p className="mb-3 font-display font-semibold text-foreground">
            Selecione o horário
          </p>
          <div className="grid grid-cols-3 gap-2">
            {horarios.map((h) => (
              <Button
                key={h}
                type="button"
                variant="outline"
                onClick={() => setHora(h)}
                className={cn(
                  'h-auto rounded-xl px-3 py-2.5 font-display text-sm',
                  hora === h &&
                    'border-green-mid bg-green-pale font-semibold text-green-dark hover:bg-green-pale hover:text-green-dark',
                )}
              >
                {h}
              </Button>
            ))}
          </div>
          <div className="mt-4">
            <Field label="Campo">
              <Select value={campo} onValueChange={setCampo}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um campo" />
                </SelectTrigger>
                <SelectContent>
                  {campos.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </Card>
      </div>

      <Section title="Partidas pendentes de agendamento">
        {pendentes.map((p) => (
          <Button
            key={p.id}
            type="button"
            variant="ghost"
            onClick={() => setSelecionada(p.id)}
            className="h-auto w-full justify-between rounded-none p-0 text-left hover:bg-transparent"
          >
            <Card
              className={cn(
                'flex w-full items-center justify-between gap-3',
                selecionada === p.id && 'border-green-mid bg-green-pale',
              )}
            >
              <span className="min-w-0 truncate font-display text-sm font-semibold">
                {p.casa} vs {p.fora}
              </span>
              <span className="text-xs text-muted-foreground">{p.rodada}</span>
            </Card>
          </Button>
        ))}
      </Section>

      <PrimaryButton className="w-full">
        Salvar Data e Horário — {String(dia).padStart(2, '0')}/08/2026 às {hora}
      </PrimaryButton>
    </>
  );
}

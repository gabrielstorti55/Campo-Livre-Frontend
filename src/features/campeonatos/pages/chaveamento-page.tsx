'use client';

import {
  Card,
  Initials,
  PageHeader,
  Section,
} from '@/shared/components/campo-livre-ui';
import { bracket, times } from '@/mocks/data';
import { Button } from '@/shared/components/ui/button';

function Confronto({ a, b, placar }: { a: string; b: string; placar: string }) {
  return (
    <Card className="p-3">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="min-w-0 truncate font-display font-semibold">{a}</span>
        <span className="shrink-0 text-xs text-muted-foreground">{placar}</span>
      </div>
      <div className="mt-1 min-w-0 truncate font-display text-sm font-semibold">
        {b}
      </div>
    </Card>
  );
}

export function Chaveamento() {
  return (
    <>
      <PageHeader title="Chaveamento" subtitle="Fase eliminatória" />

      <Section title="Times inscritos">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {times.map((t) => (
            <Card key={t.id} className="flex items-center gap-2 p-3">
              <Initials name={t.nome} className="h-8 w-8 text-[10px]" />
              <span className="min-w-0 truncate font-display text-sm">
                {t.nome}
              </span>
            </Card>
          ))}
        </div>
      </Section>

      <div className="overflow-x-auto">
        <div className="grid min-w-[720px] grid-cols-3 gap-6">
          <div className="space-y-3">
            <h3 className="font-display text-sm font-semibold text-muted-foreground">
              Quartas
            </h3>
            {bracket.quartas.map((c, i) => (
              <Confronto key={i} {...c} />
            ))}
          </div>
          <div className="flex flex-col justify-around gap-3">
            <h3 className="font-display text-sm font-semibold text-muted-foreground">
              Semifinal
            </h3>
            {bracket.semis.map((c, i) => (
              <Confronto key={i} {...c} />
            ))}
          </div>
          <div className="flex flex-col justify-center gap-3">
            <h3 className="font-display text-sm font-semibold text-muted-foreground">
              Final
            </h3>
            {bracket.final.map((c, i) => (
              <Confronto key={i} {...c} />
            ))}
          </div>
        </div>
      </div>

      <Button variant="campo" className="w-full">
        Confirmar chaveamento
      </Button>
    </>
  );
}

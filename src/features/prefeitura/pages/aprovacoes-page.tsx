'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';

import { StatusBadge } from '@/shared/components/status-badge';
import {
  PageHeader,
  Section,
  StatCard,
} from '@/shared/components/campo-livre-ui';
import {
  aprovacoesPendentes,
  aprovacoesRecentes,
  prefeituraStats,
} from '@/mocks/data';

export function Aprovacoes() {
  const [decididos, setDecididos] = useState<Record<number, string>>({});
  const pendentes = aprovacoesPendentes.filter((item) => !decididos[item.id]);

  return (
    <>
      <PageHeader
        title="Painel de aprovação"
        subtitle="Solicitações de uso dos campos municipais"
      />

      <div className="grid grid-cols-3 gap-x-4 sm:gap-x-6">
        <StatCard label="Pendentes" value={pendentes.length} tone="navy" />
        <StatCard
          label="Aguardando análise"
          value={prefeituraStats.eventosAgendados}
          tone="navy"
        />
        <StatCard
          label="Reprovados"
          value={prefeituraStats.reprovados}
          tone="navy"
        />
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.6fr)]">
        <Section title="Aguardando análise">
          <div className="border-t border-border">
            {pendentes.map((item) => (
              <article
                key={item.id}
                className="space-y-4 border-b border-border py-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-foreground">
                      {item.campeonato}
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {item.organizador} · {item.campo} · {item.horario} ·{' '}
                      {item.vagas} vagas
                    </p>
                  </div>
                  <StatusBadge status="Pendente" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="campo"
                    aria-label={`Aprovar solicitação de ${item.campeonato}`}
                    onClick={() =>
                      setDecididos({ ...decididos, [item.id]: 'Aprovado' })
                    }
                  >
                    Aprovar
                  </Button>
                  <Button
                    variant="campoOutline"
                    tone="danger"
                    aria-label={`Reprovar solicitação de ${item.campeonato}`}
                    onClick={() =>
                      setDecididos({ ...decididos, [item.id]: 'Reprovado' })
                    }
                  >
                    Reprovar
                  </Button>
                </div>
              </article>
            ))}
            {pendentes.length === 0 ? (
              <p className="py-6 text-sm text-muted-foreground">
                Nenhuma solicitação pendente.
              </p>
            ) : null}
          </div>
        </Section>

        <Section title="Aprovados recentemente">
          <div className="border-t border-border">
            {aprovacoesRecentes.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 border-b border-border py-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {item.campeonato}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.organizador}
                  </p>
                </div>
                <StatusBadge status="Aprovado" />
              </div>
            ))}
          </div>
        </Section>
      </div>
    </>
  );
}

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';

import { StatusBadge } from '@/shared/components/status-badge';
import {
  Card,
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
  const pendentes = aprovacoesPendentes.filter((a) => !decididos[a.id]);

  return (
    <>
      <PageHeader
        title="Painel de aprovação"
        subtitle="Solicitações de uso de campos"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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

      <Section title="Aguardando análise">
        {pendentes.map((a) => (
          <Card key={a.id} className="space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-display font-semibold text-foreground">
                  {a.campeonato}
                </p>
                <p className="text-xs text-muted-foreground">
                  {a.organizador} · {a.campo} · {a.horario} · {a.vagas} vagas
                </p>
              </div>
              <StatusBadge status="Pendente" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="campo"
                className="py-2.5"
                onClick={() =>
                  setDecididos({ ...decididos, [a.id]: 'Aprovado' })
                }
              >
                Aprovar
              </Button>
              <Button
                variant="campoOutline"
                tone="danger"
                className="py-2.5"
                onClick={() =>
                  setDecididos({ ...decididos, [a.id]: 'Reprovado' })
                }
              >
                Reprovar
              </Button>
            </div>
          </Card>
        ))}
        {pendentes.length === 0 ? (
          <Card className="text-center text-sm text-muted-foreground">
            Nenhuma solicitação pendente.
          </Card>
        ) : null}
      </Section>

      <Section title="Aprovados recentemente">
        {aprovacoesRecentes.map((a) => (
          <Card key={a.id} className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-display font-semibold text-foreground">
                {a.campeonato}
              </p>
              <p className="text-xs text-muted-foreground">{a.organizador}</p>
            </div>
            <StatusBadge status="Aprovado" />
          </Card>
        ))}
      </Section>
    </>
  );
}

'use client';

import { useState } from 'react';

import {
  PageHeader,
  Section,
  StatCard,
} from '@/shared/components/campo-livre-ui';
import { StatusBadge } from '@/shared/components/status-badge';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  aprovacoesPendentes,
  aprovacoesRecentes,
  prefeituraStats,
} from '@/mocks/data';

type Decisao = {
  id: number;
  campeonato: string;
  estado: 'Aprovado' | 'Reprovado';
  motivo?: string;
};

export function Aprovacoes() {
  const [decisoes, setDecisoes] = useState<Decisao[]>([]);
  const [rejeitandoId, setRejeitandoId] = useState<number | null>(null);
  const [motivo, setMotivo] = useState('');
  const decididos = new Set(decisoes.map((item) => item.id));
  const pendentes = aprovacoesPendentes.filter(
    (item) => !decididos.has(item.id),
  );

  function aprovar(id: number, campeonato: string) {
    setDecisoes((atuais) => [
      { id, campeonato, estado: 'Aprovado' },
      ...atuais,
    ]);
  }

  function confirmarRecusa(id: number, campeonato: string) {
    const justificativa = motivo.trim();
    if (!justificativa) return;
    setDecisoes((atuais) => [
      { id, campeonato, estado: 'Reprovado', motivo: justificativa },
      ...atuais,
    ]);
    setRejeitandoId(null);
    setMotivo('');
  }

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
                <p className="text-xs text-muted-foreground">
                  A aprovação deve respeitar estado do campo,
                  indisponibilidades, antecedência mínima de 24 horas e ausência
                  de conflito.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="campo"
                    aria-label={`Aprovar solicitação de ${item.campeonato}`}
                    onClick={() => aprovar(item.id, item.campeonato)}
                  >
                    Aprovar
                  </Button>
                  <Button
                    variant="campoOutline"
                    tone="danger"
                    aria-label={`Reprovar solicitação de ${item.campeonato}`}
                    onClick={() => {
                      setRejeitandoId(item.id);
                      setMotivo('');
                    }}
                  >
                    Reprovar
                  </Button>
                </div>
                {rejeitandoId === item.id ? (
                  <div className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-4">
                    <label
                      htmlFor={`motivo-recusa-${item.id}`}
                      className="block text-sm font-semibold text-red-950"
                    >
                      Motivo da recusa
                    </label>
                    <Textarea
                      id={`motivo-recusa-${item.id}`}
                      value={motivo}
                      onChange={(event) => setMotivo(event.target.value)}
                      placeholder="Informe uma justificativa objetiva"
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="campo"
                        tone="danger"
                        disabled={!motivo.trim()}
                        onClick={() =>
                          confirmarRecusa(item.id, item.campeonato)
                        }
                      >
                        Confirmar recusa
                      </Button>
                      <Button
                        variant="campoOutline"
                        onClick={() => setRejeitandoId(null)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : null}
              </article>
            ))}
            {pendentes.length === 0 ? (
              <p className="py-6 text-sm text-muted-foreground">
                Nenhuma solicitação pendente.
              </p>
            ) : null}
          </div>
        </Section>

        <Section title="Aprovados anteriormente">
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

      <section className="mt-10" aria-label="Histórico de decisões">
        <Section title="Histórico de decisões">
          {decisoes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma decisão nesta sessão.
            </p>
          ) : (
            <div className="space-y-3">
              {decisoes.map((item) => (
                <article
                  key={`${item.id}-${item.estado}`}
                  className="rounded-xl border border-border p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{item.campeonato}</p>
                    <StatusBadge status={item.estado} />
                  </div>
                  {item.motivo ? (
                    <p className="mt-2 text-sm">{item.motivo}</p>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </Section>
      </section>
    </>
  );
}

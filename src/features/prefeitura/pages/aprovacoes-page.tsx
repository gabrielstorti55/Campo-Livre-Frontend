'use client';

import { useState } from 'react';

import {
  formatMunicipalDate,
  useMunicipalOperationalState,
  type MunicipalReservation,
} from '@/features/prefeitura/state/municipal-operational-store';
import {
  PageHeader,
  Section,
  StatCard,
} from '@/shared/components/campo-livre-ui';
import { StatusBadge } from '@/shared/components/status-badge';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';

function statusLabel(status: MunicipalReservation['status']) {
  if (status === 'APPROVED') return 'Aprovado' as const;
  if (status === 'REJECTED') return 'Reprovado' as const;
  if (status === 'PENDING') return 'Pendente' as const;
  return 'Encerrado' as const;
}

export function Aprovacoes() {
  const { state, decideReservation } = useMunicipalOperationalState();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [feedback, setFeedback] = useState('');
  const visible = state.reservations.filter(
    (item) => item.status !== 'CANCELLED',
  );
  const pending = visible.filter((item) => item.status === 'PENDING');
  const rejected = visible.filter((item) => item.status === 'REJECTED');
  const approved = visible.filter((item) => item.status === 'APPROVED');

  function approve(id: string) {
    const result = decideReservation(id, 'APPROVED');
    if (result === 'FIELD_UNAVAILABLE') {
      setFeedback('Aprovação bloqueada: o campo está em manutenção.');
    } else if (result === 'CONFLICT') {
      setFeedback('Aprovação bloqueada: existe conflito de horário no campo.');
    } else if (result === 'OK') {
      setFeedback('Reserva aprovada e incluída no calendário municipal.');
    }
  }

  function reject(id: string) {
    const result = decideReservation(id, 'REJECTED', reason);
    if (result !== 'OK') return;
    setRejectingId(null);
    setReason('');
    setFeedback('Reserva recusada com justificativa registrada.');
  }

  return (
    <>
      <PageHeader
        title="Painel de aprovação"
        subtitle="Solicitações de uso dos campos municipais"
      />

      <div className="grid grid-cols-3 gap-x-4 sm:gap-x-6">
        <StatCard label="Pendentes" value={pending.length} tone="navy" />
        <StatCard label="Aprovados" value={approved.length} tone="navy" />
        <StatCard label="Reprovados" value={rejected.length} tone="navy" />
      </div>

      {feedback ? (
        <p
          role="status"
          className="rounded-xl bg-blue-50 p-3 text-sm font-semibold text-navy-mid"
        >
          {feedback}
        </p>
      ) : null}

      <Section title="Solicitações e decisões">
        <div className="border-t border-border">
          {visible.map((item) => {
            const date = formatMunicipalDate(item.date);
            const label = `${item.championship} · ${item.organizer} · ${item.field} · ${date} · ${item.start}–${item.end}`;
            const isPending = item.status === 'PENDING';
            return (
              <article
                key={item.id}
                aria-label={label}
                className="space-y-4 border-b border-border py-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground">
                      {item.championship}
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {item.organizer} · {item.field} · {date} · {item.start}–
                      {item.end}
                    </p>
                  </div>
                  <StatusBadge status={statusLabel(item.status)} />
                </div>

                {item.reason ? <p className="text-sm">{item.reason}</p> : null}

                {isPending ? (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="campo"
                      aria-label={`Aprovar solicitação de ${item.championship} para ${item.field}`}
                      onClick={() => approve(item.id)}
                    >
                      Aprovar
                    </Button>
                    <Button
                      variant="campoOutline"
                      tone="danger"
                      aria-label={`Reprovar solicitação de ${item.championship} para ${item.field}`}
                      aria-expanded={rejectingId === item.id}
                      aria-controls={`rejection-${item.id}`}
                      onClick={() => {
                        setRejectingId(item.id);
                        setReason('');
                      }}
                    >
                      Reprovar
                    </Button>
                  </div>
                ) : null}

                {rejectingId === item.id ? (
                  <div
                    id={`rejection-${item.id}`}
                    className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-4"
                  >
                    <label
                      htmlFor={`reason-${item.id}`}
                      className="block text-sm font-semibold text-red-950"
                    >
                      Motivo da recusa
                    </label>
                    <Textarea
                      autoFocus
                      id={`reason-${item.id}`}
                      value={reason}
                      onChange={(event) => setReason(event.target.value)}
                      placeholder="Informe uma justificativa objetiva"
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="campo"
                        tone="danger"
                        disabled={!reason.trim()}
                        onClick={() => reject(item.id)}
                      >
                        Confirmar recusa
                      </Button>
                      <Button
                        variant="campoOutline"
                        onClick={() => setRejectingId(null)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
          {visible.length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground">
              Nenhuma solicitação encontrada.
            </p>
          ) : null}
        </div>
      </Section>
    </>
  );
}

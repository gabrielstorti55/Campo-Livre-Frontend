'use client';

import { useRef, useState } from 'react';

import {
  formatarDataMunicipal,
  useEstadoOperacionalPrefeitura,
  type ReservaMunicipal,
} from '@/stores/estado-operacional-prefeitura';
import { CabecalhoPagina } from '@/components/layout/cabecalho-pagina';
import { Secao } from '@/components/layout/secao';
import { CartaoEstatistica } from '@/components/layout/cartao-estatistica';
import { IndicadorSituacao } from '@/components/layout/indicador-situacao';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

function statusLabel(status: ReservaMunicipal['status']) {
  if (status === 'APPROVED') return 'Aprovado' as const;
  if (status === 'REJECTED') return 'Reprovado' as const;
  if (status === 'PENDING') return 'Pendente' as const;
  return 'Encerrado' as const;
}

export function TelaAprovarReservas() {
  const { state, decideReservation } = useEstadoOperacionalPrefeitura();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [feedback, setFeedback] = useState('');
  const feedbackRef = useRef<HTMLParagraphElement>(null);
  const rejectButtonRefs = useRef(new Map<string, HTMLButtonElement>());
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
    } else if (result === 'MINIMUM_NOTICE') {
      setFeedback(
        'Aprovação bloqueada: a reserva não possui mais 24 horas de antecedência.',
      );
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
    requestAnimationFrame(() => feedbackRef.current?.focus());
  }

  return (
    <>
      <CabecalhoPagina
        title="Painel de aprovação"
        subtitle="Solicitações de uso dos campos municipais"
      />

      <div className="grid grid-cols-3 gap-x-4 sm:gap-x-6">
        <CartaoEstatistica
          label="Pendentes"
          value={pending.length}
          tone="navy"
        />
        <CartaoEstatistica
          label="Aprovados"
          value={approved.length}
          tone="navy"
        />
        <CartaoEstatistica
          label="Reprovados"
          value={rejected.length}
          tone="navy"
        />
      </div>

      {feedback ? (
        <p
          ref={feedbackRef}
          role="status"
          tabIndex={-1}
          className="rounded-md bg-blue-50 p-3 text-sm font-semibold text-navy-mid"
        >
          {feedback}
        </p>
      ) : null}

      <Secao title="Solicitações e decisões">
        <div className="border-t border-border">
          {visible.map((item) => {
            const date = formatarDataMunicipal(item.date);
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
                  <IndicadorSituacao status={statusLabel(item.status)} />
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
                      ref={(node) => {
                        if (node) rejectButtonRefs.current.set(item.id, node);
                        else rejectButtonRefs.current.delete(item.id);
                      }}
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
                    className="space-y-3 rounded-md border border-red-200 bg-red-50 p-4"
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
                        onClick={() => {
                          setRejectingId(null);
                          requestAnimationFrame(() =>
                            rejectButtonRefs.current.get(item.id)?.focus(),
                          );
                        }}
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
      </Secao>
    </>
  );
}

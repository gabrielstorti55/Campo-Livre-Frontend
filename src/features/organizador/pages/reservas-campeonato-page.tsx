'use client';

import { useState } from 'react';

import { useSession } from '@/features/auth/session/session-context';
import { organizerCatalogMock } from '@/features/organizador/services/organizer-catalog.mock';
import { respeitaAntecedenciaMinima } from '@/features/organizador/services/reservation-clock';
import { useOrganizerOperationalState } from '@/features/organizador/state/organizer-operational-store';
import {
  cancelMunicipalReservation,
  registerMunicipalReservation,
  useMunicipalOperationalState,
} from '@/features/prefeitura/state/municipal-operational-store';
import { PageHeader } from '@/shared/components/campo-livre-ui';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';

export function ReservasCampeonatoPage({
  campeonatoId,
}: {
  campeonatoId: string;
}) {
  const { session, hydrated } = useSession();
  const operacional = useOrganizerOperationalState(Number(campeonatoId));
  const municipal = useMunicipalOperationalState();
  const campeonato = organizerCatalogMock.obterCampeonato(
    campeonatoId,
    session?.account.id ?? '',
    session?.links.organizedChampionshipIds ?? [],
  );

  const [fieldId, setFieldId] = useState('1');
  const [data, setData] = useState('');
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  const [feedback, setFeedback] = useState('');

  if (!hydrated) return <p role="status">Carregando reservas...</p>;
  if (!campeonato) return <h1>Sem acesso administrativo</h1>;
  const reservasLocais =
    operacional.estado?.reservas ??
    organizerCatalogMock.listarReservas(Number(campeonatoId));
  const reservasCompartilhadas = municipal.state.reservations.filter(
    (item) =>
      item.championshipId === Number(campeonatoId) &&
      item.organizerAccountId === session?.account.id,
  );
  const reservas = [
    ...reservasLocais.map((reserva) => {
      const compartilhada = reservasCompartilhadas.find(
        (item) => item.localReservationId === reserva.id,
      );
      return compartilhada
        ? {
            ...reserva,
            estado:
              compartilhada.status === 'APPROVED'
                ? ('APROVADA' as const)
                : compartilhada.status === 'REJECTED'
                  ? ('RECUSADA' as const)
                  : compartilhada.status === 'CANCELLED'
                    ? ('CANCELADA' as const)
                    : ('PENDENTE' as const),
            motivo: compartilhada.reason,
          }
        : reserva;
    }),
    ...reservasCompartilhadas
      .filter(
        (item) =>
          item.localReservationId !== undefined &&
          !reservasLocais.some(
            (reserva) => item.localReservationId === reserva.id,
          ),
      )
      .map((item) => ({
        id: item.localReservationId ?? 0,
        campeonatoId: item.championshipId,
        campo: item.field,
        data: item.date,
        inicio: item.start,
        fim: item.end,
        estado:
          item.status === 'APPROVED'
            ? ('APROVADA' as const)
            : item.status === 'REJECTED'
              ? ('RECUSADA' as const)
              : item.status === 'CANCELLED'
                ? ('CANCELADA' as const)
                : ('PENDENTE' as const),
        motivo: item.reason,
      })),
  ];
  const responsavel = operacional.estado
    ? operacional.estado.responsavelContaId === session?.account.id
    : campeonato.papelDaConta === 'RESPONSAVEL';
  const estadoCampeonato = operacional.estado?.estado ?? campeonato.estado;
  const podeOperarLifecycle =
    estadoCampeonato === 'EM_CONFIGURACAO' ||
    estadoCampeonato === 'EM_ANDAMENTO';
  const credentialActive = municipal.state.organizers.some(
    (organizer) =>
      organizer.accountId === session?.account.id &&
      organizer.status === 'ACTIVE',
  );

  function solicitar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!credentialActive) {
      setFeedback('Seu credenciamento municipal está suspenso.');
      return;
    }
    if (!respeitaAntecedenciaMinima(`${data}T${inicio}:00`)) {
      setFeedback('A reserva exige pelo menos 24 horas de antecedência.');
      return;
    }
    if (fim <= inicio) {
      setFeedback('O horário final deve ser posterior ao horário inicial.');
      return;
    }
    const reservationId =
      Math.max(0, ...reservasLocais.map((item) => item.id)) + 1;
    const field = municipal.state.fields.find((item) => item.id === fieldId);
    if (!field || field.status !== 'AVAILABLE') {
      setFeedback('Selecione um campo municipal disponível.');
      return;
    }
    const registered = registerMunicipalReservation({
      id: `${session?.account.id}:${campeonatoId}:${reservationId}`,
      localReservationId: reservationId,
      championshipId: Number(campeonatoId),
      championship: campeonato?.nome ?? 'Campeonato',
      organizerAccountId: session?.account.id ?? '',
      organizer: session?.account.name ?? 'Organizador',
      fieldId: field.id,
      field: field.name,
      date: data,
      start: inicio,
      end: fim,
    });
    if (!registered) {
      setFeedback('A solicitação já existe e não foi alterada.');
      return;
    }
    operacional.solicitarReserva({
      campo: field.name,
      data,
      inicio,
      fim,
    });
    setFeedback('Solicitação de reserva criada localmente como PENDENTE.');
  }

  return (
    <>
      <PageHeader
        title={`Reservas · ${campeonato.nome}`}
        subtitle="Solicitações vinculadas ao campeonato; aprovação pertence à Prefeitura"
      />

      <section aria-label="Reservas do campeonato" className="space-y-3">
        {reservas.length === 0 ? (
          <p className="rounded-2xl border border-dashed p-5 text-sm text-muted-foreground">
            Nenhuma reserva vinculada a este campeonato.
          </p>
        ) : (
          reservas.map((reserva) => (
            <article
              key={reserva.id}
              aria-label={`${reserva.campo} · ${reserva.data.split('-').reverse().join('/')} · ${reserva.inicio}–${reserva.fim}`}
            >
              <Card className="p-5">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <h2 className="font-display text-lg font-semibold">
                      {reserva.campo}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {reserva.data} · {reserva.inicio}–{reserva.fim}
                    </p>
                    <p className="mt-1 text-sm font-semibold">
                      {reserva.estado}
                    </p>
                  </div>
                  {credentialActive &&
                  podeOperarLifecycle &&
                  responsavel &&
                  (reserva.estado === 'APROVADA' ||
                    reserva.estado === 'PENDENTE') &&
                  respeitaAntecedenciaMinima(
                    `${reserva.data}T${reserva.inicio}:00`,
                  ) ? (
                    <Button
                      variant="campoOutline"
                      aria-label={`Cancelar reserva ${reserva.id}`}
                      onClick={() => {
                        operacional.cancelarReserva(reserva.id);
                        const shared = reservasCompartilhadas.find(
                          (item) => item.localReservationId === reserva.id,
                        );
                        if (shared) cancelMunicipalReservation(shared.id);
                        setFeedback('Reserva cancelada localmente.');
                      }}
                    >
                      Cancelar reserva
                    </Button>
                  ) : null}
                </div>
              </Card>
            </article>
          ))
        )}
      </section>

      {!credentialActive ? (
        <Card className="mt-8 p-5">
          <h2 className="font-display text-xl font-semibold">
            Credenciamento suspenso
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Novas solicitações e cancelamentos ficam indisponíveis até a
            reativação pela Prefeitura.
          </p>
        </Card>
      ) : podeOperarLifecycle ? (
        <Card className="mt-8 p-5">
          <h2 className="font-display text-xl font-semibold">
            Solicitar nova reserva
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            O envio cria uma solicitação pendente. Não confirma disponibilidade
            nem aprovação. Solicitações e cancelamentos exigem pelo menos 24
            horas de antecedência; o cancelamento é exclusivo do responsável.
          </p>
          <form onSubmit={solicitar} className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold" htmlFor="campo-reserva">
              Campo
              <select
                id="campo-reserva"
                className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 font-normal"
                value={fieldId}
                onChange={(event) => setFieldId(event.target.value)}
              >
                {municipal.state.fields
                  .filter((field) => field.status === 'AVAILABLE')
                  .map((field) => (
                    <option key={field.id} value={field.id}>
                      {field.name}
                    </option>
                  ))}
              </select>
            </label>
            <label className="text-sm font-semibold" htmlFor="data-reserva">
              Data da reserva
              <Input
                id="data-reserva"
                className="mt-2"
                type="date"
                required
                value={data}
                onChange={(event) => setData(event.target.value)}
              />
            </label>
            <label className="text-sm font-semibold" htmlFor="inicio-reserva">
              Hora inicial
              <Input
                id="inicio-reserva"
                className="mt-2"
                type="time"
                required
                value={inicio}
                onChange={(event) => setInicio(event.target.value)}
              />
            </label>
            <label className="text-sm font-semibold" htmlFor="fim-reserva">
              Hora final
              <Input
                id="fim-reserva"
                className="mt-2"
                type="time"
                required
                value={fim}
                onChange={(event) => setFim(event.target.value)}
              />
            </label>
            <Button type="submit" variant="campo" className="sm:col-span-2">
              Solicitar reserva
            </Button>
          </form>
        </Card>
      ) : (
        <Card className="mt-8 p-5">
          <h2 className="font-display text-xl font-semibold">
            Histórico somente leitura
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Campeonatos encerrados ou cancelados não aceitam novas solicitações
            nem cancelamentos de reserva.
          </p>
        </Card>
      )}

      {feedback ? (
        <p
          role="status"
          className="mt-5 rounded-xl bg-green-pale p-3 text-sm font-semibold text-green-dark"
        >
          {feedback}
        </p>
      ) : null}
    </>
  );
}

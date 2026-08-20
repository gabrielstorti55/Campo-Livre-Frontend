'use client';

import { useState } from 'react';

import { useSession } from '@/features/auth/session/session-context';
import { organizerCatalogMock } from '@/features/organizador/services/organizer-catalog.mock';
import { respeitaAntecedenciaMinima } from '@/features/organizador/services/reservation-clock';
import { useOrganizerOperationalState } from '@/features/organizador/state/organizer-operational-store';
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
  const campeonato = organizerCatalogMock.obterCampeonato(
    campeonatoId,
    session?.account.id ?? '',
    session?.links.organizedChampionshipIds ?? [],
  );

  const [campo, setCampo] = useState('Campo Vera Cruz');
  const [data, setData] = useState('');
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  const [feedback, setFeedback] = useState('');

  if (!hydrated) return <p role="status">Carregando reservas...</p>;
  if (!campeonato) return <h1>Sem acesso administrativo</h1>;
  const reservas =
    operacional.estado?.reservas ??
    organizerCatalogMock.listarReservas(Number(campeonatoId));
  const responsavel = operacional.estado
    ? operacional.estado.responsavelContaId === session?.account.id
    : campeonato.papelDaConta === 'RESPONSAVEL';
  const estadoCampeonato = operacional.estado?.estado ?? campeonato.estado;
  const podeOperarLifecycle =
    estadoCampeonato === 'EM_CONFIGURACAO' ||
    estadoCampeonato === 'EM_ANDAMENTO';

  function solicitar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!respeitaAntecedenciaMinima(`${data}T${inicio}:00`)) {
      setFeedback('A reserva exige pelo menos 24 horas de antecedência.');
      return;
    }
    if (fim <= inicio) {
      setFeedback('O horário final deve ser posterior ao horário inicial.');
      return;
    }
    operacional.solicitarReserva({ campo, data, inicio, fim });
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
            <Card key={reserva.id} className="p-5">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="font-display text-lg font-semibold">
                    {reserva.campo}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {reserva.data} · {reserva.inicio}–{reserva.fim}
                  </p>
                  <p className="mt-1 text-sm font-semibold">{reserva.estado}</p>
                </div>
                {podeOperarLifecycle &&
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
                      setFeedback('Reserva cancelada localmente.');
                    }}
                  >
                    Cancelar reserva
                  </Button>
                ) : null}
              </div>
            </Card>
          ))
        )}
      </section>

      {podeOperarLifecycle ? (
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
                value={campo}
                onChange={(event) => setCampo(event.target.value)}
              >
                <option>Campo Vera Cruz</option>
                <option>Campo Santa Rita</option>
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

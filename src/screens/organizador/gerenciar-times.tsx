'use client';

import { useState } from 'react';

import { useSessao } from '@/hooks/use-sessao';
import { catalogoOrganizadorMock } from '@/services/organizador/catalogo-organizador.mock';
import { useEstadoOperacionalOrganizador } from '@/stores/estado-operacional-organizador';
import { catalogoPublicoMock } from '@/services/publico/catalogo-publico.mock';
import { CabecalhoPagina } from '@/components/layout/cabecalho-pagina';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function TelaGerenciarTimes({ campeonatoId }: { campeonatoId: string }) {
  const { session, hydrated } = useSessao();
  const operacional = useEstadoOperacionalOrganizador(Number(campeonatoId));
  const campeonato = catalogoOrganizadorMock.obterCampeonato(
    campeonatoId,
    session?.account.id ?? '',
    session?.links.organizedChampionshipIds ?? [],
  );
  const [timeConvidado, setTimeConvidado] = useState('Estrela Azul');
  const [feedback, setFeedback] = useState('');

  if (!hydrated) return <p role="status">Carregando participantes...</p>;
  if (!campeonato) return <h1>Sem acesso administrativo</h1>;

  const times = campeonato.timeIds
    .map((id) => catalogoPublicoMock.obterTime(id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const convites = operacional.estado?.convitesTimePendentes ?? [];
  const elencosValidados = !operacional.estado?.pendencias.includes(
    'Validar elencos inscritos',
  );

  return (
    <>
      <CabecalhoPagina
        title={`Times · ${campeonato.nome}`}
        subtitle="Participação exclusiva por convite ao capitão"
      />

      {(operacional.estado?.estado ?? campeonato.estado) ===
      'EM_CONFIGURACAO' ? (
        <Card className="mb-8 p-5">
          <h2 className="font-display text-xl font-semibold">Convidar time</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            O capitão só poderá aceitar depois da abertura das inscrições. Não
            existe solicitação aberta do time.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <label
              className="flex-1 text-sm font-semibold"
              htmlFor="time-convidado"
            >
              Time convidado
              <select
                id="time-convidado"
                className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 font-normal"
                value={timeConvidado}
                onChange={(event) => setTimeConvidado(event.target.value)}
              >
                <option>Estrela Azul</option>
                <option>Unidos do Vale</option>
              </select>
            </label>
            <Button
              variant="campo"
              className="self-end"
              disabled={convites.includes(timeConvidado)}
              onClick={() => {
                operacional.convidarTime(timeConvidado);
                setFeedback('Convite ao capitão enviado localmente.');
              }}
            >
              Convidar time
            </Button>
          </div>
          {convites.map((time) => (
            <div
              key={time}
              className="mt-3 flex items-center justify-between rounded-xl bg-muted p-3"
            >
              <p className="text-sm">{time} · Pendente</p>
              <Button
                size="sm"
                variant="campoOutline"
                aria-label={`Cancelar convite de ${time}`}
                onClick={() => operacional.cancelarConviteTime(time)}
              >
                Cancelar convite
              </Button>
            </div>
          ))}
        </Card>
      ) : null}

      <div className="space-y-4">
        {times.map(({ time, elenco }) => (
          <section key={time.id} aria-label={`Elenco inscrito de ${time.nome}`}>
            <Card className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-semibold">
                    {time.nome}
                  </h2>
                  <p className="mt-1 text-sm font-semibold">
                    Elenco inscrito no campeonato
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Limite: 7 a 18 atletas
                  </p>
                </div>
                <span className="rounded-full bg-green-pale px-3 py-1 text-xs font-semibold text-green-dark">
                  {elencosValidados ? 'Válido' : 'Pendente de validação'}
                </span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                A seleção do elenco específico pertence ao capitão. O
                organizador acompanha a composição e seus bloqueios sem alterar
                vínculos permanentes do time.
              </p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {elenco.map((atleta) => (
                  <li
                    key={atleta.id}
                    className="rounded-xl bg-muted p-3 text-sm"
                  >
                    {atleta.nome} · {atleta.posicao}
                  </li>
                ))}
              </ul>
            </Card>
          </section>
        ))}
      </div>

      {(operacional.estado?.estado ?? campeonato.estado) ===
      'EM_CONFIGURACAO' ? (
        <Button
          className="mt-5"
          variant="campoOutline"
          disabled={elencosValidados || times.length === 0}
          onClick={() => {
            operacional.validarElencos();
            setFeedback('Elencos validados no cenário operacional mock.');
          }}
        >
          Registrar validação dos elencos
        </Button>
      ) : null}

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

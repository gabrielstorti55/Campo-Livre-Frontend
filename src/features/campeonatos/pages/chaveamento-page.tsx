'use client';

import { useState } from 'react';

import { useSession } from '@/features/auth/session/session-context';
import { organizerCatalogMock } from '@/features/organizador/services/organizer-catalog.mock';
import { useOrganizerOperationalState } from '@/features/organizador/state/organizer-operational-store';
import { publicCatalogMock } from '@/features/publico/services/public-catalog.mock';
import {
  Card,
  Initials,
  PageHeader,
  Section,
} from '@/shared/components/campo-livre-ui';
import { Button } from '@/shared/components/ui/button';

export function Chaveamento({ campeonatoId }: { campeonatoId: string }) {
  const { session, hydrated } = useSession();
  const operacional = useOrganizerOperationalState(Number(campeonatoId));
  const campeonato = organizerCatalogMock.obterCampeonato(
    campeonatoId,
    session?.account.id ?? '',
    session?.links.organizedChampionshipIds ?? [],
  );
  const [modo, setModo] = useState<'AUTOMATICO' | 'MANUAL'>('AUTOMATICO');

  if (!hydrated) return <p role="status">Carregando estrutura...</p>;
  if (!campeonato) return <h1>Sem acesso administrativo</h1>;

  const times = campeonato.timeIds
    .map((id) => publicCatalogMock.obterTime(id)?.time)
    .filter((time): time is NonNullable<typeof time> => Boolean(time));
  const editavel =
    (operacional.estado?.estado ?? campeonato.estado) === 'EM_CONFIGURACAO';
  const gerado = operacional.estado?.programacaoGerada ?? false;

  return (
    <>
      <PageHeader
        title={`Estrutura · ${campeonato.nome}`}
        subtitle={`${campeonato.formato} · distribuição integral manual ou automática`}
      />

      <Section title="Times inscritos">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {times.map((time) => (
            <Card key={time.id} className="flex items-center gap-2 p-3">
              <Initials name={time.nome} className="h-8 w-8 text-[10px]" />
              <span className="min-w-0 truncate font-display text-sm">
                {time.nome}
              </span>
            </Card>
          ))}
        </div>
      </Section>

      <Card className="mb-6 p-5">
        <h2 className="font-display text-lg font-semibold">
          Modo de programação
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Uma programação automática é gerada integralmente e não recebe ajustes
          manuais parciais.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            variant={modo === 'AUTOMATICO' ? 'campo' : 'campoOutline'}
            disabled={!editavel || gerado}
            onClick={() => setModo('AUTOMATICO')}
          >
            Automática
          </Button>
          <Button
            variant={modo === 'MANUAL' ? 'campo' : 'campoOutline'}
            disabled={!editavel || gerado}
            onClick={() => setModo('MANUAL')}
          >
            Manual
          </Button>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="font-display text-lg font-semibold">
          {campeonato.formato === 'PONTOS_CORRIDOS'
            ? 'Rodadas e confrontos'
            : campeonato.formato === 'MATA_MATA'
              ? 'Chave eliminatória'
              : 'Grupos e fase eliminatória'}
        </h2>
        {gerado ? (
          <div className="mt-4 rounded-xl bg-green-pale p-4 text-sm text-green-dark">
            Estrutura {modo === 'AUTOMATICO' ? 'gerada' : 'confirmada'}{' '}
            localmente para {times.length} times. Folgas e avanços automáticos
            não criam partidas fictícias.
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            A estrutura ainda não foi materializada. A validação do campeonato
            continuará bloqueada.
          </p>
        )}
        <Button
          variant="campo"
          className="mt-5 w-full"
          disabled={!editavel || gerado || times.length < 2}
          onClick={() => operacional.gerarProgramacao()}
        >
          {modo === 'AUTOMATICO'
            ? 'Gerar programação completa'
            : 'Confirmar distribuição manual'}
        </Button>
      </Card>

      {gerado ? (
        <p role="status" className="mt-5 text-sm font-semibold text-green-dark">
          Programação preparada localmente; persistência futura permanece atrás
          do contrato da API.
        </p>
      ) : null}
    </>
  );
}

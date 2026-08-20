'use client';

import { useState } from 'react';

import { useSessao } from '@/hooks/use-sessao';
import { catalogoOrganizadorMock } from '@/services/organizador/catalogo-organizador.mock';
import { useEstadoOperacionalOrganizador } from '@/stores/estado-operacional-organizador';
import { catalogoPublicoMock } from '@/services/publico/catalogo-publico.mock';
import { Cartao } from '@/components/layout/cartao';
import { Iniciais } from '@/components/layout/iniciais';
import { CabecalhoPagina } from '@/components/layout/cabecalho-pagina';
import { Secao } from '@/components/layout/secao';
import { Button } from '@/components/ui/button';

export function TelaChaveamento({ campeonatoId }: { campeonatoId: string }) {
  const { session, hydrated } = useSessao();
  const operacional = useEstadoOperacionalOrganizador(Number(campeonatoId));
  const campeonato = catalogoOrganizadorMock.obterCampeonato(
    campeonatoId,
    session?.account.id ?? '',
    session?.links.organizedChampionshipIds ?? [],
  );
  const [modo, setModo] = useState<'AUTOMATICO' | 'MANUAL'>('AUTOMATICO');

  if (!hydrated) return <p role="status">Carregando estrutura...</p>;
  if (!campeonato) return <h1>Sem acesso administrativo</h1>;

  const times = campeonato.timeIds
    .map((id) => catalogoPublicoMock.obterTime(id)?.time)
    .filter((time): time is NonNullable<typeof time> => Boolean(time));
  const editavel =
    (operacional.estado?.estado ?? campeonato.estado) === 'EM_CONFIGURACAO';
  const gerado = operacional.estado?.programacaoGerada ?? false;

  return (
    <>
      <CabecalhoPagina
        title={`Estrutura · ${campeonato.nome}`}
        subtitle={`${campeonato.formato} · distribuição integral manual ou automática`}
      />

      <Secao title="Times inscritos">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {times.map((time) => (
            <Cartao key={time.id} className="flex items-center gap-2 p-3">
              <Iniciais name={time.nome} className="h-8 w-8 text-[10px]" />
              <span className="min-w-0 truncate font-display text-sm">
                {time.nome}
              </span>
            </Cartao>
          ))}
        </div>
      </Secao>

      <Cartao className="mb-6 p-5">
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
      </Cartao>

      <Cartao className="p-5">
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
      </Cartao>

      {gerado ? (
        <p role="status" className="mt-5 text-sm font-semibold text-green-dark">
          Programação preparada localmente; persistência futura permanece atrás
          do contrato da API.
        </p>
      ) : null}
    </>
  );
}

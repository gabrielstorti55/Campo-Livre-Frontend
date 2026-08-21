'use client';

import Link from 'next/link';
import { useState } from 'react';

import { useSessao } from '@/hooks/use-sessao';
import type {
  CampeonatoEstadoPublico,
  CampeonatoPublico,
} from '@/types/publico';
import { catalogoPublicoMock } from '@/services/publico/catalogo-publico.mock';
import { CabecalhoPagina } from '@/components/layout/cabecalho-pagina';
import { Secao } from '@/components/layout/secao';
import { Abas, obterIdAba } from '@/components/layout/abas';
import { IndicadorAvanco, ItemLista } from '@/components/layout/item-lista';
import { EstadoRecurso } from '@/components/layout/estado-recurso';
import { IndicadorSituacao } from '@/components/layout/indicador-situacao';

const statusLabel: Record<CampeonatoEstadoPublico, string> = {
  EM_CONFIGURACAO: 'Inscrições abertas',
  EM_ANDAMENTO: 'Em andamento',
  ENCERRADO: 'Encerrado',
  CANCELADO: 'Cancelado',
};

type AthleteEvent = {
  championship: CampeonatoPublico;
  teamNames: string[];
};

export function TelaMeusEventos() {
  const { session } = useSessao();
  const [tab, setTab] = useState('Ativos');
  const teamIds = session?.links.teamIds ?? ['1'];
  const eventMap = new Map<number, AthleteEvent>();

  for (const teamId of teamIds) {
    const teamProjection = catalogoPublicoMock.obterTime(teamId);
    if (!teamProjection) continue;

    for (const championship of teamProjection.campeonatos) {
      const current = eventMap.get(championship.id);
      eventMap.set(championship.id, {
        championship,
        teamNames: current
          ? [...current.teamNames, teamProjection.time.nome]
          : [teamProjection.time.nome],
      });
    }
  }

  const events = [...eventMap.values()].filter(({ championship }) =>
    tab === 'Ativos'
      ? championship.estado !== 'ENCERRADO' &&
        championship.estado !== 'CANCELADO'
      : championship.estado === 'ENCERRADO' ||
        championship.estado === 'CANCELADO',
  );

  return (
    <>
      <CabecalhoPagina
        title="Meus Eventos"
        subtitle="Campeonatos vinculados aos times dos quais você participa"
      />
      <Abas
        tabs={['Ativos', 'Encerrados']}
        active={tab}
        onChange={setTab}
        panelId="athlete-events-panel"
      />

      <Secao
        title={`Eventos ${tab}`}
        id="athlete-events-panel"
        role="tabpanel"
        labelledBy={obterIdAba('athlete-events-panel', tab)}
      >
        {events.length === 0 ? (
          <EstadoRecurso
            kind="empty"
            title={`Nenhum evento ${tab.toLocaleLowerCase('pt-BR')}`}
            description="Os campeonatos aparecem aqui somente depois que um dos seus times recebe e aceita o vínculo correspondente."
          />
        ) : (
          <div className="space-y-3">
            {events.map(({ championship, teamNames }) => (
              <Link
                key={championship.id}
                href={`/campeonatos/${championship.id}`}
              >
                <ItemLista
                  interactive
                  title={championship.nome}
                  subtitle={`${teamNames.join(', ')} · ${championship.modalidade}`}
                  right={
                    <>
                      <IndicadorSituacao
                        status={statusLabel[championship.estado]}
                      />
                      <IndicadorAvanco />
                    </>
                  }
                />
              </Link>
            ))}
          </div>
        )}
      </Secao>
    </>
  );
}

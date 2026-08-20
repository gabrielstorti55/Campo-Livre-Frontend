'use client';

import Link from 'next/link';
import { useState } from 'react';

import { useSession } from '@/features/auth/session/session-context';
import type {
  CampeonatoEstadoPublico,
  CampeonatoPublico,
} from '@/features/publico/model/public-models';
import { publicCatalogMock } from '@/features/publico/services/public-catalog.mock';
import { PageHeader, Section, Tabs } from '@/shared/components/campo-livre-ui';
import { Chevron, ListRow } from '@/shared/components/list-row';
import { ResourceState } from '@/shared/components/resource-state';
import { StatusBadge } from '@/shared/components/status-badge';

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

export function MeusEventos() {
  const { session } = useSession();
  const [tab, setTab] = useState('Ativos');
  const teamIds = session?.links.teamIds ?? ['1'];
  const eventMap = new Map<number, AthleteEvent>();

  for (const teamId of teamIds) {
    const teamProjection = publicCatalogMock.obterTime(teamId);
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
      <PageHeader
        title="Meus Eventos"
        subtitle="Campeonatos vinculados aos times dos quais você participa"
      />
      <Tabs
        tabs={['Ativos', 'Encerrados']}
        active={tab}
        onChange={setTab}
        panelId="athlete-events-panel"
      />

      <Section
        title={`Eventos ${tab}`}
        id="athlete-events-panel"
        role="tabpanel"
        labelledBy={`athlete-events-panel-tab-${tab}`}
      >
        {events.length === 0 ? (
          <ResourceState
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
                <ListRow
                  interactive
                  title={championship.nome}
                  subtitle={`${teamNames.join(', ')} · ${championship.modalidade}`}
                  right={
                    <>
                      <StatusBadge status={statusLabel[championship.estado]} />
                      <Chevron />
                    </>
                  }
                />
              </Link>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}

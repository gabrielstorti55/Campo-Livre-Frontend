import { useParams } from 'react-router-dom';
import { useState } from 'react';

import {
  ListaJogos,
  ListaTimes,
  ProximoJogoCard,
  ResultadoRow,
  TabelaClassificacao,
} from '@/features/campeonatos/components/campeonato-widgets';
import { StatusBadge } from '@/shared/components/status-badge';
import { PageHeader, Section, Tabs } from '@/shared/components/campo-livre-ui';
import { atletaLogado, getCampeonato, partidas } from '@/mocks/data';

export function CampeonatoAtleta() {
  const { id } = useParams();
  const campeonato = getCampeonato(id ?? '');
  const [tab, setTab] = useState('Visão Geral');

  return (
    <>
      <PageHeader
        title={campeonato.nome}
        subtitle={`${campeonato.modalidade} · ${campeonato.formato} · Rodada ${campeonato.rodada}`}
        actions={<StatusBadge status={campeonato.status} />}
      />
      <Tabs
        tabs={['Visão Geral', 'Classificação', 'Jogos', 'Times']}
        active={tab}
        onChange={setTab}
      />

      {tab === 'Visão Geral' ? (
        <div className="space-y-6">
          <ProximoJogoCard />
          <Section title="Classificação">
            <TabelaClassificacao destaque={atletaLogado.time} />
          </Section>
          <Section title="Últimos resultados">
            {partidas
              .filter((p) => p.concluida)
              .map((p) => (
                <ResultadoRow
                  key={p.id}
                  casa={p.casa}
                  fora={p.fora}
                  placar={`${p.golsCasa} x ${p.golsFora}`}
                />
              ))}
          </Section>
        </div>
      ) : null}
      {tab === 'Classificação' ? (
        <TabelaClassificacao destaque={atletaLogado.time} />
      ) : null}
      {tab === 'Jogos' ? <ListaJogos /> : null}
      {tab === 'Times' ? <ListaTimes /> : null}
    </>
  );
}

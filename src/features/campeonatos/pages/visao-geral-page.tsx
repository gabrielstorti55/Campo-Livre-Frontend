'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CalendarPlus, GitBranch, Users } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';

import {
  ListaJogos,
  ListaTimes,
  ProximoJogoCard,
  ResultadoRow,
  TabelaClassificacao,
} from '@/features/campeonatos/components/campeonato-widgets';
import { StatusBadge } from '@/shared/components/status-badge';
import { PageHeader, StatCard, Tabs } from '@/shared/components/campo-livre-ui';
import { getCampeonato, partidas } from '@/mocks/data';

export function VisaoGeral() {
  const { id } = useParams<{ id: string }>();
  const campeonato = getCampeonato(id ?? '');
  const [tab, setTab] = useState('Visão Geral');
  const basePath = `/organizador/campeonato/${id ?? ''}`;

  return (
    <>
      <PageHeader
        title={campeonato.nome}
        subtitle={`${campeonato.modalidade} · ${campeonato.formato}`}
        actions={<StatusBadge status={campeonato.status} />}
      />

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Times" value={campeonato.times} />
        <StatCard label="Rodada" value={campeonato.rodada} />
        <StatCard label="Partidas" value={partidas.length} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="campoOutline" className="py-2.5" asChild>
          <Link href={`${basePath}/times`}>
            <Users className="h-4 w-4" /> Gerenciar times
          </Link>
        </Button>
        <Button variant="campoOutline" className="py-2.5" asChild>
          <Link href={`${basePath}/partidas`}>
            <CalendarPlus className="h-4 w-4" /> Agendar partidas
          </Link>
        </Button>
        <Button variant="campoOutline" className="py-2.5" asChild>
          <Link href={`${basePath}/chaveamento`}>
            <GitBranch className="h-4 w-4" /> Chaveamento
          </Link>
        </Button>
      </div>

      <Tabs
        tabs={['Visão Geral', 'Pts Corridos', 'Jogos', 'Times']}
        active={tab}
        onChange={setTab}
      />

      {tab === 'Visão Geral' ? (
        <div className="space-y-6">
          <ProximoJogoCard />
          <TabelaClassificacao />
          <div className="space-y-2">
            <h3 className="font-display font-semibold text-foreground">
              Últimos resultados
            </h3>
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
          </div>
        </div>
      ) : null}

      {tab === 'Pts Corridos' ? <TabelaClassificacao /> : null}

      {tab === 'Jogos' ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="campoOutline" className="py-2.5" asChild>
              <Link href={`${basePath}/partidas`}>Agendar</Link>
            </Button>
            <Button variant="campoOutline" className="py-2.5" asChild>
              <Link href={`${basePath}/sumula`}>Lançar resultado</Link>
            </Button>
          </div>
          <ListaJogos />
        </div>
      ) : null}

      {tab === 'Times' ? (
        <div className="space-y-4">
          <Button variant="campoOutline" className="py-2.5" asChild>
            <Link href={`${basePath}/times`}>Gerenciar elencos</Link>
          </Button>
          <ListaTimes />
        </div>
      ) : null}
    </>
  );
}

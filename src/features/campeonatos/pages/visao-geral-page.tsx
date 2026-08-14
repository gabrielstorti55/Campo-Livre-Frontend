import { Link, useParams } from 'react-router-dom';
import { CalendarPlus, GitBranch, Users } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';

import {
  ListaJogos,
  ListaTimes,
  ProximoJogoCard,
  TabelaClassificacao,
} from '@/features/campeonatos/components/campeonato-widgets';
import { StatusBadge } from '@/shared/components/status-badge';
import {
  Card,
  PageHeader,
  StatCard,
  Tabs,
} from '@/shared/components/campo-livre-ui';
import { getCampeonato, partidas } from '@/mocks/data';

export function VisaoGeral() {
  const { id } = useParams();
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
        <Link to={`${basePath}/times`}>
          <Button variant="campoOutline" className="py-2.5">
            <Users className="h-4 w-4" /> Gerenciar times
          </Button>
        </Link>
        <Link to={`${basePath}/partidas`}>
          <Button variant="campoOutline" className="py-2.5">
            <CalendarPlus className="h-4 w-4" /> Agendar partidas
          </Button>
        </Link>
        <Link to={`${basePath}/chaveamento`}>
          <Button variant="campoOutline" className="py-2.5">
            <GitBranch className="h-4 w-4" /> Chaveamento
          </Button>
        </Link>
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
                <Card
                  key={p.id}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="min-w-0 truncate font-display text-sm font-semibold">
                    {p.casa} vs {p.fora}
                  </span>
                  <span className="rounded-lg bg-green-pale px-3 py-1 font-display text-sm font-bold text-green-dark">
                    {p.golsCasa} x {p.golsFora}
                  </span>
                </Card>
              ))}
          </div>
        </div>
      ) : null}

      {tab === 'Pts Corridos' ? <TabelaClassificacao /> : null}

      {tab === 'Jogos' ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Link to={`${basePath}/partidas`}>
              <Button variant="campoOutline" className="py-2.5">
                Agendar
              </Button>
            </Link>
            <Link to={`${basePath}/sumula`}>
              <Button variant="campoOutline" className="py-2.5">
                Lançar resultado
              </Button>
            </Link>
          </div>
          <ListaJogos />
        </div>
      ) : null}

      {tab === 'Times' ? (
        <div className="space-y-4">
          <Link to={`${basePath}/times`}>
            <Button variant="campoOutline" className="py-2.5">
              Gerenciar elencos
            </Button>
          </Link>
          <ListaTimes />
        </div>
      ) : null}
    </>
  );
}

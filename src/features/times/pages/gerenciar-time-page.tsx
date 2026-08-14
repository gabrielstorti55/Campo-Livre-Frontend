import { useParams } from 'react-router-dom';
import { CalendarDays, MapPin, Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';

import { StatusBadge } from '@/shared/components/status-badge';
import {
  Initials,
  PageHeader,
  Section,
  StatCard,
  Tabs,
} from '@/shared/components/campo-livre-ui';
import { atletaLogado, elenco, getTime, partidas } from '@/mocks/data';

export function GerenciarTime() {
  const { id } = useParams();
  const time = getTime(id ?? '');
  const [tab, setTab] = useState('Elenco');

  return (
    <>
      <PageHeader
        title={time.nome}
        subtitle="Painel do capitão"
        actions={<StatusBadge status={time.status} />}
      />

      <div className="flex flex-wrap items-center gap-4 border-b border-border pb-6">
        <Initials name={time.nome} className="h-14 w-14 text-lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold text-foreground">
            {time.nome}
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {time.cidade}
            </span>
            <span>{time.jogadores} jogadores</span>
            <span>{time.campeonato ?? 'Sem campeonato'}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-5 lg:grid-cols-4">
        <StatCard label="Gols" value={24} />
        <StatCard label="Partidas" value={14} />
        <StatCard label="Gols / jogo" value={1.7} />
        <StatCard label="Score" value={atletaLogado.score} />
      </div>

      <Tabs
        tabs={['Elenco', 'Jogos', 'Estatísticas']}
        active={tab}
        onChange={setTab}
      />

      {tab === 'Elenco' ? (
        <Section title="Jogadores cadastrados">
          <div className="border-t border-border">
            {elenco.map((jogador) => (
              <div
                key={jogador.id}
                className="flex items-center gap-3 border-b border-border py-4"
              >
                <Initials name={jogador.nome} className="h-10 w-10 text-xs" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-foreground">
                    {jogador.nome}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {jogador.posicao}
                  </p>
                </div>
                {jogador.capitao ? (
                  <span className="rounded-md bg-green-pale px-2.5 py-1 text-xs font-semibold text-green-dark">
                    Capitão
                  </span>
                ) : null}
              </div>
            ))}
          </div>
          <Button variant="campoOutline" className="w-full sm:w-auto">
            <Plus className="h-4 w-4" /> Adicionar jogador
          </Button>
        </Section>
      ) : null}

      {tab === 'Jogos' ? (
        <Section title="Próximos jogos">
          <div className="border-t border-border">
            {partidas
              .filter((partida) => !partida.concluida)
              .map((partida) => (
                <div
                  key={partida.id}
                  className="flex flex-wrap items-center gap-3 border-b border-border py-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-foreground">
                      {partida.casa} vs {partida.fora}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <CalendarDays className="h-3 w-3" /> {partida.data} ·{' '}
                      {partida.hora} · {partida.campo}
                    </p>
                  </div>
                  <StatusBadge
                    status={partida.agendada ? 'Em andamento' : 'Pendente'}
                  />
                </div>
              ))}
          </div>
        </Section>
      ) : null}

      {tab === 'Estatísticas' ? (
        <Section title="Artilharia do time">
          <div className="border-t border-border">
            {elenco.map((jogador) => (
              <div
                key={jogador.id}
                className="flex items-center justify-between gap-3 border-b border-border py-3"
              >
                <span className="min-w-0 truncate text-sm font-semibold">
                  {jogador.nome}
                </span>
                <span className="rounded-md bg-green-pale px-3 py-1 text-sm font-bold text-green-dark">
                  {jogador.gols} gols
                </span>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      <Section title="Campeonatos inscritos">
        <div className="flex items-center justify-between gap-3 border-y border-border py-4">
          <span className="min-w-0 truncate font-semibold text-foreground">
            {time.campeonato ?? 'Copa Franca 2026'}
          </span>
          <StatusBadge status="Em andamento" />
        </div>
      </Section>
    </>
  );
}

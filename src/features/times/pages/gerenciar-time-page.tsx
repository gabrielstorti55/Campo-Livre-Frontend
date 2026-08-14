import { useParams } from 'react-router-dom';
import { CalendarDays, ChevronRight, MapPin, Plus } from 'lucide-react';
import { useState } from 'react';

import { StatusBadge } from '@/shared/components/status-badge';
import {
  Card,
  Initials,
  OutlineButton,
  PageHeader,
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

      <Card className="flex flex-wrap items-center gap-4">
        <Initials name={time.nome} className="h-14 w-14 text-lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg font-bold text-foreground">
            {time.nome}
          </p>
          <p className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {time.cidade}
            </span>
            <span>{time.jogadores} jogadores</span>
            <span>{time.campeonato ?? 'Sem campeonato'}</span>
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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
        <div className="space-y-3">
          {elenco.map((j) => (
            <Card key={j.id} className="flex items-center gap-3">
              <Initials name={j.nome} className="h-10 w-10 text-xs" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-display font-semibold text-foreground">
                  {j.nome}
                </p>
                <p className="text-xs text-muted-foreground">{j.posicao}</p>
              </div>
              {j.capitao ? (
                <StatusBadge
                  status="Confirmado"
                  className="hidden sm:inline-flex"
                />
              ) : null}
              {j.capitao ? (
                <span className="rounded-full bg-green-pale px-3 py-1 font-display text-xs font-semibold text-green-dark">
                  Capitão
                </span>
              ) : null}
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Card>
          ))}
          <OutlineButton className="w-full">
            <Plus className="h-4 w-4" /> Adicionar jogador
          </OutlineButton>
        </div>
      ) : null}

      {tab === 'Jogos' ? (
        <div className="space-y-3">
          {partidas
            .filter((p) => !p.concluida)
            .map((p) => (
              <Card key={p.id} className="flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display font-semibold text-foreground">
                    {p.casa} vs {p.fora}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarDays className="h-3 w-3" /> {p.data} · {p.hora} ·{' '}
                    {p.campo}
                  </p>
                </div>
                <StatusBadge
                  status={p.agendada ? 'Em andamento' : 'Pendente'}
                />
              </Card>
            ))}
        </div>
      ) : null}

      {tab === 'Estatísticas' ? (
        <div className="space-y-3">
          <h3 className="font-display font-semibold text-foreground">
            Artilharia do time
          </h3>
          {elenco.map((j) => (
            <Card
              key={j.id}
              className="flex items-center justify-between gap-3"
            >
              <span className="min-w-0 truncate font-display text-sm font-semibold">
                {j.nome}
              </span>
              <span className="rounded-lg bg-green-pale px-3 py-1 font-display text-sm font-bold text-green-dark">
                {j.gols} gols
              </span>
            </Card>
          ))}
        </div>
      ) : null}

      <section>
        <h2 className="mb-3 font-display text-lg font-bold text-foreground">
          Campeonatos inscritos
        </h2>
        <Card className="flex items-center justify-between gap-3">
          <span className="min-w-0 truncate font-display font-semibold text-foreground">
            {time.campeonato ?? 'Copa Franca 2026'}
          </span>
          <StatusBadge status="Em andamento" />
        </Card>
      </section>
    </>
  );
}

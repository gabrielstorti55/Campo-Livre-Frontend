import { CalendarDays, MapPin, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

import { ContextSwitcher } from '@/features/auth/components/context-switcher';
import { useSession } from '@/features/auth/session/session-context';
import { ProximaPartidaCard } from '@/features/campeonatos/components/campeonato-widgets';
import {
  atletaLogado,
  conquistas,
  historicoAtleta,
  partidas,
  times,
} from '@/mocks/data';
import { Pill, Section, StatGrid } from '@/shared/components/campo-livre-ui';
import {
  Chevron,
  IconBubble,
  ListRow,
  RowAvatar,
} from '@/shared/components/list-row';
import { ProfileHeroHeader } from '@/shared/components/profile-shell';

export function AtletaPerfil() {
  const { session } = useSession();

  return (
    <>
      <ProfileHeroHeader
        name={session?.account.name ?? atletaLogado.nome}
        subtitle={atletaLogado.cidade}
        meta={`Score ${atletaLogado.score} · ${atletaLogado.time}`}
      />

      <Section title="Meus times">
        <div className="grid gap-3 md:grid-cols-2">
          {times.slice(0, 2).map((t) => (
            <Link key={t.id} to={`/atleta/time/${t.id}`}>
              <ListRow
                interactive
                avatar={<RowAvatar name={t.nome} />}
                title={t.nome}
                subtitle={`${t.cidade} · ${t.jogadores} jogadores`}
                right={<Chevron />}
              />
            </Link>
          ))}
        </div>
      </Section>

      <StatGrid
        items={[
          { label: 'Gols / Copa', value: atletaLogado.gols },
          { label: 'Partidas jogadas', value: atletaLogado.partidas },
          { label: 'Gols por jogo', value: atletaLogado.golsJogo },
          { label: 'Score futmob', value: atletaLogado.score },
        ]}
      />

      <Section title="Meus próximos jogos">
        <div className="grid gap-3 md:grid-cols-2">
          {partidas
            .filter((p) => p.agendada && !p.concluida)
            .slice(0, 2)
            .map((p) => (
              <ProximaPartidaCard
                key={p.id}
                casa={p.casa}
                fora={p.fora}
                rodada={p.rodada}
                meta={[
                  { icon: CalendarDays, label: `${p.data} · ${p.hora}` },
                  { icon: MapPin, label: p.campo },
                ]}
              />
            ))}
        </div>
      </Section>

      <Section title="Histórico verificado">
        <div className="space-y-2">
          {historicoAtleta.map((h) => (
            <ListRow
              key={h.campeonato}
              title={h.campeonato}
              subtitle={`${h.resultado} · ${h.ano}`}
              right={<Pill>{h.placar}</Pill>}
            />
          ))}
        </div>
      </Section>

      <Section title="Campeonatos e conquistas">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {conquistas.map((c) => (
            <ListRow
              key={c.titulo}
              avatar={<IconBubble icon={Trophy} className="rounded-full" />}
              title={c.titulo}
              subtitle={c.ano}
            />
          ))}
        </div>
      </Section>

      <Section title="Conta e contexto">
        <p className="mb-3 text-sm leading-6 text-muted-foreground">
          Troque de contexto sem sair da sua conta pessoal.
        </p>
        <ContextSwitcher />
      </Section>
    </>
  );
}

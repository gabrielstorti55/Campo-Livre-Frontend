import {
  CalendarDays,
  MapPin,
  Plus,
  Search,
  Trophy,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { ContextSwitcher } from '@/features/auth/components/context-switcher';
import { useSession } from '@/features/auth/session/session-context';
import { ProximaPartidaCard } from '@/features/campeonatos/components/campeonato-widgets';
import {
  atletaLogado,
  conquistas,
  historicoAtleta,
  partidas,
} from '@/mocks/data';
import { Pill, Section, StatGrid } from '@/shared/components/campo-livre-ui';
import { IconBubble, ListRow } from '@/shared/components/list-row';
import { ProfileHeroHeader } from '@/shared/components/profile-shell';

export function AtletaPerfil() {
  const { session } = useSession();
  const accountName = session?.account.name ?? atletaLogado.nome;
  const accountCity = session?.account.city ?? atletaLogado.cidade;

  return (
    <>
      <ProfileHeroHeader
        name={accountName}
        subtitle={accountCity}
        meta="Perfil esportivo · conta pessoal"
      />

      <Section title="Meu time">
        <div className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm">
          <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-pale text-green-dark">
                <Users className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="font-display text-lg font-semibold tracking-[-0.02em] text-foreground">
                  Você ainda não está em nenhum time
                </p>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Entre em uma equipe existente ou crie seu próprio time para
                  começar a participar de campeonatos.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
              <Link
                to="/atleta/time/buscar"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-green-dark px-4 text-sm font-semibold text-green-dark transition-colors hover:bg-green-pale focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                Entrar em um time
              </Link>
              <Link
                to="/atleta/time/criar"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-green-dark px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-mid focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Criar um time
              </Link>
            </div>
          </div>
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

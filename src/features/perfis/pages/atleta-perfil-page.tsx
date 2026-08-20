'use client';

import {
  CalendarDays,
  MapPin,
  Plus,
  Search,
  Trophy,
  Users,
} from 'lucide-react';
import Link from 'next/link';

import { ContextSwitcher } from '@/features/auth/components/context-switcher';
import { useSession } from '@/features/auth/session/session-context';
import { ProximaPartidaCard } from '@/features/campeonatos/components/campeonato-widgets';
import { publicCatalogMock } from '@/features/publico/services/public-catalog.mock';
import { atletaLogado, partidas, times } from '@/mocks/data';
import { Section, StatGrid } from '@/shared/components/campo-livre-ui';
import {
  Chevron,
  IconBubble,
  ListRow,
  RowAvatar,
} from '@/shared/components/list-row';
import { ResourceState } from '@/shared/components/resource-state';
import { ProfileHeroHeader } from '@/shared/components/profile-shell';

export function AtletaPerfil() {
  const { session } = useSession();
  const accountName = session?.account.name ?? atletaLogado.nome;
  const accountCity = session?.account.city ?? atletaLogado.cidade;
  const teamIds = session?.links.teamIds ?? ['1'];
  const knownPublicAthlete =
    !session || session.account.id === 'mock-person-1'
      ? publicCatalogMock.obterAtleta(1)
      : undefined;
  const linkedTeams = times.filter((time) => teamIds.includes(String(time.id)));
  const createdTeams = (session?.links.createdTeams ?? []).map((time) => ({
    id: time.id,
    nome: time.name,
    cidade: time.city,
    jogadores: 1,
  }));
  const personalTeams = [...linkedTeams, ...createdTeams];
  const teamNames = new Set(personalTeams.map((time) => time.nome));
  const nextMatches = partidas
    .filter(
      (match) =>
        match.agendada &&
        !match.concluida &&
        (teamNames.has(match.casa) || teamNames.has(match.fora)),
    )
    .slice(0, 2);

  return (
    <>
      <ProfileHeroHeader
        name={accountName}
        subtitle={accountCity}
        meta="Perfil esportivo · conta pessoal"
      />

      <Section title="Meus times">
        {personalTeams.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {personalTeams.map((time) => {
              const isCaptain = session?.links.captainTeamIds.includes(
                String(time.id),
              );
              return (
                <Link
                  key={time.id}
                  href={
                    isCaptain ? `/atleta/time/${time.id}` : `/times/${time.id}`
                  }
                >
                  <ListRow
                    interactive
                    avatar={<RowAvatar name={time.nome} />}
                    title={time.nome}
                    subtitle={`${time.cidade} · ${time.jogadores} jogadores`}
                    right={<Chevron />}
                  />
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-border/70 bg-card p-5 shadow-sm sm:p-6">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-pale text-green-dark">
                <Users className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="font-display text-lg font-semibold">
                  Você ainda não está em nenhum time
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Aceite um convite nominal ou crie seu próprio time.
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Link
                href="/atleta/time/buscar"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-green-dark px-4 text-sm font-semibold text-green-dark"
              >
                <Search className="h-4 w-4" aria-hidden="true" /> Ver convites
              </Link>
              <Link
                href="/atleta/time/criar"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-green-dark px-4 text-sm font-semibold text-white"
              >
                <Plus className="h-4 w-4" aria-hidden="true" /> Criar time
              </Link>
            </div>
          </div>
        )}
      </Section>

      <Section title="Estatísticas publicadas">
        <StatGrid
          columns={3}
          items={[
            {
              label: 'Gols publicados',
              value: knownPublicAthlete?.golsPublicados ?? 0,
            },
            {
              label: 'Partidas publicadas',
              value: knownPublicAthlete?.partidasPublicadas ?? 0,
            },
            {
              label: 'Assistências publicadas',
              value: knownPublicAthlete?.assistenciasPublicadas ?? 0,
            },
          ]}
        />
      </Section>

      <Section title="Meus próximos jogos">
        {nextMatches.length === 0 ? (
          <ResourceState
            kind="empty"
            title="Nenhum próximo jogo"
            description="Os jogos aparecem depois que um dos seus times entra na agenda publicada de um campeonato."
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {nextMatches.map((match) => (
              <ProximaPartidaCard
                key={match.id}
                casa={match.casa}
                fora={match.fora}
                rodada={match.rodada}
                meta={[
                  {
                    icon: CalendarDays,
                    label: `${match.data} · ${match.hora}`,
                  },
                  { icon: MapPin, label: match.campo },
                ]}
              />
            ))}
          </div>
        )}
      </Section>

      <Section title="Histórico de times publicado">
        {knownPublicAthlete?.historicoTimes.length ? (
          <div className="space-y-2">
            {knownPublicAthlete.historicoTimes.map((history) => (
              <ListRow
                key={`${history.time}-${history.inicio}`}
                title={history.time}
                subtitle={`${history.funcao} · ${history.inicio}${history.fim ? `–${history.fim}` : '–atual'}`}
              />
            ))}
          </div>
        ) : (
          <ResourceState
            kind="empty"
            title="Nenhum histórico publicado"
            description="Somente vínculos esportivos autorizados e publicados aparecem no perfil."
          />
        )}
      </Section>

      <Section title="Conquistas publicadas">
        {knownPublicAthlete?.conquistas.length ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {knownPublicAthlete.conquistas.map((achievement) => (
              <ListRow
                key={`${achievement.titulo}-${achievement.ano}`}
                avatar={<IconBubble icon={Trophy} className="rounded-full" />}
                title={achievement.titulo}
                subtitle={`${achievement.descricao} · ${achievement.ano}`}
              />
            ))}
          </div>
        ) : (
          <ResourceState
            kind="empty"
            title="Nenhuma conquista publicada"
            description="As conquistas aparecem após a publicação dos resultados definitivos."
          />
        )}
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

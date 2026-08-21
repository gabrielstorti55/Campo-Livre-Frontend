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

import { SeletorContexto } from '@/components/layout/seletor-contexto';
import { useSessao } from '@/hooks/use-sessao';
import { CartaoProximaPartida } from '@/components/modules/campeonatos/elementos-campeonato';
import { catalogoPublicoMock } from '@/services/publico/catalogo-publico.mock';
import { atletaLogado, partidas, times } from '@/mocks/dados-gerais';
import { Secao } from '@/components/layout/secao';
import { GradeEstatisticas } from '@/components/layout/grade-estatisticas';
import {
  IndicadorAvanco,
  IconeCircular,
  ItemLista,
  AvatarItem,
} from '@/components/layout/item-lista';
import { EstadoRecurso } from '@/components/layout/estado-recurso';
import { CabecalhoPerfil } from '@/layouts/area-autenticada';

export function TelaPerfilAtletaAutenticado() {
  const { session } = useSessao();
  const accountName = session?.account.name ?? atletaLogado.nome;
  const accountCity = session?.account.city ?? atletaLogado.cidade;
  const teamIds = session?.links.teamIds ?? ['1'];
  const knownPublicAthlete =
    !session || session.account.id === 'mock-person-1'
      ? catalogoPublicoMock.obterAtleta(1)
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
      <CabecalhoPerfil
        name={accountName}
        subtitle={accountCity}
        meta="Perfil esportivo · conta pessoal"
      />

      <Secao title="Meus times">
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
                  <ItemLista
                    interactive
                    avatar={<AvatarItem name={time.nome} />}
                    title={time.nome}
                    subtitle={`${time.cidade} · ${time.jogadores} jogadores`}
                    right={<IndicadorAvanco />}
                  />
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="overflow-hidden rounded-md border border-border/70 bg-card p-5 shadow-none sm:p-6">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-green-pale text-green-dark">
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
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-green-dark px-4 text-sm font-semibold text-green-dark"
              >
                <Search className="h-4 w-4" aria-hidden="true" /> Ver convites
              </Link>
              <Link
                href="/atleta/time/criar"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-green-dark px-4 text-sm font-semibold text-white"
              >
                <Plus className="h-4 w-4" aria-hidden="true" /> Criar time
              </Link>
            </div>
          </div>
        )}
      </Secao>

      <Secao title="Estatísticas publicadas">
        <GradeEstatisticas
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
      </Secao>

      <Secao title="Meus próximos jogos">
        {nextMatches.length === 0 ? (
          <EstadoRecurso
            kind="empty"
            title="Nenhum próximo jogo"
            description="Os jogos aparecem depois que um dos seus times entra na agenda publicada de um campeonato."
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {nextMatches.map((match) => (
              <CartaoProximaPartida
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
      </Secao>

      <Secao title="Histórico de times publicado">
        {knownPublicAthlete?.historicoTimes.length ? (
          <div className="space-y-2">
            {knownPublicAthlete.historicoTimes.map((history) => (
              <ItemLista
                key={`${history.time}-${history.inicio}`}
                title={history.time}
                subtitle={`${history.funcao} · ${history.inicio}${history.fim ? `–${history.fim}` : '–atual'}`}
              />
            ))}
          </div>
        ) : (
          <EstadoRecurso
            kind="empty"
            title="Nenhum histórico publicado"
            description="Somente vínculos esportivos autorizados e publicados aparecem no perfil."
          />
        )}
      </Secao>

      <Secao title="Conquistas publicadas">
        {knownPublicAthlete?.conquistas.length ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {knownPublicAthlete.conquistas.map((achievement) => (
              <ItemLista
                key={`${achievement.titulo}-${achievement.ano}`}
                avatar={
                  <IconeCircular icon={Trophy} className="rounded-full" />
                }
                title={achievement.titulo}
                subtitle={`${achievement.descricao} · ${achievement.ano}`}
              />
            ))}
          </div>
        ) : (
          <EstadoRecurso
            kind="empty"
            title="Nenhuma conquista publicada"
            description="As conquistas aparecem após a publicação dos resultados definitivos."
          />
        )}
      </Secao>

      <Secao title="Conta e contexto">
        <p className="mb-3 text-sm leading-6 text-muted-foreground">
          Troque de contexto sem sair da sua conta pessoal.
        </p>
        <SeletorContexto />
      </Secao>
    </>
  );
}

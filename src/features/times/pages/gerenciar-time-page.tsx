'use client';

import { useParams } from 'next/navigation';
import { CalendarDays, MapPin, Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';

import { useSession } from '@/features/auth/session/session-context';

import { StatusBadge } from '@/shared/components/status-badge';
import { ResourceState } from '@/shared/components/resource-state';
import {
  Initials,
  PageHeader,
  Section,
  StatCard,
  Tabs,
} from '@/shared/components/campo-livre-ui';
import { atletaLogado, getElencoDoTime, partidas, times } from '@/mocks/data';

export function GerenciarTime() {
  const { id } = useParams<{ id: string }>();
  const { session } = useSession();
  const createdTeam = session?.links.createdTeams.find(
    (team) => team.id === id,
  );
  const time = createdTeam
    ? {
        id: createdTeam.id,
        nome: createdTeam.name,
        cidade: createdTeam.city,
        jogadores: 1,
        status: 'Confirmado' as const,
        campeonato: undefined,
      }
    : times.find((candidate) => String(candidate.id) === id);
  const teamRoster = createdTeam
    ? [
        {
          id: session?.account.id ?? 'atleta-local',
          nome: session?.account.name ?? atletaLogado.nome,
          posicao: 'Capitão',
          capitao: true,
          gols: 0,
        },
      ]
    : getElencoDoTime(id);
  const teamMatches = time
    ? partidas.filter(
        (match) => match.casa === time.nome || match.fora === time.nome,
      )
    : [];
  const completedMatches = teamMatches.filter((match) => match.concluida);
  const goals = completedMatches.reduce((total, match) => {
    if (match.casa === time?.nome) return total + (match.golsCasa ?? 0);
    return total + (match.golsFora ?? 0);
  }, 0);
  const goalsPerMatch = completedMatches.length
    ? Number((goals / completedMatches.length).toFixed(1))
    : 0;
  const [tab, setTab] = useState('Elenco');
  const [convitePendente, setConvitePendente] = useState<{
    conta: string;
    modo: 'email' | 'link';
  } | null>(null);

  if (!time) {
    return (
      <ResourceState
        kind="error"
        title="Time não encontrado"
        description="O endereço informado não corresponde a um time disponível."
      />
    );
  }

  if (!session?.links.captainTeamIds.includes(id ?? '')) {
    return (
      <ResourceState
        kind="error"
        title="Você não pode gerenciar este time"
        description="Somente uma conta com vínculo de capitão deste time pode acessar convites, elenco e operações de gestão."
      />
    );
  }

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
        <StatCard label="Gols" value={goals} />
        <StatCard label="Partidas" value={completedMatches.length} />
        <StatCard label="Gols / jogo" value={goalsPerMatch} />
        <StatCard label="Jogadores" value={teamRoster.length} />
      </div>

      <Tabs
        tabs={['Elenco', 'Jogos', 'Estatísticas']}
        active={tab}
        onChange={setTab}
        panelId="team-management-panel"
      />

      {tab === 'Elenco' ? (
        <Section
          title="Jogadores cadastrados"
          id="team-management-panel"
          role="tabpanel"
          labelledBy="team-management-panel-tab-Elenco"
        >
          <div className="border-t border-border">
            {teamRoster.map((jogador) => (
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
          <form
            className="mt-5 grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-[minmax(0,1fr)_13rem_auto] sm:items-end"
            onSubmit={(event) => {
              event.preventDefault();
              const dados = new FormData(event.currentTarget);
              setConvitePendente({
                conta: String(dados.get('conta') ?? ''),
                modo: dados.get('envio') === 'link' ? 'link' : 'email',
              });
              event.currentTarget.reset();
            }}
          >
            <label className="space-y-1.5 text-sm font-medium">
              <span>Conta do atleta</span>
              <input
                name="conta"
                required
                placeholder="E-mail, telefone, CPF ou usuário"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              />
            </label>
            <label className="space-y-1.5 text-sm font-medium">
              <span>Forma de envio</span>
              <select
                name="envio"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="email">E-mail automático</option>
                <option value="link">Link compartilhável</option>
              </select>
            </label>
            <Button type="submit" variant="campoOutline">
              <Plus className="h-4 w-4" /> Enviar convite nominal
            </Button>
          </form>
          {convitePendente ? (
            <div
              className="mt-3 space-y-3 rounded-xl border border-border p-4"
              role="status"
            >
              <p className="text-sm font-semibold text-green-dark">
                Convite pendente para {convitePendente.conta}
              </p>
              {convitePendente.modo === 'link' ? (
                <label className="block text-sm font-medium">
                  Link compartilhável
                  <input
                    readOnly
                    value="https://campolivre.app/convites/time/convite-mock-01"
                    className="mt-1 h-10 w-full rounded-md border border-input bg-surface px-3 text-sm"
                  />
                </label>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Envio automático por e-mail solicitado.
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="campoOutline">
                  Reenviar convite
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  tone="danger"
                  onClick={() => setConvitePendente(null)}
                >
                  Cancelar convite
                </Button>
              </div>
            </div>
          ) : null}
        </Section>
      ) : null}

      {tab === 'Jogos' ? (
        <Section
          title="Próximos jogos"
          id="team-management-panel"
          role="tabpanel"
          labelledBy="team-management-panel-tab-Jogos"
        >
          {teamMatches.some((match) => !match.concluida) ? (
            <div className="border-t border-border">
              {teamMatches
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
          ) : (
            <p className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
              Nenhum próximo jogo cadastrado para este time.
            </p>
          )}
        </Section>
      ) : null}

      {tab === 'Estatísticas' ? (
        <Section
          title="Artilharia do time"
          id="team-management-panel"
          role="tabpanel"
          labelledBy="team-management-panel-tab-Estatísticas"
        >
          <div className="border-t border-border">
            {teamRoster.map((jogador) => (
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
        {time.campeonato ? (
          <div className="flex items-center justify-between gap-3 border-y border-border py-4">
            <span className="min-w-0 truncate font-semibold text-foreground">
              {time.campeonato}
            </span>
            <StatusBadge status="Em andamento" />
          </div>
        ) : (
          <p className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
            Nenhum campeonato inscrito.
          </p>
        )}
      </Section>
    </>
  );
}

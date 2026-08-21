'use client';

import { CalendarDays, MapPin, Users } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

import { useSessao } from '@/hooks/use-sessao';
import { CartaoProximaPartida } from '@/components/modules/campeonatos/elementos-campeonato';
import {
  atletaLogado,
  campeonatos,
  partidas,
  times,
} from '@/mocks/dados-gerais';
import { FiltrosRapidos } from '@/components/layout/filtros-rapidos';
import { RotuloGrupo } from '@/components/layout/rotulo-grupo';
import { BarraBusca } from '@/components/layout/barra-busca';
import { Secao } from '@/components/layout/secao';
import {
  IndicadorAvanco,
  ItemLista,
  LinhaMetadados,
  AvatarItem,
} from '@/components/layout/item-lista';
import { CabecalhoPerfil } from '@/layouts/area-autenticada';
import { IndicadorSituacao } from '@/components/layout/indicador-situacao';

const filtros = [
  'Todos os tipos',
  'Futebol Society',
  'Futebol de Campo',
  'Mais',
];
const abas = ['Todos', 'Ativos', 'Encerrados'];

export function TelaInicioAtleta() {
  const { session } = useSessao();
  const [filtro, setFiltro] = useState('Todos os tipos');
  const [aba, setAba] = useState('Todos');
  const [busca, setBusca] = useState('');

  const teamIds = session?.links.teamIds ?? ['1'];
  const linkedTeams = times.filter((time) => teamIds.includes(String(time.id)));
  const createdTeams = (session?.links.createdTeams ?? []).map((time) => ({
    id: time.id,
    nome: time.name,
    cidade: time.city,
    jogadores: 1,
    status: 'Confirmado' as const,
    campeonato: undefined,
  }));
  const meusTimes = [...linkedTeams, ...createdTeams];
  const linkedTeamNames = new Set(meusTimes.map((time) => time.nome));
  const proximosJogos = partidas
    .filter(
      (partida) =>
        partida.agendada &&
        !partida.concluida &&
        (linkedTeamNames.has(partida.casa) ||
          linkedTeamNames.has(partida.fora)),
    )
    .slice(0, 2);

  const lista = campeonatos.filter((c) => {
    const porBusca = c.nome.toLowerCase().includes(busca.toLowerCase());
    const porTipo =
      filtro === 'Futebol Society'
        ? c.modalidade.includes('Society')
        : filtro === 'Futebol de Campo'
          ? c.modalidade.includes('Campo')
          : true;
    const porAba =
      aba === 'Ativos'
        ? c.status !== 'Encerrado'
        : aba === 'Encerrados'
          ? c.status === 'Encerrado'
          : true;
    return porBusca && porTipo && porAba;
  });

  const grupos = [
    {
      titulo: 'Ativos',
      itens: lista.filter(
        (c) => c.status === 'Em andamento' || c.status === 'Fase Final',
      ),
    },
    {
      titulo: 'Inscrições abertas',
      itens: lista.filter((c) => c.status === 'Inscrições abertas'),
    },
    {
      titulo: 'Encerrados',
      itens: lista.filter((c) => c.status === 'Encerrado'),
    },
  ].filter((g) => g.itens.length > 0);

  return (
    <>
      <CabecalhoPerfil
        name={session?.account.name ?? atletaLogado.nome}
        subtitle={session?.account.city ?? atletaLogado.cidade}
        meta="Minha área · conta pessoal"
      />

      <Secao title="Meus Times">
        {meusTimes.length === 0 ? (
          <div className="rounded-md border border-border bg-card p-5">
            <p className="font-display font-semibold">
              Você ainda não participa de nenhum time
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Aceite um convite nominal ou crie uma equipe para iniciar sua
              jornada esportiva.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/atleta/time/buscar"
                className="rounded-md bg-green-dark px-4 py-2.5 text-sm font-semibold text-white"
              >
                Ver convites
              </Link>
              <Link
                href="/atleta/time/criar"
                className="rounded-md border border-green-dark px-4 py-2.5 text-sm font-semibold text-green-dark"
              >
                Criar time
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {meusTimes.map((t) => {
              const isCaptain = session?.links.captainTeamIds.includes(
                String(t.id),
              );
              return (
                <Link
                  key={t.id}
                  href={isCaptain ? `/atleta/time/${t.id}` : `/times/${t.id}`}
                >
                  <ItemLista
                    interactive
                    avatar={<AvatarItem name={t.nome} />}
                    title={t.nome}
                    subtitle={t.campeonato ?? 'Sem campeonato'}
                    right={<IndicadorSituacao status={t.status} />}
                  />
                </Link>
              );
            })}
          </div>
        )}
      </Secao>

      <Secao title="Meus próximos jogos">
        <div className="grid gap-3 md:grid-cols-2">
          {proximosJogos.map((p) => (
            <CartaoProximaPartida
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
      </Secao>

      <Secao title="Campeonatos na Região">
        <BarraBusca
          placeholder="Buscar campeonato..."
          value={busca}
          onChange={setBusca}
        />
        <FiltrosRapidos
          options={abas}
          value={aba}
          onChange={setAba}
          variant="solid"
        />
        <FiltrosRapidos options={filtros} value={filtro} onChange={setFiltro} />

        <div className="space-y-6 pt-2">
          {grupos.map((g) => (
            <div key={g.titulo}>
              <RotuloGrupo className="mb-2">{g.titulo}</RotuloGrupo>
              <div className="space-y-3">
                {g.itens.map((c) => (
                  <div
                    key={c.id}
                    className="flex flex-wrap items-center gap-3 border-b border-border py-4"
                  >
                    <AvatarItem name={c.nome} />
                    <Link
                      href={`/campeonatos/${c.id}`}
                      className="min-w-0 flex-1"
                    >
                      <p className="truncate font-display font-semibold text-foreground">
                        {c.nome}
                      </p>
                      <LinhaMetadados
                        className="mt-0.5"
                        items={[
                          { icon: MapPin, label: c.cidade },
                          {
                            icon: Users,
                            label: `${c.times} times · ${c.modalidade}`,
                          },
                        ]}
                      />
                    </Link>
                    <IndicadorSituacao status={c.status} />
                    {c.status === 'Inscrições abertas' ? (
                      <span className="text-xs font-semibold text-green-dark">
                        Participação por convite do organizador
                      </span>
                    ) : null}
                    <Link
                      href={`/campeonatos/${c.id}`}
                      aria-label={`Abrir ${c.nome}`}
                    >
                      <IndicadorAvanco />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Secao>
    </>
  );
}

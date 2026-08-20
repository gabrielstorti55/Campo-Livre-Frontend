'use client';

import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

import { CartaoProximoJogo } from '@/components/modules/campeonatos/elementos-campeonato';
import { ArtilhariaCampeonato } from '@/components/modules/campeonatos/artilharia-campeonato';
import { useSessao } from '@/hooks/use-sessao';
import { proximoJogo } from '@/mocks/dados-gerais';
import {
  listarArtilhariaPublica,
  obterNomeCampoPartida,
  obterNomeTimePublico,
  catalogoPublicoMock,
} from '@/services/publico/catalogo-publico.mock';
import { Abas } from '@/components/layout/abas';
import { DestaquePagina } from '@/components/layout/destaque-pagina';
import { EstadoRecurso } from '@/components/layout/estado-recurso';
import { cn } from '@/utils/classes';

const cardFocus =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

export function TelaDetalhesCampeonato() {
  const { id } = useParams<{ id: string }>();
  const { session } = useSessao();
  const detalhe = catalogoPublicoMock.obterCampeonato(id);
  const [tab, setTab] = useState('Visão geral');

  if (!detalhe) {
    return (
      <div className="mx-auto w-full max-w-[1380px] px-4 py-10 sm:px-6 lg:px-8">
        <EstadoRecurso
          kind="error"
          title="Campeonato não encontrado"
          description="O link pode estar incorreto ou este campeonato pode não estar disponível publicamente."
        />
      </div>
    );
  }

  const { campeonato, times, partidas, classificacao } = detalhe;
  const estado = campeonato.estado
    .replaceAll('_', ' ')
    .toLocaleLowerCase('pt-BR');

  return (
    <div className="mx-auto w-full max-w-[1380px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <DestaquePagina
        eyebrow={`${campeonato.modalidade} · ${campeonato.municipio}, ${campeonato.uf}`}
        title={campeonato.nome}
        description={`${campeonato.rodada} · início ${new Date(`${campeonato.inicio}T12:00:00`).toLocaleDateString('pt-BR')}`}
        action={
          <span className="rounded-full bg-green-pale px-3 py-1 text-xs font-semibold text-green-dark capitalize">
            {estado}
          </span>
        }
      />

      <div className="mb-7 overflow-hidden rounded-2xl border border-border/70 bg-card px-2 pt-1 shadow-sm sm:px-4">
        <Abas
          tabs={[
            'Visão geral',
            'Classificação',
            'Artilharia',
            'Partidas',
            'Times',
            'Estrutura',
          ]}
          active={tab}
          onChange={setTab}
        />
      </div>

      {tab === 'Visão geral' ? (
        <div className="space-y-6">
          {session?.activeContext === 'atleta' ? (
            <CartaoProximoJogo jogo={proximoJogo} />
          ) : null}
          <div className="grid gap-5 lg:grid-cols-2">
            <section className="rounded-3xl border border-border/70 bg-card p-5">
              <h2 className="font-display text-xl font-semibold">
                Situação pública
              </h2>
              <dl className="mt-4 grid gap-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">Responsável</dt>
                  <dd className="font-semibold">
                    {campeonato.responsavel.nome} ·{' '}
                    {campeonato.responsavel.funcao}
                  </dd>
                </div>
                {campeonato.responsavel.prefeitura ? (
                  <div>
                    <dt className="text-muted-foreground">Instituição</dt>
                    <dd className="font-semibold">
                      {campeonato.responsavel.prefeitura}
                    </dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-muted-foreground">
                    Participantes confirmados
                  </dt>
                  <dd className="font-semibold">{times.length} times</dd>
                </div>
              </dl>
            </section>
            <section className="rounded-3xl border border-border/70 bg-card p-5">
              <h2 className="font-display text-xl font-semibold">
                Últimos resultados
              </h2>
              <div className="mt-3 space-y-2">
                {partidas
                  .filter((partida) => partida.resultadoPublicado)
                  .map((partida) => (
                    <Link
                      key={partida.id}
                      href={`/partidas/${partida.id}`}
                      className="block rounded-xl border border-border/70 p-3 text-sm font-semibold"
                    >
                      {obterNomeTimePublico(partida.timeCasaId)}{' '}
                      {partida.golsCasa} × {partida.golsFora}{' '}
                      {obterNomeTimePublico(partida.timeForaId)}
                    </Link>
                  ))}
                {partidas.every((partida) => !partida.resultadoPublicado) ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhum resultado publicado.
                  </p>
                ) : null}
              </div>
            </section>
          </div>
        </div>
      ) : null}

      {tab === 'Classificação' ? (
        <div className="overflow-x-auto rounded-3xl border border-border/70 bg-card p-4">
          <table className="w-full min-w-[650px] text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="p-3">#</th>
                <th className="p-3">Time</th>
                {['P', 'J', 'V', 'E', 'D', 'GP', 'GC', 'SG'].map((item) => (
                  <th key={item} className="p-3 text-center">
                    {item}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {classificacao.map((linha, index) => (
                <tr key={linha.time.id} className="border-b last:border-0">
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3 font-semibold">{linha.time.nome}</td>
                  {[
                    linha.pontos,
                    linha.jogos,
                    linha.vitorias,
                    linha.empates,
                    linha.derrotas,
                    linha.golsPro,
                    linha.golsContra,
                    linha.golsPro - linha.golsContra,
                  ].map((value, cell) => (
                    <td key={cell} className="p-3 text-center">
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {tab === 'Artilharia' ? (
        <ArtilhariaCampeonato
          ranking={listarArtilhariaPublica(campeonato.id)}
        />
      ) : null}

      {tab === 'Partidas' ? (
        <div className="space-y-3">
          {partidas.map((partida) => (
            <Link
              key={partida.id}
              href={`/partidas/${partida.id}`}
              className="block rounded-2xl border border-border/70 bg-card p-4"
            >
              <strong>
                {obterNomeTimePublico(partida.timeCasaId)} ×{' '}
                {obterNomeTimePublico(partida.timeForaId)}
              </strong>
              <p className="mt-1 text-sm text-muted-foreground">
                {partida.rodada} · {partida.data ?? 'Data a definir'} ·{' '}
                {obterNomeCampoPartida(partida.campoId)}
              </p>
            </Link>
          ))}
        </div>
      ) : null}

      {tab === 'Times' ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {times.map((time) => (
            <Link
              key={time.id}
              href={`/times/${time.id}`}
              className={cn(
                'group flex min-h-20 items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card p-5 shadow-sm',
                cardFocus,
              )}
            >
              <div>
                <p className="font-display font-semibold">{time.nome}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {time.municipio}, {time.uf}
                </p>
              </div>
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          ))}
        </div>
      ) : null}

      {tab === 'Estrutura' ? (
        <section className="rounded-3xl border border-border/70 bg-card p-5">
          <h2 className="font-display text-xl font-semibold">
            Estrutura publicada
          </h2>
          <p className="mt-3 text-sm font-semibold">
            Responsável: {campeonato.responsavel.nome} ·{' '}
            {campeonato.responsavel.funcao}
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {campeonato.estrutura.map((fase) => (
              <li
                key={fase}
                className="rounded-2xl bg-muted p-4 text-sm font-semibold"
              >
                {fase}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

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
import { Abas, obterIdAba } from '@/components/layout/abas';
import { DestaquePagina } from '@/components/layout/destaque-pagina';
import { EstadoRecurso } from '@/components/layout/estado-recurso';
import { cn } from '@/utils/classes';

const cardFocus =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

const abasCampeonato = [
  'Visão geral',
  'Classificação',
  'Artilharia',
  'Partidas',
  'Times',
  'Estrutura',
] as const;

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
    <div className="mx-auto w-full max-w-[1380px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
      <DestaquePagina
        eyebrow={`${campeonato.modalidade} · ${campeonato.municipio}, ${campeonato.uf}`}
        title={campeonato.nome}
        description={`${campeonato.rodada} · início ${new Date(`${campeonato.inicio}T12:00:00`).toLocaleDateString('pt-BR')}`}
        action={
          <span className="inline-flex border border-accent bg-accent px-3 py-1.5 text-xs font-bold tracking-[0.08em] text-accent-foreground uppercase">
            {estado}
          </span>
        }
      />

      <div className="mb-8 overflow-hidden border-b-2 border-green-dark bg-transparent px-0">
        <Abas
          tabs={abasCampeonato}
          active={tab}
          onChange={setTab}
          panelId="painel-campeonato"
          mobileHint
        />
      </div>

      <div
        id="painel-campeonato"
        role="tabpanel"
        aria-labelledby={obterIdAba('painel-campeonato', tab)}
        tabIndex={0}
      >
        {tab === 'Visão geral' ? (
          <div className="space-y-6">
            {session?.activeContext === 'atleta' ? (
              <CartaoProximoJogo jogo={proximoJogo} />
            ) : null}
            <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
              <section className="border-t-2 border-green-dark bg-card/60 p-5 sm:p-6">
                <h2 className="font-display text-2xl font-bold uppercase">
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
              <section className="border-t-2 border-navy-dark bg-card/60 p-5 sm:p-6">
                <h2 className="font-display text-2xl font-bold uppercase">
                  Últimos resultados
                </h2>
                <div className="mt-3 space-y-2">
                  {partidas
                    .filter((partida) => partida.resultadoPublicado)
                    .map((partida) => (
                      <Link
                        key={partida.id}
                        href={`/partidas/${partida.id}`}
                        className="group flex min-h-12 items-center justify-between border-t border-green-dark/20 px-1 py-3 text-sm font-semibold transition-colors hover:bg-green-pale/60 sm:px-3"
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
          <div className="overflow-x-auto border-t-2 border-green-dark bg-card/70 p-4">
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
                className="block border-t border-green-dark/25 bg-card/60 p-4 transition-colors hover:bg-card"
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
                  'group flex min-h-20 items-center justify-between gap-4 border-t-2 border-green-dark bg-card/70 p-5 transition-colors hover:bg-card',
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
          <section className="border-t-2 border-green-dark bg-card/70 p-5 sm:p-6">
            <h2 className="font-display text-2xl font-bold uppercase">
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
                  className="border-l-2 border-accent bg-muted p-4 text-sm font-semibold"
                >
                  {fase}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}

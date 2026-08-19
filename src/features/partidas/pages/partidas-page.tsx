'use client';

import { ArrowUpRight, MapPin } from 'lucide-react';
import Link from 'next/link';

import { getPublicacaoPartidaMock } from '@/features/partidas/mocks/partida-publicacao.mock';
import { partidas } from '@/mocks/data';
import { PageHero } from '@/shared/components/page-hero';
import { ResourceState } from '@/shared/components/resource-state';
import { cn } from '@/shared/lib/utils';

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

function MatchCard({ partida }: { partida: (typeof partidas)[number] }) {
  const { resultadoPublicado } = getPublicacaoPartidaMock(partida.id);
  const placarPublicado =
    resultadoPublicado &&
    partida.golsCasa !== undefined &&
    partida.golsFora !== undefined;

  return (
    <Link
      href={`/partidas/${partida.id}`}
      className={cn(
        'group block rounded-[24px] border border-border/70 bg-card p-5 shadow-[0_10px_30px_rgba(30,54,43,0.06)] transition-[border-color,box-shadow] duration-150 hover:border-green-light hover:shadow-[0_14px_36px_rgba(30,54,43,0.10)] sm:p-6',
        focusRing,
      )}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="rounded-full bg-muted px-3 py-1.5 font-semibold tracking-[0.1em] uppercase">
          {partida.rodada}
        </span>
        <span>
          {partida.data} · {partida.hora}
        </span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-5">
        <p className="font-display text-base font-semibold tracking-[-0.02em] sm:text-xl">
          {partida.casa}
        </p>
        <div className="rounded-2xl bg-green-dark px-3 py-2 font-display text-sm font-bold text-white shadow-sm sm:px-4 sm:text-base">
          {placarPublicado ? `${partida.golsCasa} × ${partida.golsFora}` : '×'}
        </div>
        <p className="text-right font-display text-base font-semibold tracking-[-0.02em] sm:text-xl">
          {partida.fora}
        </p>
      </div>

      <div className="mt-6 flex min-h-11 items-center justify-between gap-3 border-t border-border/70 pt-4">
        <p className="flex min-w-0 items-center gap-1.5 truncate text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />{' '}
          {partida.campo}
        </p>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-pale text-green-dark transition-colors duration-150 group-hover:bg-green-light/30">
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

export function PartidasPage() {
  const proximas = partidas.filter((partida) => !partida.concluida);
  const resultados = partidas.filter(
    (partida) => getPublicacaoPartidaMock(partida.id).resultadoPublicado,
  );

  return (
    <div className="mx-auto w-full max-w-[1380px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <PageHero
        eyebrow="Agenda e placares"
        title="Partidas"
        description="Horários, locais e resultados publicados em uma visão simples para quem só quer acompanhar o jogo."
      />

      <div className="space-y-10 sm:space-y-12">
        <section>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.15em] text-green-dark uppercase">
                Próximos jogos
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
                Agenda
              </h2>
            </div>
            <span className="rounded-full border border-border/70 bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
              {proximas.length} jogos
            </span>
          </div>

          {proximas.length === 0 ? (
            <ResourceState
              kind="empty"
              title="Nenhuma partida agendada"
              description="Quando novas partidas forem publicadas, elas aparecerão aqui."
            />
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {proximas.map((partida) => (
                <MatchCard key={partida.id} partida={partida} />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.15em] text-green-dark uppercase">
                Jogos encerrados
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
                Resultados
              </h2>
            </div>
            <span className="rounded-full border border-border/70 bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
              {resultados.length} resultados
            </span>
          </div>

          {resultados.length === 0 ? (
            <ResourceState
              kind="empty"
              title="Nenhum resultado publicado"
              description="Os placares públicos aparecerão aqui após a publicação dos jogos."
            />
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {resultados.map((partida) => (
                <MatchCard key={partida.id} partida={partida} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

'use client';

import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  MapPin,
  Trophy,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { EstadoRecurso } from '@/components/layout/estado-recurso';
import { useCampeonatosApi } from '@/contexts/campeonatos-api';
import { usePartidasApi } from '@/contexts/partidas-api';
import type { CampeonatoPublicoResumo, Pagina } from '@/types/api/campeonatos';
import type { PaginaAgendaPartidas } from '@/types/api/partidas';
import { cn } from '@/utils/classes';

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

export function TelaInicioPublico() {
  const campeonatosApi = useCampeonatosApi();
  const partidasApi = usePartidasApi();
  const [campeonatos, setCampeonatos] =
    useState<Pagina<CampeonatoPublicoResumo> | null>(null);
  const [partidas, setPartidas] = useState<PaginaAgendaPartidas | null>(null);
  const [erroCampeonatos, setErroCampeonatos] = useState(false);
  const [erroPartidas, setErroPartidas] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    void campeonatosApi
      .listarCampeonatosPublicos({
        status: 'EM_ANDAMENTO',
        pagina: 1,
        tamanho: 3,
      })
      .then(
        (resposta) => {
          if (!controller.signal.aborted) setCampeonatos(resposta);
        },
        () => {
          if (!controller.signal.aborted) setErroCampeonatos(true);
        },
      );
    void partidasApi
      .listarAgenda({ pagina: 1, tamanho: 3 }, { signal: controller.signal })
      .then(
        (resposta) => {
          if (!controller.signal.aborted) setPartidas(resposta);
        },
        () => {
          if (!controller.signal.aborted) setErroPartidas(true);
        },
      );
    return () => controller.abort();
  }, [campeonatosApi, partidasApi]);

  return (
    <div className="mx-auto w-full max-w-[1380px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
      <header className="mb-8 grid gap-7 border-b-2 border-green-dark pb-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="max-w-3xl">
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-green-mid uppercase">
            <Trophy className="h-4 w-4" aria-hidden="true" />
            Agora no CampoLivre
          </div>
          <h1 className="max-w-4xl font-display text-5xl leading-[0.9] font-extrabold tracking-[-0.025em] text-balance uppercase sm:text-7xl lg:text-[6.5rem]">
            Campeonatos em andamento
          </h1>
          <p className="mt-5 max-w-2xl border-l-2 border-accent pl-4 text-base leading-7 text-muted-foreground sm:text-lg">
            Acompanhe competições públicas e a agenda oficial de cada rodada.
          </p>
        </div>
        <Link
          href="/campeonatos"
          className={cn(
            'inline-flex min-h-11 w-fit items-center gap-2 border border-green-dark px-4 text-sm font-semibold text-green-dark hover:bg-green-dark hover:text-white',
            focusRing,
          )}
        >
          Ver todos os campeonatos
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </header>

      <section aria-label="Campeonatos em andamento">
        {!campeonatos && !erroCampeonatos ? (
          <p role="status">Carregando campeonatos em andamento...</p>
        ) : null}
        {erroCampeonatos ? (
          <EstadoRecurso
            kind="error"
            title="Não foi possível carregar os campeonatos"
            description="A agenda permanece disponível quando sua consulta responde."
          />
        ) : null}
        {campeonatos?.itens.length === 0 ? (
          <EstadoRecurso
            kind="empty"
            title="Nenhum campeonato em andamento"
            description="Consulte o catálogo completo para ver competições encerradas."
          />
        ) : null}
        {campeonatos?.itens.length ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {campeonatos.itens.map((campeonato, index) => (
              <Link
                key={campeonato.id}
                href={`/campeonatos/${campeonato.id}`}
                className={cn(
                  'group flex min-h-60 flex-col border-t-4 p-6',
                  index === 0
                    ? 'campo-lines border-accent bg-green-dark text-white'
                    : 'border-green-dark bg-card',
                  focusRing,
                )}
              >
                <ArrowUpRight className="ml-auto h-5 w-5" aria-hidden="true" />
                <div className="mt-auto">
                  <p className="text-xs font-semibold uppercase">
                    Em andamento
                  </p>
                  <h2 className="mt-2 font-display text-3xl font-bold uppercase">
                    {campeonato.nome}
                  </h2>
                  <p className="mt-4 flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                    {campeonato.municipio.nome}/{campeonato.municipio.uf}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : null}
      </section>

      <section
        className="mt-14 border-t-2 border-navy-dark pt-7 sm:mt-20"
        aria-labelledby="agenda-partidas-title"
      >
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-green-mid uppercase">
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              Agenda pública
            </p>
            <h2
              id="agenda-partidas-title"
              className="font-display text-3xl font-bold uppercase sm:text-4xl"
            >
              Agenda de partidas
            </h2>
          </div>
          <Link
            href="/partidas"
            className={cn(
              'inline-flex min-h-11 items-center gap-2 px-3 text-sm font-semibold text-green-dark hover:bg-green-pale',
              focusRing,
            )}
          >
            Ver agenda completa
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {!partidas && !erroPartidas ? (
          <p role="status">Carregando agenda...</p>
        ) : null}
        {erroPartidas ? (
          <EstadoRecurso
            kind="error"
            title="Não foi possível carregar a agenda"
            description="Os Campeonatos permanecem disponíveis quando sua consulta responde."
          />
        ) : null}
        {partidas?.itens.length === 0 ? (
          <EstadoRecurso
            kind="empty"
            title="Nenhuma partida na agenda"
            description="A consulta padrão cobre os próximos 30 dias."
          />
        ) : null}
        {partidas?.itens.length ? (
          <div className="divide-y divide-green-dark/25 border-y border-green-dark/25">
            {partidas.itens.map((partida) => (
              <Link
                key={partida.partidaId}
                href={`/partidas/${partida.partidaId}`}
                className="grid gap-2 bg-card/55 p-5 hover:bg-card sm:grid-cols-[1fr_auto]"
              >
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    {partida.campeonato.nome} · Rodada {partida.rodada}
                  </p>
                  <p className="mt-2 font-display text-lg font-semibold">
                    {partida.mandante.nome} × {partida.visitante.nome}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {partida.campo?.nome ?? 'Campo a definir'}
                  </p>
                </div>
                <ArrowRight
                  className="h-5 w-5 self-center text-green-dark"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}

'use client';

import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  MapPin,
  Trophy,
  Users,
} from 'lucide-react';
import Link from 'next/link';

import type { CampeonatoPublico, PartidaPublica } from '@/types/publico';
import {
  obterNomeCampoPartida,
  obterNomeCampeonatoPublico,
  obterNomeTimePublico,
  catalogoPublicoMock,
} from '@/services/publico/catalogo-publico.mock';
import { EstadoRecurso } from '@/components/layout/estado-recurso';
import { cn } from '@/utils/classes';

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

const formatLabels = {
  PONTOS_CORRIDOS: 'Pontos corridos',
  MATA_MATA: 'Mata-mata',
  GRUPOS_MATA_MATA: 'Grupos + mata-mata',
} as const;

function ChampionshipCard({
  campeonato,
  featured = false,
}: {
  campeonato: CampeonatoPublico;
  featured?: boolean;
}) {
  return (
    <Link
      href={`/campeonatos/${campeonato.id}`}
      className={cn(
        'group relative flex min-h-[270px] flex-col overflow-hidden rounded-md border p-5 transition-[border-color,transform] duration-200 hover:-translate-y-0.5 sm:p-7',
        featured
          ? 'campo-lines border-green-dark bg-green-dark text-white lg:col-span-6'
          : 'border-green-dark/25 bg-card hover:border-green-dark lg:col-span-3',
        focusRing,
      )}
    >
      <div className="relative flex items-start justify-between gap-4">
        <span
          className={cn(
            'inline-flex items-center gap-2 border-b pb-1.5 text-xs font-semibold tracking-[0.12em] uppercase',
            featured
              ? 'border-white/35 text-white'
              : 'border-green-dark/35 text-green-dark',
          )}
        >
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
          </span>
          Em andamento
        </span>
        <ArrowUpRight
          className={cn(
            'h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5',
            featured ? 'text-white/80' : 'text-green-dark',
          )}
          aria-hidden="true"
        />
      </div>

      <div className="relative mt-auto pt-14">
        <p
          className={cn(
            'text-xs font-semibold tracking-[0.14em] uppercase',
            featured ? 'text-white/90' : 'text-muted-foreground',
          )}
        >
          {campeonato.modalidade}
        </p>
        <h2
          className={cn(
            'mt-2 max-w-xl font-display leading-[0.95] font-bold tracking-[-0.02em] uppercase',
            featured ? 'text-3xl sm:text-4xl lg:text-5xl' : 'text-3xl',
          )}
        >
          {campeonato.nome}
        </h2>
        <div
          className={cn(
            'mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm',
            featured ? 'text-white/90' : 'text-muted-foreground',
          )}
        >
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4" aria-hidden="true" />
            {campeonato.municipio}, {campeonato.uf}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-4 w-4" aria-hidden="true" />
            {campeonato.timeIds.length} times
          </span>
        </div>
        <div
          className={cn(
            'mt-5 flex items-center justify-between border-t pt-4 text-sm font-semibold',
            featured
              ? 'border-white/15 text-white'
              : 'border-border/70 text-green-dark',
          )}
        >
          <span>{campeonato.rodada}</span>
          <span
            className={cn(
              'text-xs font-medium',
              featured ? 'text-white/90' : 'text-green-dark/70',
            )}
          >
            {formatLabels[campeonato.formato]}
          </span>
        </div>
      </div>
    </Link>
  );
}

function MatchRow({ partida }: { partida: PartidaPublica }) {
  const date = partida.data
    ? new Date(`${partida.data}T12:00:00`).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
      })
    : 'A definir';

  return (
    <Link
      href={`/partidas/${partida.id}`}
      className={cn(
        'group grid gap-4 border-t border-green-dark/25 bg-card/55 p-4 transition-colors hover:bg-card sm:grid-cols-[116px_minmax(0,1fr)_auto] sm:items-center sm:px-5 sm:py-6',
        focusRing,
      )}
    >
      <div className="flex items-center gap-3 sm:block">
        <p className="text-sm font-bold text-green-dark">{date}</p>
        <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
          {partida.hora ?? 'A definir'}
        </p>
      </div>

      <div className="min-w-0 border-border/70 sm:border-l sm:pl-5">
        <p className="truncate text-xs font-semibold tracking-[0.1em] text-muted-foreground uppercase">
          {obterNomeCampeonatoPublico(partida.campeonatoId)} · {partida.rodada}
        </p>
        <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 font-display font-semibold">
          <span className="truncate">
            {obterNomeTimePublico(partida.timeCasaId)}
          </span>
          <span className="border-x border-green-dark/25 px-2.5 py-1 text-xs font-bold text-green-dark">
            ×
          </span>
          <span className="truncate text-right">
            {obterNomeTimePublico(partida.timeForaId)}
          </span>
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">
            {obterNomeCampoPartida(partida.campoId)}
          </span>
        </p>
      </div>

      <ArrowRight
        className="hidden h-5 w-5 text-green-dark transition-transform group-hover:translate-x-1 sm:block"
        aria-hidden="true"
      />
    </Link>
  );
}

export function TelaInicioPublico() {
  const campeonatos = catalogoPublicoMock
    .listarCampeonatos({
      estado: 'EM_ANDAMENTO',
      ordenacao: 'RECENTES',
    })
    .sort((a, b) => b.timeIds.length - a.timeIds.length);
  const campeonatoIds = new Set(campeonatos.map((campeonato) => campeonato.id));
  const partidas = catalogoPublicoMock
    .listarPartidas()
    .filter(
      (partida) =>
        campeonatoIds.has(partida.campeonatoId) &&
        ['AGENDADA', 'A_DEFINIR', 'ADIADA'].includes(partida.estado),
    )
    .sort((a, b) =>
      (a.data ?? '9999-12-31').localeCompare(b.data ?? '9999-12-31'),
    )
    .slice(0, 3);

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
            Acompanhe primeiro o que está acontecendo: competições ativas e a
            agenda pública de cada rodada.
          </p>
        </div>
        <Link
          href="/campeonatos"
          className={cn(
            'inline-flex min-h-11 w-fit items-center gap-2 rounded-md border border-green-dark bg-transparent px-4 text-sm font-semibold text-green-dark transition-colors hover:bg-green-dark hover:text-white',
            focusRing,
          )}
        >
          Ver todos os campeonatos
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </header>

      <section aria-label="Campeonatos em andamento">
        {campeonatos.length === 0 ? (
          <EstadoRecurso
            kind="empty"
            title="Nenhum campeonato em andamento"
            description="Consulte o catálogo completo para ver competições programadas ou já encerradas."
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-12">
            {campeonatos.map((campeonato, index) => (
              <ChampionshipCard
                key={campeonato.id}
                campeonato={campeonato}
                featured={index === 0}
              />
            ))}
          </div>
        )}
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
              className="font-display text-3xl font-bold tracking-[-0.01em] uppercase sm:text-4xl"
            >
              Agenda de partidas
            </h2>
          </div>
          <Link
            href="/partidas"
            className={cn(
              'inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-green-dark transition-colors hover:bg-green-pale',
              focusRing,
            )}
          >
            Ver agenda completa
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        {partidas.length === 0 ? (
          <EstadoRecurso
            kind="empty"
            title="Nenhuma partida na agenda"
            description="As partidas aparecerão aqui quando forem publicadas pelos campeonatos em andamento."
          />
        ) : (
          <div className="border-b border-green-dark/25">
            {partidas.map((partida) => (
              <MatchRow key={partida.id} partida={partida} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

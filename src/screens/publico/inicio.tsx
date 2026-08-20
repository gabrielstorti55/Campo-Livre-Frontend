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
        'group relative flex min-h-[250px] flex-col overflow-hidden rounded-[28px] border p-5 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:p-6',
        featured
          ? 'border-green-dark bg-green-dark text-white shadow-[0_18px_48px_rgba(20,63,45,0.18)]'
          : 'border-border/70 bg-card shadow-sm hover:border-green-light',
        focusRing,
      )}
    >
      {featured ? (
        <>
          <img
            src="/soccer-field.jpg"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover opacity-20 transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-green-dark via-green-dark/95 to-green-mid/80" />
        </>
      ) : null}

      <div className="relative flex items-start justify-between gap-4">
        <span
          className={cn(
            'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold',
            featured
              ? 'bg-white/12 text-white'
              : 'bg-green-pale text-green-dark',
          )}
        >
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-45 motion-reduce:animate-none" />
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

      <div className="relative mt-auto pt-10">
        <p
          className={cn(
            'text-xs font-semibold tracking-[0.14em] uppercase',
            featured ? 'text-white/90' : 'text-muted-foreground',
          )}
        >
          {campeonato.modalidade}
        </p>
        <h2 className="mt-2 font-display text-2xl leading-tight font-semibold tracking-[-0.03em] sm:text-3xl">
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
        'group grid gap-4 rounded-2xl border border-border/70 bg-card p-4 shadow-sm transition-[border-color,box-shadow] hover:border-green-light hover:shadow-md sm:grid-cols-[116px_minmax(0,1fr)_auto] sm:items-center sm:p-5',
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
          <span className="rounded-lg bg-green-pale px-2.5 py-1 text-xs font-bold text-green-dark">
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
    <div className="mx-auto w-full max-w-[1380px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <header className="mb-7 flex flex-col gap-5 border-b border-border/70 pb-7 sm:mb-9 sm:flex-row sm:items-end sm:justify-between sm:pb-8">
        <div className="max-w-3xl">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-green-mid uppercase">
            <Trophy className="h-4 w-4" aria-hidden="true" />
            Agora no CampoLivre
          </div>
          <h1 className="font-display text-4xl leading-[1.05] font-semibold tracking-[-0.045em] text-balance sm:text-5xl lg:text-6xl">
            Campeonatos em andamento
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Acompanhe primeiro o que está acontecendo: competições ativas e a
            agenda pública de cada rodada.
          </p>
        </div>
        <Link
          href="/campeonatos"
          className={cn(
            'inline-flex min-h-11 w-fit items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold text-green-dark shadow-sm transition hover:border-green-light hover:bg-green-pale/40',
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
          <div className="grid gap-4 lg:grid-cols-3">
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
        className="mt-12 sm:mt-16"
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
              className="font-display text-2xl font-semibold tracking-[-0.03em] sm:text-3xl"
            >
              Agenda de partidas
            </h2>
          </div>
          <Link
            href="/partidas"
            className={cn(
              'inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-green-dark transition-colors hover:bg-green-pale',
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
          <div className="grid gap-3">
            {partidas.map((partida) => (
              <MatchRow key={partida.id} partida={partida} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

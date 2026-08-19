'use client';

import {
  ArrowUpRight,
  CalendarDays,
  ShieldCheck,
  Trophy,
  Users,
} from 'lucide-react';
import Link from 'next/link';

import {
  getSessionHome,
  useSession,
} from '@/features/auth/session/session-context';
import { cn } from '@/shared/lib/utils';

const publicAreas = [
  {
    title: 'Campeonatos',
    description: 'Classificações, formatos, cidades e resultados publicados.',
    icon: Trophy,
    to: '/campeonatos',
  },
  {
    title: 'Times',
    description: 'Informações públicas das equipes sem expor dados pessoais.',
    icon: Users,
    to: '/times',
  },
  {
    title: 'Partidas',
    description: 'Agenda, locais e placares para acompanhar o jogo.',
    icon: CalendarDays,
    to: '/partidas',
  },
] as const;

const benefits = [
  {
    title: 'Navegação livre',
    description: 'Sem cadastro para consultar o que é público.',
    icon: Trophy,
  },
  {
    title: 'Dados protegidos',
    description: 'Informações pessoais continuam fora da área pública.',
    icon: ShieldCheck,
  },
  {
    title: 'Links diretos',
    description: 'Compartilhe campeonatos, times e partidas por URL.',
    icon: ArrowUpRight,
  },
] as const;

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

export function HomePage() {
  const { session } = useSession();
  const accountHome = session ? getSessionHome(session) : '/login';

  return (
    <div className="mx-auto w-full max-w-[1380px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <section className="relative overflow-hidden rounded-[32px] bg-green-dark text-white shadow-[0_20px_60px_rgba(20,63,45,0.16)]">
        <img
          src="/soccer-field.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-green-dark via-green-dark/95 to-green-dark/72" />

        <div className="relative grid min-h-[430px] gap-10 px-5 py-8 sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:items-end lg:px-12 lg:py-12">
          <div className="max-w-3xl self-end">
            <p className="text-xs font-semibold tracking-[0.18em] text-white/75 uppercase">
              CampoLivre LigaPro
            </p>
            <h1 className="mt-3 max-w-3xl font-display text-4xl leading-[1.03] font-semibold tracking-[-0.045em] text-balance sm:text-5xl lg:text-6xl">
              O esporte da cidade, aberto para quem quer acompanhar.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/80 lg:text-lg">
              Consulte campeonatos, times e partidas sem criar conta. Entre
              apenas quando precisar participar ou administrar algo.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/campeonatos"
                className={cn(
                  'inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-green-dark shadow-sm transition-[background-color,box-shadow] duration-150 hover:bg-green-pale hover:shadow-md',
                  focusRing,
                )}
              >
                Explorar campeonatos
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href={accountHome}
                className="inline-flex min-h-12 items-center rounded-xl border border-white/20 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-sm transition-colors duration-150 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-green-dark motion-reduce:backdrop-blur-none"
              >
                {session ? 'Ir para minha área' : 'Entrar na minha conta'}
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {publicAreas.map((area) => {
              const Icon = area.icon;
              return (
                <Link
                  key={area.title}
                  href={area.to}
                  className="group flex min-h-24 items-center gap-4 rounded-2xl border border-white/15 bg-black/20 p-4 backdrop-blur-md transition-[background-color,border-color,box-shadow] duration-150 hover:border-white/25 hover:bg-white/10 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white motion-reduce:backdrop-blur-none"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-base font-semibold">
                      {area.title}
                    </p>
                    <p className="mt-1 text-sm leading-5 text-white/75">
                      {area.description}
                    </p>
                  </div>
                  <ArrowUpRight
                    className="h-4 w-4 shrink-0 text-white/70 transition-colors group-hover:text-white"
                    aria-hidden="true"
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section
        className="grid gap-4 py-6 sm:grid-cols-3 sm:py-8"
        aria-label="Benefícios da área pública"
      >
        {benefits.map(({ title, description, icon: Icon }) => (
          <article
            key={title}
            className="rounded-2xl border border-border/70 bg-card p-5 shadow-[0_8px_24px_rgba(30,54,43,0.05)] sm:p-6"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-green-pale text-green-dark">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </div>
            <h2 className="font-display text-base font-semibold tracking-[-0.02em]">
              {title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}

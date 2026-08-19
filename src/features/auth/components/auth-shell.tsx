'use client';

import type { ReactNode } from 'react';
import { CalendarDays, MapPin, Trophy, Users } from 'lucide-react';

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-[minmax(400px,0.9fr)_minmax(560px,1.1fr)]">
      <aside
        data-testid="auth-brand-panel"
        className="relative flex min-h-48 overflow-hidden px-6 py-6 text-white sm:min-h-56 sm:px-10 lg:min-h-screen lg:px-12 lg:py-10 xl:px-16"
      >
        <img
          src="/soccer-field.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        <div className="absolute inset-0 bg-green-dark/75" />

        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10" />

        <div className="relative z-10 flex w-full flex-col justify-between gap-10">
          <div>
            <div className="flex items-center gap-3">
              {/* <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-green-dark shadow-sm">
                <Trophy className="h-5 w-5" strokeWidth={2.2} />
              </div> */}

              <div>
                <p className="font-display text-xl font-bold tracking-[-0.025em]">
                  CampoLivre
                </p>

                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-white/80">
                  <MapPin className="h-3 w-3" />
                  <span>LigaPro</span>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-md lg:pb-3">
            <p className="mb-4 text-xs font-semibold tracking-[0.16em] text-white/70 uppercase">
              O esporte amador conectado
            </p>

            <h2 className="font-display text-3xl leading-[1.08] font-semibold tracking-[-0.035em] text-balance sm:text-4xl lg:text-[2.7rem]">
              Seu time, seus campeonatos, sua cidade.
            </h2>

            {/* <p className="mt-5 hidden max-w-sm text-sm leading-6 text-white/80 lg:block">
              Um só lugar para acompanhar partidas, organizar competições,
              conectar atletas e aproximar o esporte da cidade.
            </p> */}

            <div className="mt-8 hidden grid-cols-2 gap-3 lg:grid">
              <div className="flex items-center gap-3 rounded-xl border border-white/15 bg-black/15 px-4 py-3 backdrop-blur-md">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <Trophy className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-sm font-medium">Campeonatos</p>
                  <p className="text-xs text-white/65">Da inscrição à final</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-white/15 bg-black/15 px-4 py-3 backdrop-blur-md">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <Users className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-sm font-medium">Times</p>
                  <p className="text-xs text-white/65">Elencos e atletas</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-white/15 bg-black/15 px-4 py-3 backdrop-blur-md">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <CalendarDays className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-sm font-medium">Partidas</p>
                  <p className="text-xs text-white/65">Agenda e resultados</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-white/15 bg-black/15 px-4 py-3 backdrop-blur-md">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <MapPin className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-sm font-medium">Estatisticas</p>
                  <p className="text-xs text-white/65">Desempenho e métricas</p>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-2 text-xs text-white/55 lg:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
            <span>Gestão simples</span>
          </div>
        </div>
      </aside>

      <main className="flex items-start justify-center px-6 py-10 sm:px-10 lg:min-h-screen lg:items-center lg:px-16 lg:py-14">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}

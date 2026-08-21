'use client';

import { MapPin } from 'lucide-react';
import type { ReactNode } from 'react';

export function LayoutAutenticacao({ children }: { children: ReactNode }) {
  return (
    <div className="campo-canvas min-h-screen bg-background lg:grid lg:grid-cols-[minmax(400px,0.88fr)_minmax(560px,1.12fr)]">
      <aside
        data-testid="auth-brand-panel"
        className="campo-lines relative flex min-h-52 overflow-hidden bg-navy-dark px-6 py-6 text-white sm:min-h-60 sm:px-10 lg:min-h-screen lg:px-12 lg:py-10 xl:px-16"
      >
        <div className="relative z-10 flex w-full flex-col justify-between gap-10">
          <div>
            <p className="font-display text-2xl leading-none font-extrabold tracking-[0.02em] uppercase">
              CampoLivre
            </p>
            <p className="mt-1 text-[0.65rem] font-semibold tracking-[0.18em] text-white/65 uppercase">
              Futebol local, jogo aberto
            </p>
          </div>

          <div className="max-w-md border-l-2 border-accent pl-5 lg:pl-7">
            <p className="mb-3 text-xs font-semibold tracking-[0.16em] text-accent uppercase">
              O jogo da cidade
            </p>
            <h2 className="font-display text-4xl leading-[0.95] font-bold tracking-[0.01em] text-balance uppercase sm:text-5xl lg:text-6xl">
              Seu time, seus campeonatos, sua cidade.
            </h2>
            <p className="mt-5 hidden max-w-sm text-sm leading-6 text-white/72 lg:block">
              Acompanhe o futebol local e acesse as operações vinculadas à sua
              conta em um só campo.
            </p>
          </div>

          <div className="flex items-center gap-2 border-t border-white/20 pt-4 text-xs font-medium text-white/65">
            <MapPin className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            <span>Franca, SP · esporte amador conectado</span>
          </div>
        </div>
      </aside>

      <main className="flex items-start justify-center bg-background px-6 py-10 sm:px-10 lg:min-h-screen lg:items-center lg:px-16 lg:py-14">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}

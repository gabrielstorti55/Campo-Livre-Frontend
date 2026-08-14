import type { ReactNode } from 'react';

/**
 * Estrutura compartilhada da autenticação.
 * No desktop, separa identidade e tarefa; no mobile, reduz a marca a um cabeçalho.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-[minmax(360px,0.85fr)_minmax(560px,1.15fr)]">
      <aside
        data-testid="auth-brand-panel"
        className="relative flex min-h-44 overflow-hidden bg-green-dark px-6 py-6 text-white sm:min-h-52 sm:px-10 lg:min-h-screen lg:px-12 lg:py-10 xl:px-16"
      >
        <div
          aria-hidden="true"
          className="absolute top-1/2 right-[-8%] hidden aspect-[7/10] w-[76%] -translate-y-1/2 border border-white/15 lg:block"
        >
          <span className="absolute top-1/2 left-0 h-px w-full bg-white/15" />
          <span className="absolute top-1/2 left-1/2 aspect-square w-[32%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15" />
          <span className="absolute top-0 left-1/2 h-[15%] w-[38%] -translate-x-1/2 border-x border-b border-white/15" />
          <span className="absolute bottom-0 left-1/2 h-[15%] w-[38%] -translate-x-1/2 border-x border-t border-white/15" />
        </div>

        <div className="relative z-10 flex w-full flex-col justify-between gap-8">
          <div>
            <p className="font-display text-xl font-bold tracking-[-0.02em]">
              CampoLivre
            </p>
            <p className="mt-0.5 text-xs text-white/70">LigaPro · Franca, SP</p>
          </div>

          <div className="max-w-sm lg:pb-4">
            <p className="text-xs font-semibold tracking-[0.14em] text-white/65 uppercase">
              Gestão de campeonatos municipais
            </p>
            <p className="mt-3 hidden font-display text-3xl leading-tight font-semibold tracking-[-0.025em] text-pretty sm:block lg:text-4xl">
              Do primeiro jogo à final, tudo no mesmo campo.
            </p>
            <p className="mt-4 hidden max-w-xs text-sm leading-6 text-white/70 lg:block">
              Atletas, organizadores e Prefeitura conectados à rotina do esporte
              amador de Franca.
            </p>
          </div>
        </div>
      </aside>

      <main className="flex items-start justify-center px-6 py-10 sm:px-10 lg:min-h-screen lg:items-center lg:px-16 lg:py-14">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}

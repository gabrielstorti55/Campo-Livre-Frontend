'use client';

import { CircleDot, RefreshCw, ShieldAlert } from 'lucide-react';

import type { SumulaPublicaMock } from '@/features/partidas/mocks/partida-publicacao.mock';

export function ResumoPartida({
  placar,
  sumula,
}: {
  placar: string;
  sumula: SumulaPublicaMock;
}) {
  const cartoes = sumula.cartoes ?? [];
  const substituicoes = sumula.substituicoes ?? [];

  return (
    <section
      aria-labelledby="resumo-partida-title"
      className="mt-6 rounded-[28px] border border-border/70 bg-card p-5 shadow-[0_12px_34px_rgba(30,54,43,0.06)] sm:p-6"
    >
      <div className="flex flex-col gap-3 border-b border-border/70 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.14em] text-green-dark uppercase">
            Resultado publicado
          </p>
          <h2
            id="resumo-partida-title"
            className="mt-1 font-display text-2xl font-semibold tracking-[-0.03em]"
          >
            Resumo da partida
          </h2>
        </div>
        <div className="rounded-2xl bg-green-dark px-4 py-2 font-display text-lg font-bold text-white">
          {placar}
        </div>
      </div>

      {sumula.wo ? (
        <div className="mt-5 rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm">
          Partida encerrada por W.O. Vitória de{' '}
          <strong>{sumula.wo.vencedor}</strong>.
        </div>
      ) : null}

      {sumula.gols.length > 0 ? (
        <div className="mt-6" role="region" aria-labelledby="gols-title">
          <div className="mb-3 flex items-center gap-2">
            <CircleDot className="h-4 w-4 text-green-dark" aria-hidden="true" />
            <h3 id="gols-title" className="font-display text-lg font-semibold">
              Gols
            </h3>
          </div>
          <div className="divide-y divide-border/70 overflow-hidden rounded-2xl border border-border/70">
            {sumula.gols.map((gol, index) => (
              <div
                key={`${gol.autor}-${gol.minuto}-${index}`}
                className="grid gap-1 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {gol.autor}
                  </p>
                  <p className="text-xs text-muted-foreground">{gol.time}</p>
                </div>
                <span className="text-sm font-semibold text-green-dark">
                  {gol.minuto}'
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {cartoes.length > 0 ? (
        <div className="mt-6" role="region" aria-labelledby="cartoes-title">
          <div className="mb-3 flex items-center gap-2">
            <ShieldAlert
              className="h-4 w-4 text-green-dark"
              aria-hidden="true"
            />
            <h3
              id="cartoes-title"
              className="font-display text-lg font-semibold"
            >
              Cartões
            </h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {cartoes.map((cartao, index) => (
              <div
                key={`${cartao.jogador}-${cartao.minuto}-${index}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-muted/35 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {cartao.jogador}
                  </p>
                  <p className="text-xs text-muted-foreground">{cartao.time}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2 text-sm font-semibold">
                  <span
                    className={
                      cartao.tipo === 'amarelo'
                        ? 'h-4 w-3 rounded-[2px] bg-yellow-400'
                        : 'h-4 w-3 rounded-[2px] bg-red-600'
                    }
                    aria-hidden="true"
                  />
                  <span className="capitalize">{cartao.tipo}</span>
                  <span className="text-muted-foreground">
                    {cartao.minuto}'
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {substituicoes.length > 0 ? (
        <div
          className="mt-6"
          role="region"
          aria-labelledby="substituicoes-title"
        >
          <div className="mb-3 flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-green-dark" aria-hidden="true" />
            <h3
              id="substituicoes-title"
              className="font-display text-lg font-semibold"
            >
              Substituições
            </h3>
          </div>
          <div className="space-y-3">
            {substituicoes.map((substituicao, index) => (
              <div
                key={`${substituicao.entra}-${substituicao.minuto}-${index}`}
                className="rounded-2xl border border-border/70 px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                    {substituicao.time}
                  </p>
                  <span className="text-sm font-semibold text-green-dark">
                    {substituicao.minuto}'
                  </span>
                </div>
                <p className="mt-2 text-sm">
                  <span className="text-muted-foreground">Sai:</span>{' '}
                  <strong>{substituicao.sai}</strong>
                  <span className="mx-2 text-muted-foreground">·</span>
                  <span className="text-muted-foreground">Entra:</span>{' '}
                  <strong>{substituicao.entra}</strong>
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

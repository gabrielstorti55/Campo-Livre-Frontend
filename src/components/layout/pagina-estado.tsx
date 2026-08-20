'use client';

import type { ReactNode } from 'react';

export function PaginaEstado({
  title,
  description,
  code,
  actions,
}: {
  title: string;
  description: string;
  code?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-surface px-6 py-12">
      <section className="w-full max-w-xl border-t-4 border-green-dark pt-8">
        <p className="mb-3 text-xs font-bold tracking-[0.16em] text-green-dark uppercase">
          CampoLivre · LigaPro
        </p>
        {code ? (
          <p className="font-display text-7xl font-semibold tracking-[-0.06em] text-green-dark">
            {code}
          </p>
        ) : null}
        <h1 className="mt-4 font-display text-3xl font-semibold tracking-[-0.04em] text-foreground">
          {title}
        </h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          {description}
        </p>
        {actions ? (
          <div className="mt-7 flex flex-wrap gap-2">{actions}</div>
        ) : null}
      </section>
    </main>
  );
}

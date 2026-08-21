'use client';

import type { ReactNode } from 'react';

export function DestaquePagina({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="campo-lines mb-8 overflow-hidden border-y-2 border-green-dark bg-navy-dark text-white sm:mb-10">
      <div className="relative z-10 px-5 py-9 sm:px-8 sm:py-11 lg:px-10 lg:py-14">
        <div className="flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">
              {eyebrow}
            </p>
            <h1 className="mt-3 max-w-4xl font-display text-4xl leading-[0.92] font-extrabold tracking-[-0.015em] text-balance uppercase sm:text-6xl lg:text-7xl">
              {title}
            </h1>
            {description ? (
              <p className="mt-4 max-w-2xl border-l-2 border-accent pl-4 text-sm leading-6 text-white/75 sm:text-base">
                {description}
              </p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      </div>
    </header>
  );
}

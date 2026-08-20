'use client';

import { ArrowUpRight, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { catalogoPublicoMock } from '@/services/publico/catalogo-publico.mock';
import { BarraBusca } from '@/components/layout/barra-busca';
import { DestaquePagina } from '@/components/layout/destaque-pagina';
import { EstadoRecurso } from '@/components/layout/estado-recurso';
import { cn } from '@/utils/classes';

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

export function TelaTimes() {
  const [busca, setBusca] = useState('');
  const lista = catalogoPublicoMock.listarTimes(busca);
  return (
    <div className="mx-auto w-full max-w-[1380px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <DestaquePagina
        eyebrow="Clubes e equipes"
        title="Times"
        description="Consulte equipes, histórico e sua projeção esportiva autorizada, preservando dados pessoais."
      />
      <div className="mb-7 grid gap-4 rounded-2xl border border-border/70 bg-card p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-5">
        <div className="max-w-xl">
          <BarraBusca
            placeholder="Buscar times..."
            value={busca}
            onChange={setBusca}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">{lista.length}</strong> times
          públicos
        </p>
      </div>
      {lista.length === 0 ? (
        <EstadoRecurso
          kind="empty"
          title="Nenhum time encontrado"
          description="Tente outro nome. Times não publicados não aparecem nesta consulta."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {lista.map((time) => (
            <Link
              key={time.id}
              href={`/times/${time.id}`}
              className={cn(
                'group rounded-[24px] border border-border/70 bg-card p-5 shadow-sm transition hover:border-green-light hover:shadow-md sm:p-6',
                focusRing,
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-dark font-display text-lg font-bold text-white">
                    {time.escudo}
                  </div>
                  <h2 className="font-display text-xl font-semibold sm:text-2xl">
                    {time.nome}
                  </h2>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                    {time.municipio}, {time.uf}
                  </p>
                </div>
                <span className="rounded-full bg-green-pale px-3 py-1 text-xs font-semibold text-green-dark">
                  Público
                </span>
              </div>
              <div className="mt-6 border-t border-border/70 pt-4 text-sm text-muted-foreground">
                Fundado em {time.fundadoEm} · {time.atletaIds.length} vínculos
                esportivos
              </div>
              <div className="mt-6 flex min-h-11 items-center justify-between text-sm font-semibold text-green-dark">
                Ver time
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

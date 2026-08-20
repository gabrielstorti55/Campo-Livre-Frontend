'use client';

import { useState } from 'react';

import { useEstadoOperacionalPrefeitura } from '@/stores/estado-operacional-prefeitura';
import { Cartao } from '@/components/layout/cartao';
import { Iniciais } from '@/components/layout/iniciais';
import { CabecalhoPagina } from '@/components/layout/cabecalho-pagina';
import { BarraBusca } from '@/components/layout/barra-busca';
import { Button } from '@/components/ui/button';

export function TelaOrganizadoresPrefeitura() {
  const [search, setSearch] = useState('');
  const { state, toggleOrganizer } = useEstadoOperacionalPrefeitura();
  const organizers = state.organizers.filter((organizer) =>
    organizer.name.toLowerCase().includes(search.toLowerCase()),
  );
  const activeCount = state.organizers.filter(
    (organizer) => organizer.status === 'ACTIVE',
  ).length;

  return (
    <>
      <CabecalhoPagina
        title="Organizadores cadastrados"
        subtitle={`${activeCount} organizadores ativos`}
      />
      <BarraBusca
        placeholder="Buscar organizador"
        value={search}
        onChange={setSearch}
      />

      <div className="space-y-3">
        {organizers.map((organizer) => {
          const active = organizer.status === 'ACTIVE';
          return (
            <article key={organizer.id} aria-label={organizer.name}>
              <Cartao className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Iniciais
                  name={organizer.name}
                  tone="navy"
                  className="h-10 w-10 text-xs"
                />
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-display font-semibold text-foreground">
                    {organizer.name}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {organizer.events} eventos organizados ·{' '}
                    <strong>{active ? 'Ativo' : 'Suspenso'}</strong>
                  </p>
                </div>
                <Button
                  variant="campoOutline"
                  tone={active ? 'danger' : 'navy'}
                  aria-label={
                    active
                      ? `Suspender ${organizer.name}`
                      : `Reativar ${organizer.name}`
                  }
                  onClick={() => toggleOrganizer(organizer.id)}
                >
                  {active ? 'Suspender' : 'Reativar'}
                </Button>
              </Cartao>
            </article>
          );
        })}
        {organizers.length === 0 ? (
          <p className="rounded-2xl border border-dashed p-5 text-sm text-muted-foreground">
            Nenhum organizador encontrado.
          </p>
        ) : null}
      </div>
    </>
  );
}

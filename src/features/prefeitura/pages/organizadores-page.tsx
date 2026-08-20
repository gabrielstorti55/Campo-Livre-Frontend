'use client';

import { useState } from 'react';

import { useMunicipalOperationalState } from '@/features/prefeitura/state/municipal-operational-store';
import {
  Card,
  Initials,
  PageHeader,
  SearchBar,
} from '@/shared/components/campo-livre-ui';
import { Button } from '@/shared/components/ui/button';

export function Organizadores() {
  const [search, setSearch] = useState('');
  const { state, toggleOrganizer } = useMunicipalOperationalState();
  const organizers = state.organizers.filter((organizer) =>
    organizer.name.toLowerCase().includes(search.toLowerCase()),
  );
  const activeCount = state.organizers.filter(
    (organizer) => organizer.status === 'ACTIVE',
  ).length;

  return (
    <>
      <PageHeader
        title="Organizadores cadastrados"
        subtitle={`${activeCount} organizadores ativos`}
      />
      <SearchBar
        placeholder="Buscar organizador"
        value={search}
        onChange={setSearch}
      />

      <div className="space-y-3">
        {organizers.map((organizer) => {
          const active = organizer.status === 'ACTIVE';
          return (
            <article key={organizer.id} aria-label={organizer.name}>
              <Card className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Initials
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
              </Card>
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

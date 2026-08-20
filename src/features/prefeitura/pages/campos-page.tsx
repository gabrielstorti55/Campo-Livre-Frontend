'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { useMunicipalOperationalState } from '@/features/prefeitura/state/municipal-operational-store';
import {
  Card,
  PageHeader,
  SearchBar,
} from '@/shared/components/campo-livre-ui';
import { Button } from '@/shared/components/ui/button';

export function Campos() {
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState('');
  const { state, toggleFieldStatus } = useMunicipalOperationalState();
  const fields = state.fields.filter((field) =>
    `${field.name} ${field.neighborhood}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <>
      <PageHeader
        title="Campos cadastrados"
        subtitle={`${state.fields.length} campos municipais`}
        actions={
          <Button variant="campoOutline" tone="navy" className="py-2.5" asChild>
            <Link href="/prefeitura/campos/novo">
              <Plus className="h-4 w-4" /> Novo campo
            </Link>
          </Button>
        }
      />
      <SearchBar
        placeholder="Buscar campo"
        value={search}
        onChange={setSearch}
      />
      {feedback ? (
        <p
          role="status"
          className="rounded-xl bg-blue-50 p-3 text-sm font-semibold text-navy-mid"
        >
          {feedback}
        </p>
      ) : null}

      <div className="space-y-3">
        {fields.map((field) => {
          const available = field.status === 'AVAILABLE';
          return (
            <article aria-label={field.name} key={field.id}>
              <Card className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-display font-semibold text-foreground">
                    {field.name}
                  </h2>
                  <p className="truncate text-xs text-muted-foreground">
                    {field.address} · {field.turf}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-navy-mid">
                    {available ? 'Disponível' : 'Em manutenção'}
                  </p>
                </div>
                <Button
                  variant="campoOutline"
                  tone={available ? 'danger' : 'navy'}
                  aria-label={
                    available
                      ? `Colocar ${field.name} em manutenção`
                      : `Disponibilizar ${field.name}`
                  }
                  onClick={() => {
                    const result = toggleFieldStatus(field.id);
                    setFeedback(
                      result === 'APPROVED_RESERVATIONS'
                        ? 'Manutenção bloqueada: o campo possui reservas aprovadas.'
                        : available
                          ? 'Campo colocado em manutenção.'
                          : 'Campo disponibilizado.',
                    );
                  }}
                >
                  {available ? 'Iniciar manutenção' : 'Disponibilizar'}
                </Button>
              </Card>
            </article>
          );
        })}
        {fields.length === 0 ? (
          <p className="rounded-2xl border border-dashed p-5 text-sm text-muted-foreground">
            Nenhum campo encontrado.
          </p>
        ) : null}
      </div>
    </>
  );
}

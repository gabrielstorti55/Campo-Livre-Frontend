'use client';

import { useState } from 'react';

import {
  Card,
  Initials,
  PageHeader,
  SearchBar,
} from '@/shared/components/campo-livre-ui';
import { organizadores } from '@/mocks/data';

export function Organizadores() {
  const [busca, setBusca] = useState('');
  const lista = organizadores.filter((o) =>
    o.nome.toLowerCase().includes(busca.toLowerCase()),
  );

  return (
    <>
      <PageHeader
        title="Organizadores cadastrados"
        subtitle={`${organizadores.length} organizadores`}
      />
      <SearchBar
        placeholder="Buscar organizador"
        value={busca}
        onChange={setBusca}
      />

      <div className="space-y-3">
        {lista.map((o) => (
          <Card key={o.id} className="flex items-center gap-3">
            <Initials name={o.nome} tone="navy" className="h-10 w-10 text-xs" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-display font-semibold text-foreground">
                {o.nome}
              </p>
              <p className="text-xs text-muted-foreground">
                {o.eventos} eventos organizados
              </p>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

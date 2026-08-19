'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';

import { ListRow } from '@/shared/components/list-row';
import { StatusBadge } from '@/shared/components/status-badge';
import { PageHeader, SearchBar } from '@/shared/components/campo-livre-ui';
import { campeonatos } from '@/mocks/data';

export function OrganizadorCampeonatos() {
  const [busca, setBusca] = useState('');
  const lista = campeonatos.filter((c) =>
    c.nome.toLowerCase().includes(busca.toLowerCase()),
  );

  return (
    <>
      <PageHeader
        title="Meus Campeonatos"
        subtitle="Todos os eventos que você organiza"
        actions={
          <Button variant="campo" className="py-2.5" asChild>
            <Link href="/organizador/novo">
              <Plus className="h-4 w-4" /> Novo
            </Link>
          </Button>
        }
      />
      <SearchBar
        placeholder="Buscar campeonato..."
        value={busca}
        onChange={setBusca}
      />

      <div className="space-y-3">
        {lista.map((c) => (
          <Link key={c.id} href={`/organizador/campeonato/${c.id}`}>
            <ListRow
              title={c.nome}
              subtitle={`${c.modalidade} · ${c.formato} · ${c.times} times`}
              right={<StatusBadge status={c.status} />}
              interactive
            />
          </Link>
        ))}
      </div>
    </>
  );
}

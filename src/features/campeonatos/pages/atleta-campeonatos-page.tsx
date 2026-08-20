'use client';

import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { useState } from 'react';

import { CampeonatoMeta } from '@/features/campeonatos/components/campeonato-meta';
import { StatusBadge } from '@/shared/components/status-badge';
import { ResourceState } from '@/shared/components/resource-state';
import {
  Card,
  PageHeader,
  SearchBar,
} from '@/shared/components/campo-livre-ui';
import { campeonatos } from '@/mocks/data';

export function AtletaCampeonatos() {
  const [busca, setBusca] = useState('');
  const lista = campeonatos.filter((c) =>
    c.nome.toLowerCase().includes(busca.toLowerCase()),
  );

  return (
    <>
      <PageHeader
        title="Campeonatos"
        subtitle="Campeonatos disponíveis na sua região"
      />
      <SearchBar
        placeholder="Buscar campeonatos..."
        value={busca}
        onChange={setBusca}
      />

      {lista.length === 0 ? (
        <ResourceState
          kind="empty"
          title="Nenhum campeonato encontrado"
          description="Revise o termo de busca ou consulte novamente quando novos campeonatos forem publicados."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {lista.map((c) => (
            <section
              key={c.id}
              role="region"
              aria-label={`Campeonato ${c.nome}`}
            >
              <Card className="flex h-full flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link
                      href={`/campeonatos/${c.id}`}
                      className="truncate font-display font-semibold text-foreground hover:text-green-mid"
                    >
                      {c.nome}
                    </Link>
                    <CampeonatoMeta cidade={c.cidade} icon={MapPin} />
                  </div>
                  <StatusBadge status={c.status} />
                </div>
                <CampeonatoMeta
                  times={c.times}
                  modalidade={c.modalidade}
                  formato={c.formato}
                />
                <p className="rounded-lg bg-green-pale px-3 py-2 text-center text-xs font-semibold text-green-dark">
                  Participação por convite do organizador ao capitão
                </p>
              </Card>
            </section>
          ))}
        </div>
      )}
    </>
  );
}

'use client';

import Link from 'next/link';
import { MapPin, Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';

import { Chevron, ListRow, MetaRow } from '@/shared/components/list-row';
import { ProfileHeroHeader } from '@/shared/components/profile-shell';
import { StatusBadge } from '@/shared/components/status-badge';
import {
  FilterPills,
  SearchBar,
  Section,
} from '@/shared/components/campo-livre-ui';
import { campeonatos, organizadorLogado } from '@/mocks/data';

const filtros = ['Todos os tipos', 'Society', 'Campo'];

export function OrganizadorInicio() {
  const [filtro, setFiltro] = useState('Todos os tipos');
  const [busca, setBusca] = useState('');
  const meus = campeonatos.slice(0, 3);
  const regiao = campeonatos.filter(
    (c) =>
      (filtro === 'Todos os tipos' || c.modalidade.includes(filtro)) &&
      c.nome.toLowerCase().includes(busca.toLowerCase()),
  );

  return (
    <>
      <ProfileHeroHeader
        name={organizadorLogado.nome}
        subtitle={organizadorLogado.cidade}
        meta={`Score ${organizadorLogado.score} · ${organizadorLogado.eventos} eventos realizados`}
      />

      <div className="flex justify-end">
        <Button variant="campo" asChild>
          <Link href="/organizador/novo">
            <Plus className="h-4 w-4" /> Novo campeonato
          </Link>
        </Button>
      </div>

      <Section title="Meus campeonatos">
        <div className="space-y-3">
          {meus.map((c) => (
            <Link key={c.id} href={`/organizador/campeonato/${c.id}`}>
              <ListRow
                interactive
                title={c.nome}
                subtitle={`${c.modalidade} · ${c.times} times`}
                right={
                  <>
                    <StatusBadge status={c.status} />
                    <Chevron />
                  </>
                }
              />
            </Link>
          ))}
        </div>
      </Section>

      <Section title="Campeonatos na Região">
        <SearchBar
          placeholder="Buscar campeonato..."
          value={busca}
          onChange={setBusca}
        />
        <FilterPills options={filtros} value={filtro} onChange={setFiltro} />
        <div className="grid gap-x-8 pt-1 md:grid-cols-2">
          {regiao.map((c) => (
            <Link
              key={c.id}
              href={`/organizador/campeonato/${c.id}`}
              className="border-b border-border py-4"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="min-w-0 truncate font-display font-semibold text-foreground">
                    {c.nome}
                  </p>
                  <StatusBadge status={c.status} />
                </div>
                <MetaRow
                  items={[
                    { icon: MapPin, label: `${c.cidade} · ${c.times} times` },
                  ]}
                />
              </div>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}

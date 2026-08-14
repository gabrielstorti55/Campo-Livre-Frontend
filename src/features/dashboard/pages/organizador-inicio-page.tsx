import { Link } from 'react-router-dom';
import { MapPin, Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';

import { Chevron, ListRow, MetaRow } from '@/shared/components/list-row';
import { ProfileHeroHeader } from '@/shared/components/profile-shell';
import { StatusBadge } from '@/shared/components/status-badge';
import {
  Card,
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

      <Section title="Meus campeonatos">
        <div className="space-y-3">
          {meus.map((c) => (
            <Link key={c.id} to={`/organizador/campeonato/${c.id}`}>
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
        <div className="grid gap-4 pt-1 md:grid-cols-2 lg:grid-cols-3">
          {regiao.map((c) => (
            <Link key={c.id} to={`/organizador/campeonato/${c.id}`}>
              <Card className="h-full space-y-2 transition-shadow hover:shadow-md">
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
              </Card>
            </Link>
          ))}
        </div>
      </Section>

      <Button
        variant="campo"
        asChild
        className="fixed right-6 bottom-6 shadow-lg"
      >
        <Link to="/organizador/novo">
          <Plus className="h-4 w-4" /> Novo Campeonato
        </Link>
      </Button>
    </>
  );
}

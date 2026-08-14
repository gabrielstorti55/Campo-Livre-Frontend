import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useState } from 'react';

import { ListRow } from '@/shared/components/list-row';
import { StatusBadge } from '@/shared/components/status-badge';
import {
  PageHeader,
  PrimaryButton,
  SearchBar,
} from '@/shared/components/campo-livre-ui';
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
          <Link to="/organizador/novo">
            <PrimaryButton className="py-2.5">
              <Plus className="h-4 w-4" /> Novo
            </PrimaryButton>
          </Link>
        }
      />
      <SearchBar
        placeholder="Buscar campeonato..."
        value={busca}
        onChange={setBusca}
      />

      <div className="space-y-3">
        {lista.map((c) => (
          <Link key={c.id} to={`/organizador/campeonato/${c.id}`}>
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

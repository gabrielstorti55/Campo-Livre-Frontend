import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';

import {
  Card,
  PageHeader,
  SearchBar,
} from '@/shared/components/campo-livre-ui';
import { campos } from '@/mocks/data';

export function Campos() {
  const [busca, setBusca] = useState('');
  const lista = campos.filter((c) =>
    c.nome.toLowerCase().includes(busca.toLowerCase()),
  );

  return (
    <>
      <PageHeader
        title="Campos cadastrados"
        subtitle={`${campos.length} campos municipais`}
        actions={
          <Button variant="campoOutline" tone="navy" className="py-2.5" asChild>
            <Link to="/prefeitura/campos/novo">
              <Plus className="h-4 w-4" /> Novo campo
            </Link>
          </Button>
        }
      />
      <SearchBar placeholder="Buscar campo" value={busca} onChange={setBusca} />

      <div className="space-y-3">
        {lista.map((c) => (
          <Card key={c.id} className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate font-display font-semibold text-foreground">
                {c.nome}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {c.endereco}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

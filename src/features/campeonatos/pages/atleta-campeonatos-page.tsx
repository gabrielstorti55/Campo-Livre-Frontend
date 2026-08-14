import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { useState } from 'react';

import { CampeonatoMeta } from '@/features/campeonatos/components/campeonato-meta';
import { StatusBadge } from '@/shared/components/status-badge';
import {
  Card,
  PageHeader,
  PrimaryButton,
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {lista.map((c) => (
          <Card key={c.id} className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <Link
                  to={`/atleta/campeonato/${c.id}`}
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
            <PrimaryButton className="w-full py-2.5">
              Solicitar inscrição
            </PrimaryButton>
          </Card>
        ))}
      </div>
    </>
  );
}

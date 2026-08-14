import { Link } from 'react-router-dom';
import { useState } from 'react';

import { Chevron, ListRow } from '@/shared/components/list-row';
import { StatusBadge } from '@/shared/components/status-badge';
import { PageHeader, Tabs } from '@/shared/components/campo-livre-ui';
import { atletaLogado, campeonatos } from '@/mocks/data';

export function MeusEventos() {
  const [tab, setTab] = useState('Ativos');
  const lista = campeonatos.filter((c) =>
    tab === 'Ativos' ? c.status !== 'Encerrado' : c.status === 'Encerrado',
  );

  return (
    <>
      <PageHeader
        title="Meus Eventos"
        subtitle="Campeonatos em que você está inscrito"
      />
      <Tabs tabs={['Ativos', 'Encerrados']} active={tab} onChange={setTab} />

      <div className="space-y-3">
        {lista.map((c) => (
          <Link key={c.id} to={`/atleta/campeonato/${c.id}`}>
            <ListRow
              interactive
              title={c.nome}
              subtitle={`${atletaLogado.time} · ${c.modalidade}${c.encerradoEm ? ` · Encerrado em ${c.encerradoEm}` : ''}`}
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
    </>
  );
}

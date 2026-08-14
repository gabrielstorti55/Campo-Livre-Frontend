import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';

import { ListRow, RowAvatar } from '@/shared/components/list-row';
import {
  Field,
  FormCard,
  PageHeader,
  SearchBar,
  Section,
} from '@/shared/components/campo-livre-ui';
import { Input } from '@/shared/components/ui/input';
import { times } from '@/mocks/data';

export function BuscarTimes() {
  const [busca, setBusca] = useState('');
  const lista = times.filter((t) =>
    t.nome.toLowerCase().includes(busca.toLowerCase()),
  );

  return (
    <>
      <PageHeader
        title="Não encontrou seu time ainda?"
        subtitle="Busque um time existente ou crie o seu"
        actions={
          <Button variant="campoOutline" asChild>
            <Link to="/atleta/time/criar">Criar time</Link>
          </Button>
        }
      />
      <SearchBar
        placeholder="Buscar times..."
        value={busca}
        onChange={setBusca}
      />

      <div className="space-y-3">
        {lista.map((t) => (
          <ListRow
            key={t.id}
            avatar={<RowAvatar name={t.nome} />}
            title={t.nome}
            subtitle={`${t.cidade} · ${t.jogadores} jogadores`}
            right={
              <Button variant="campo" className="py-2.5">
                Solicitar
              </Button>
            }
          />
        ))}
      </div>

      <Section title="Tenho um código de convite">
        <FormCard className="space-y-3">
          <Field label="Código do time" htmlFor="codigo-do-time-field">
            <Input id="codigo-do-time-field" placeholder="Ex.: LIGA-4821" />
          </Field>
          <Button variant="campo" className="w-full">
            Enviar Solicitação
          </Button>
        </FormCard>
      </Section>
    </>
  );
}

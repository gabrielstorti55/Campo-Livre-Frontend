import { Link } from 'react-router-dom';
import { useState } from 'react';

import { ListRow, RowAvatar } from '@/shared/components/list-row';
import {
  Field,
  FormCard,
  OutlineButton,
  PageHeader,
  PrimaryButton,
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
          <Link to="/atleta/time/criar">
            <OutlineButton>Criar time</OutlineButton>
          </Link>
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
            right={<PrimaryButton className="py-2.5">Solicitar</PrimaryButton>}
          />
        ))}
      </div>

      <Section title="Tenho um código de convite">
        <FormCard className="space-y-3">
          <Field label="Código do time">
            <Input placeholder="Ex.: LIGA-4821" />
          </Field>
          <PrimaryButton className="w-full">Enviar Solicitação</PrimaryButton>
        </FormCard>
      </Section>
    </>
  );
}

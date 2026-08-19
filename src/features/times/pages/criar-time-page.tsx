'use client';

import { ImagePlus } from 'lucide-react';
import { useState } from 'react';

import {
  Field,
  FormCard,
  PageHeader,
  Tabs,
} from '@/shared/components/campo-livre-ui';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';

export function CriarTime() {
  const [modalidade, setModalidade] = useState('Society');

  return (
    <>
      <PageHeader
        title="Criar novo time"
        subtitle="Preencha os dados do seu time"
      />

      <FormCard>
        <div className="flex flex-col items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Enviar logo do time"
            className="h-24 w-24 rounded-full border-2 border-dashed bg-surface text-muted-foreground hover:border-green-mid hover:bg-surface"
          >
            <ImagePlus className="h-6 w-6" />
          </Button>
          <span className="text-xs text-muted-foreground">
            Enviar logo do time
          </span>
        </div>

        <Field label="Nome do time" htmlFor="nome-do-time-field">
          <Input id="nome-do-time-field" placeholder="Ex.: Leões FC" />
        </Field>
        <Field label="Cidade" htmlFor="cidade-field">
          <Input id="cidade-field" placeholder="Franca, SP" />
        </Field>

        <div>
          <span className="mb-1.5 block font-display text-sm font-medium text-foreground">
            Modalidade
          </span>
          <Tabs
            tabs={['Society', 'Campo']}
            active={modalidade}
            onChange={setModalidade}
          />
        </div>

        <Field label="Descrição" htmlFor="descricao-field">
          <Textarea
            id="descricao-field"
            rows={4}
            placeholder="Conte um pouco sobre o time"
          />
        </Field>

        <Button variant="campo" className="w-full">
          Salvar e adicionar jogadores
        </Button>
      </FormCard>
    </>
  );
}

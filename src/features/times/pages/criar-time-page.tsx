'use client';

import { ImagePlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useSession } from '@/features/auth/session/session-context';
import {
  Field,
  FormCard,
  PageHeader,
} from '@/shared/components/campo-livre-ui';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { Textarea } from '@/shared/components/ui/textarea';

export function CriarTime() {
  const router = useRouter();
  const { createTeam } = useSession();
  const [modalidade, setModalidade] = useState('Society');

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const teamId = createTeam({
      name: String(data.get('nome') ?? '').trim(),
      city: String(data.get('cidade') ?? '').trim(),
      modality: modalidade === 'Campo' ? 'Campo' : 'Society',
      description: String(data.get('descricao') ?? '').trim(),
    });
    router.push(`/atleta/time/${teamId}`);
  }

  return (
    <>
      <PageHeader
        title="Criar novo time"
        subtitle="Preencha os dados do seu time"
      />

      <form onSubmit={handleSubmit}>
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
            <Input
              id="nome-do-time-field"
              name="nome"
              required
              placeholder="Ex.: Leões FC"
            />
          </Field>
          <Field label="Cidade" htmlFor="cidade-field">
            <Input
              id="cidade-field"
              name="cidade"
              required
              placeholder="Franca, SP"
            />
          </Field>

          <fieldset>
            <legend className="mb-1.5 font-display text-sm font-medium text-foreground">
              Modalidade
            </legend>
            <RadioGroup
              aria-label="Modalidade"
              value={modalidade}
              onValueChange={setModalidade}
              className="grid grid-cols-2 gap-2"
            >
              {['Society', 'Campo'].map((option) => (
                <RadioGroupItem
                  key={option}
                  value={option}
                  className="h-10 w-full rounded-md border border-border px-3 text-sm font-semibold text-muted-foreground shadow-none data-[state=checked]:border-green-mid data-[state=checked]:bg-green-pale data-[state=checked]:text-green-dark"
                >
                  {option}
                </RadioGroupItem>
              ))}
            </RadioGroup>
          </fieldset>

          <Field label="Descrição" htmlFor="descricao-field">
            <Textarea
              id="descricao-field"
              name="descricao"
              rows={4}
              placeholder="Conte um pouco sobre o time"
            />
          </Field>

          <Button type="submit" variant="campo" className="w-full">
            Salvar time e convidar atletas
          </Button>
        </FormCard>
      </form>
    </>
  );
}

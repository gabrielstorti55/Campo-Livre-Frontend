'use client';

import { Card, Field, PageHeader } from '@/shared/components/campo-livre-ui';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import { Button } from '@/shared/components/ui/button';

const bairros = ['Vera Cruz', 'Santa Rita', 'Aeroporto', 'Jardim Palmeiras'];
const gramados = ['Natural', 'Sintético', 'Terra'];

export function NovoCampo() {
  return (
    <>
      <PageHeader title="Cadastrar campo" subtitle="Novo campo municipal" />
      <Card className="max-w-2xl space-y-4">
        <Field label="Nome do campo" htmlFor="nome-do-campo-field">
          <Input id="nome-do-campo-field" placeholder="Ex.: Campo Vera Cruz" />
        </Field>
        <Field label="Endereço completo" htmlFor="endereco-completo-field">
          <Input id="endereco-completo-field" placeholder="Rua, número" />
        </Field>
        <Field label="Bairro / Região" htmlFor="bairro-regiao-field">
          <Select defaultValue={bairros[0] ?? ''}>
            <SelectTrigger id="bairro-regiao-field">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {bairros.map((bairro) => (
                <SelectItem key={bairro} value={bairro}>
                  {bairro}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Tipo de gramado" htmlFor="tipo-de-gramado-field">
          <Select defaultValue={gramados[0] ?? ''}>
            <SelectTrigger id="tipo-de-gramado-field">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {gramados.map((gramado) => (
                <SelectItem key={gramado} value={gramado}>
                  {gramado}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Observações" htmlFor="observacoes-field">
          <Textarea
            id="observacoes-field"
            rows={4}
            placeholder="Iluminação, vestiário, restrições..."
          />
        </Field>
        <Button variant="campo" tone="navy" className="w-full">
          Cadastrar campo
        </Button>
      </Card>
    </>
  );
}

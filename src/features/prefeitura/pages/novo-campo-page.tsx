import {
  Card,
  Field,
  PageHeader,
  PrimaryButton,
} from '@/shared/components/campo-livre-ui';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';

const bairros = ['Vera Cruz', 'Santa Rita', 'Aeroporto', 'Jardim Palmeiras'];
const gramados = ['Natural', 'Sintético', 'Terra'];

export function NovoCampo() {
  return (
    <>
      <PageHeader title="Cadastrar campo" subtitle="Novo campo municipal" />
      <Card className="max-w-2xl space-y-4">
        <Field label="Nome do campo">
          <Input placeholder="Ex.: Campo Vera Cruz" />
        </Field>
        <Field label="Endereço completo">
          <Input placeholder="Rua, número" />
        </Field>
        <Field label="Bairro / Região">
          <Select defaultValue={bairros[0] ?? ''}>
            <SelectTrigger>
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
        <Field label="Tipo de gramado">
          <Select defaultValue={gramados[0] ?? ''}>
            <SelectTrigger>
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
        <Field label="Observações">
          <Textarea
            rows={4}
            placeholder="Iluminação, vestiário, restrições..."
          />
        </Field>
        <PrimaryButton tone="navy" className="w-full">
          Cadastrar campo
        </PrimaryButton>
      </Card>
    </>
  );
}

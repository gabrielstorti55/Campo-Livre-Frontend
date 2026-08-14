import { useState } from 'react';

import {
  Card,
  Field,
  PageHeader,
  PrimaryButton,
  Section,
} from '@/shared/components/campo-livre-ui';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { elenco, proximoJogo } from '@/mocks/data';

export function Sumula() {
  const [casa, setCasa] = useState(0);
  const [fora, setFora] = useState(0);
  const [jogadorCartao, setJogadorCartao] = useState(
    String(elenco[0]?.id ?? ''),
  );
  const [tipoCartao, setTipoCartao] = useState('amarelo');

  return (
    <>
      <PageHeader
        title="Lançar resultado"
        subtitle={`${proximoJogo.data} · ${proximoJogo.hora} · ${proximoJogo.campo}`}
      />

      <Card className="flex items-center justify-center gap-6">
        <div className="text-center">
          <p className="mb-2 font-display font-semibold">{proximoJogo.casa}</p>
          <Input
            type="number"
            min={0}
            value={casa}
            onChange={(e) => setCasa(Number(e.target.value))}
            className="h-20 w-20 rounded-2xl text-center font-display text-3xl font-bold"
          />
        </div>
        <span className="font-display text-2xl text-muted-foreground">x</span>
        <div className="text-center">
          <p className="mb-2 font-display font-semibold">{proximoJogo.fora}</p>
          <Input
            type="number"
            min={0}
            value={fora}
            onChange={(e) => setFora(Number(e.target.value))}
            className="h-20 w-20 rounded-2xl text-center font-display text-3xl font-bold"
          />
        </div>
      </Card>

      <Section title="Artilheiros">
        <Card className="space-y-3">
          {elenco.map((j) => (
            <div key={j.id} className="flex items-center gap-3">
              <span className="min-w-0 flex-1 truncate text-sm">
                {j.nome}{' '}
                <span className="text-muted-foreground">· {j.posicao}</span>
              </span>
              <Input
                type="number"
                min={0}
                defaultValue={0}
                className="w-20 text-center"
                aria-label={`Gols de ${j.nome}`}
              />
            </div>
          ))}
        </Card>
      </Section>

      <Section title="Cartões">
        <Card className="grid gap-4 sm:grid-cols-2">
          <Field label="Jogador">
            <Select value={jogadorCartao} onValueChange={setJogadorCartao}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {elenco.map((j) => (
                  <SelectItem key={j.id} value={String(j.id)}>
                    {j.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Tipo de cartão">
            <Select value={tipoCartao} onValueChange={setTipoCartao}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="amarelo">Cartão amarelo</SelectItem>
                <SelectItem value="vermelho">Cartão vermelho</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </Card>
      </Section>

      <PrimaryButton className="w-full">
        Confirmar resultado e súmula
      </PrimaryButton>
    </>
  );
}

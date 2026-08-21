'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useEstadoOperacionalPrefeitura } from '@/stores/estado-operacional-prefeitura';
import { Cartao } from '@/components/layout/cartao';
import { CampoFormulario } from '@/components/layout/campo-formulario';
import { CabecalhoPagina } from '@/components/layout/cabecalho-pagina';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const bairros = ['Vera Cruz', 'Santa Rita', 'Aeroporto', 'Jardim Palmeiras'];
const gramados = ['Natural', 'Sintético', 'Terra'] as const;

export function TelaCadastrarCampo() {
  const router = useRouter();
  const { state, createField } = useEstadoOperacionalPrefeitura();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState(bairros[0]!);
  const [turf, setTurf] = useState<(typeof gramados)[number]>(gramados[0]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedName = name.trim();
    const normalizedAddress = address.trim();
    if (!normalizedName || !normalizedAddress) {
      setError('Informe nome e endereço válidos.');
      return;
    }
    if (
      state.fields.some(
        (field) =>
          field.name.localeCompare(normalizedName, 'pt-BR', {
            sensitivity: 'base',
          }) === 0,
      )
    ) {
      setError('Já existe um campo cadastrado com esse nome.');
      return;
    }
    createField({
      name: normalizedName,
      address: normalizedAddress,
      neighborhood,
      turf,
      notes: notes.trim(),
    });
    router.push('/prefeitura/campos');
  }

  return (
    <>
      <CabecalhoPagina
        title="Cadastrar campo"
        subtitle="Novo campo municipal"
      />
      <Cartao className="max-w-2xl">
        <form className="space-y-4" onSubmit={submit}>
          {error ? (
            <p
              role="alert"
              className="rounded-md bg-red-50 p-3 text-sm text-red-800"
            >
              {error}
            </p>
          ) : null}
          <CampoFormulario label="Nome do campo" htmlFor="nome-do-campo-field">
            <Input
              id="nome-do-campo-field"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex.: Campo Vera Cruz"
            />
          </CampoFormulario>
          <CampoFormulario
            label="Endereço completo"
            htmlFor="endereco-completo-field"
          >
            <Input
              id="endereco-completo-field"
              required
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="Rua, número"
            />
          </CampoFormulario>
          <CampoFormulario
            label="Bairro / Região"
            htmlFor="bairro-regiao-field"
          >
            <Select value={neighborhood} onValueChange={setNeighborhood}>
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
          </CampoFormulario>
          <CampoFormulario
            label="Tipo de gramado"
            htmlFor="tipo-de-gramado-field"
          >
            <Select
              value={turf}
              onValueChange={(value) =>
                setTurf(value as (typeof gramados)[number])
              }
            >
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
          </CampoFormulario>
          <CampoFormulario label="Observações" htmlFor="observacoes-field">
            <Textarea
              id="observacoes-field"
              rows={4}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Iluminação, vestiário, restrições..."
            />
          </CampoFormulario>
          <Button type="submit" variant="campo" tone="navy" className="w-full">
            Cadastrar campo
          </Button>
        </form>
      </Cartao>
    </>
  );
}

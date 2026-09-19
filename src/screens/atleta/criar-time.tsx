'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type FormEvent } from 'react';

import { CabecalhoPagina } from '@/components/layout/cabecalho-pagina';
import { CampoFormulario } from '@/components/layout/campo-formulario';
import { CartaoFormulario } from '@/components/layout/cartao-formulario';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useMunicipiosApi } from '@/contexts/municipios-api';
import { useTimesApi } from '@/contexts/times-api';
import { useSessao } from '@/hooks/use-sessao';
import type { Municipio } from '@/types/api/municipios';

function novaChave(): string {
  return globalThis.crypto?.randomUUID?.() ?? `criar-time-${Date.now()}`;
}

export function TelaCriarTime() {
  const router = useRouter();
  const timesApi = useTimesApi();
  const municipiosApi = useMunicipiosApi();
  const { executarAutenticado } = useSessao();
  const [nome, setNome] = useState('');
  const [sigla, setSigla] = useState('');
  const [municipioId, setMunicipioId] = useState('');
  const [descricao, setDescricao] = useState('');
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [carregandoMunicipios, setCarregandoMunicipios] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const chave = useRef<string | null>(null);

  useEffect(() => {
    let ativo = true;
    void municipiosApi.listarMunicipios({ pagina: 1, tamanho: 100 }).then(
      (pagina) => {
        if (!ativo) return;
        setMunicipios(pagina.itens);
        setMunicipioId((atual) => atual || pagina.itens[0]?.id || '');
        setCarregandoMunicipios(false);
      },
      () => {
        if (!ativo) return;
        setErro('Não foi possível carregar o catálogo de Municípios.');
        setCarregandoMunicipios(false);
      },
    );
    return () => {
      ativo = false;
    };
  }, [municipiosApi]);

  function novaIntencao(acao: () => void) {
    chave.current = null;
    setErro('');
    acao();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nomeNormalizado = nome.trim().replace(/\s+/g, ' ');
    const siglaNormalizada = sigla.trim().toUpperCase();
    const descricaoNormalizada = descricao.trim() || null;
    if (nomeNormalizado.length < 3 || nomeNormalizado.length > 120) {
      setErro('O nome deve ter entre 3 e 120 caracteres.');
      return;
    }
    if (!/^[A-Z]{3}$/.test(siglaNormalizada)) {
      setErro('A sigla deve conter exatamente três letras.');
      return;
    }
    if (!municipioId) {
      setErro('Selecione um Município do catálogo.');
      return;
    }
    if ((descricaoNormalizada?.length ?? 0) > 500) {
      setErro('A descrição deve ter no máximo 500 caracteres.');
      return;
    }

    chave.current ??= novaChave();
    setSalvando(true);
    setErro('');
    try {
      const criado = await executarAutenticado((accessToken) =>
        timesApi.criarTime(
          accessToken,
          {
            nome: nomeNormalizado,
            sigla: siglaNormalizada,
            municipioId,
            descricao: descricaoNormalizada,
          },
          chave.current!,
        ),
      );
      chave.current = null;
      router.push(`/atleta/time/${criado.id}`);
    } catch {
      setErro(
        'Não foi possível criar o Time. Você pode tentar novamente sem duplicar a criação.',
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <>
      <CabecalhoPagina
        title="Criar novo time"
        subtitle="Você será o único capitão ativo após a criação"
      />

      <form onSubmit={handleSubmit}>
        <CartaoFormulario>
          <p className="border-l-2 border-accent pl-3 text-sm text-muted-foreground">
            O Município não poderá ser alterado depois. O escudo é opcional e
            pode ser enviado na gestão do Time após a criação.
          </p>

          <CampoFormulario label="Nome do time" htmlFor="nome-do-time-field">
            <Input
              id="nome-do-time-field"
              value={nome}
              minLength={3}
              maxLength={120}
              required
              placeholder="Ex.: Leões FC"
              onChange={(event) =>
                novaIntencao(() => setNome(event.target.value))
              }
            />
          </CampoFormulario>

          <CampoFormulario label="Sigla" htmlFor="sigla-time-field">
            <Input
              id="sigla-time-field"
              value={sigla}
              minLength={3}
              maxLength={3}
              pattern="[A-Za-z]{3}"
              required
              placeholder="LEO"
              onChange={(event) =>
                novaIntencao(() => setSigla(event.target.value.toUpperCase()))
              }
            />
          </CampoFormulario>

          <CampoFormulario label="Município" htmlFor="municipio-time-field">
            <select
              id="municipio-time-field"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={municipioId}
              required
              disabled={carregandoMunicipios}
              onChange={(event) =>
                novaIntencao(() => setMunicipioId(event.target.value))
              }
            >
              <option value="">
                {carregandoMunicipios ? 'Carregando...' : 'Selecione'}
              </option>
              {municipios.map((municipio) => (
                <option key={municipio.id} value={municipio.id}>
                  {municipio.nome}/{municipio.uf}
                </option>
              ))}
            </select>
          </CampoFormulario>

          <CampoFormulario label="Descrição pública" htmlFor="descricao-field">
            <Textarea
              id="descricao-field"
              value={descricao}
              rows={4}
              maxLength={500}
              placeholder="Conte um pouco sobre o time"
              onChange={(event) =>
                novaIntencao(() => setDescricao(event.target.value))
              }
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {descricao.length}/500 caracteres
            </p>
          </CampoFormulario>

          {erro ? (
            <p role="alert" className="text-sm text-danger">
              {erro}
            </p>
          ) : null}

          <Button
            type="submit"
            variant="campo"
            className="w-full"
            disabled={salvando || carregandoMunicipios}
          >
            {salvando ? 'Criando Time...' : 'Criar Time'}
          </Button>
        </CartaoFormulario>
      </form>
    </>
  );
}

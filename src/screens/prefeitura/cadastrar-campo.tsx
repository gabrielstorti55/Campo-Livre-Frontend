'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';

import { CabecalhoPagina } from '@/components/layout/cabecalho-pagina';
import { CampoFormulario } from '@/components/layout/campo-formulario';
import { Cartao } from '@/components/layout/cartao';
import { EstadoRecurso } from '@/components/layout/estado-recurso';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCamposApi } from '@/contexts/campos-api';
import { usePrefeiturasApi } from '@/contexts/prefeituras-api';
import { useSessao } from '@/hooks/use-sessao';
import type { PrefeituraDaConta } from '@/types/api/prefeituras';

export function TelaCadastrarCampo() {
  const router = useRouter();
  const camposApi = useCamposApi();
  const prefeiturasApi = usePrefeiturasApi();
  const { session, executarAutenticado } = useSessao();
  const identidade = session?.account.id ?? null;
  const [vinculos, setVinculos] = useState<{
    identidade: string | null;
    itens: PrefeituraDaConta[];
    falhou: boolean;
  }>({ identidade: null, itens: [], falhou: false });
  const [prefeituraId, setPrefeituraId] = useState('');
  const [nome, setNome] = useState('');
  const [endereco, setEndereco] = useState('');
  const [descricao, setDescricao] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!session) return;
    let ativo = true;
    void executarAutenticado((accessToken) =>
      prefeiturasApi.listarMinhasPrefeituras(accessToken, 1, 100),
    ).then(
      (pagina) => {
        if (!ativo) return;
        const responsaveis = pagina.itens.filter(
          (item) =>
            item.papel === 'RESPONSAVEL' && item.prefeitura.status === 'ATIVA',
        );
        setVinculos({ identidade, itens: responsaveis, falhou: false });
        setPrefeituraId(
          (atual) => atual || responsaveis[0]?.prefeitura.id || '',
        );
      },
      () => {
        if (ativo) setVinculos({ identidade, itens: [], falhou: true });
      },
    );
    return () => {
      ativo = false;
    };
  }, [executarAutenticado, identidade, prefeiturasApi, session]);

  const carregado = vinculos.identidade === identidade;
  const responsaveis = carregado ? vinculos.itens : [];
  const falhou = carregado && vinculos.falhou;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nomeNormalizado = nome.trim();
    const enderecoNormalizado = endereco.trim();
    const descricaoNormalizada = descricao.trim() || null;
    if (!prefeituraId || !nomeNormalizado || !enderecoNormalizado) {
      setErro('Informe Prefeitura, nome e endereço válidos.');
      return;
    }
    if (nomeNormalizado.length > 150 || enderecoNormalizado.length > 300) {
      setErro('Revise o tamanho do nome e do endereço.');
      return;
    }
    if ((descricaoNormalizada?.length ?? 0) > 1000) {
      setErro('A descrição deve ter no máximo 1000 caracteres.');
      return;
    }

    setSalvando(true);
    setErro('');
    try {
      const criado = await executarAutenticado((accessToken) =>
        camposApi.cadastrarCampo(prefeituraId, accessToken, {
          nome: nomeNormalizado,
          endereco: enderecoNormalizado,
          descricao: descricaoNormalizada,
        }),
      );
      router.push(`/campos/${criado.id}`);
    } catch {
      setErro('Não foi possível cadastrar o Campo. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  if (!carregado && !falhou) {
    return <p role="status">Validando responsabilidade institucional...</p>;
  }

  if (falhou) {
    return (
      <EstadoRecurso
        kind="error"
        title="Não foi possível validar seu vínculo"
        description="Tente novamente antes de cadastrar um Campo."
      />
    );
  }

  if (responsaveis.length === 0) {
    return (
      <EstadoRecurso
        kind="error"
        title="Responsabilidade institucional necessária"
        description="Somente a pessoa responsável por uma Prefeitura ativa pode cadastrar Campos municipais."
      />
    );
  }

  return (
    <>
      <CabecalhoPagina
        title="Cadastrar campo"
        subtitle="O cadastro será persistido e publicado para consulta"
      />
      <Cartao className="max-w-2xl">
        <form className="space-y-4" onSubmit={submit}>
          <CampoFormulario label="Prefeitura" htmlFor="prefeitura-field">
            <select
              id="prefeitura-field"
              value={prefeituraId}
              onChange={(event) => setPrefeituraId(event.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              required
            >
              {responsaveis.map((vinculo) => (
                <option key={vinculo.membroId} value={vinculo.prefeitura.id}>
                  {vinculo.prefeitura.nomeOficial}
                </option>
              ))}
            </select>
          </CampoFormulario>

          <CampoFormulario label="Nome do campo" htmlFor="nome-do-campo-field">
            <Input
              id="nome-do-campo-field"
              required
              maxLength={150}
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              placeholder="Ex.: Campo Comunitário"
            />
          </CampoFormulario>

          <CampoFormulario
            label="Endereço completo"
            htmlFor="endereco-completo-field"
          >
            <Input
              id="endereco-completo-field"
              required
              maxLength={300}
              value={endereco}
              onChange={(event) => setEndereco(event.target.value)}
              placeholder="Rua, número e complemento"
            />
          </CampoFormulario>

          <CampoFormulario label="Descrição pública" htmlFor="descricao-field">
            <Textarea
              id="descricao-field"
              rows={4}
              maxLength={1000}
              value={descricao}
              onChange={(event) => setDescricao(event.target.value)}
              placeholder="Estrutura e informações públicas do Campo"
            />
          </CampoFormulario>

          {erro ? (
            <p role="alert" className="text-sm text-danger">
              {erro}
            </p>
          ) : null}

          <Button
            type="submit"
            variant="campo"
            tone="navy"
            className="w-full"
            disabled={salvando}
          >
            {salvando ? 'Cadastrando...' : 'Cadastrar campo'}
          </Button>
        </form>
      </Cartao>
    </>
  );
}

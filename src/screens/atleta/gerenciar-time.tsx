'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { type FormEvent, useEffect, useState } from 'react';

import { CabecalhoPagina } from '@/components/layout/cabecalho-pagina';
import { CampoFormulario } from '@/components/layout/campo-formulario';
import { CartaoFormulario } from '@/components/layout/cartao-formulario';
import { EstadoRecurso } from '@/components/layout/estado-recurso';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { GerenciarConvitesTime } from '@/components/times/gerenciar-convites-time';
import { OperacoesTime } from '@/components/times/operacoes-time';
import { useTimesApi } from '@/contexts/times-api';
import { useSessao } from '@/hooks/use-sessao';
import type { TimeDetalhado } from '@/types/api/times';

export function TelaGerenciarTime() {
  const { id } = useParams<{ id: string }>();
  const api = useTimesApi();
  const { executarAutenticado } = useSessao();
  const [detalhe, setDetalhe] = useState<TimeDetalhado | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [falhou, setFalhou] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<'sucesso' | 'erro' | null>(null);
  const [nome, setNome] = useState('');
  const [sigla, setSigla] = useState('');
  const [descricao, setDescricao] = useState('');
  const [arquivoEscudo, setArquivoEscudo] = useState<File | null>(null);
  const [operandoEscudo, setOperandoEscudo] = useState(false);
  const [mensagemEscudo, setMensagemEscudo] = useState<
    'upload' | 'remocao' | 'arquivo-invalido' | 'erro' | null
  >(null);

  useEffect(() => {
    let ativo = true;
    void api.consultarTime(id).then(
      (time) => {
        if (!ativo) return;
        setDetalhe(time);
        setNome(time.nome);
        setSigla(time.sigla);
        setDescricao(time.descricao ?? '');
        setCarregando(false);
      },
      () => {
        if (ativo) {
          setFalhou(true);
          setCarregando(false);
        }
      },
    );
    return () => {
      ativo = false;
    };
  }, [api, id]);

  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSalvando(true);
    setMensagem(null);
    try {
      const resposta = await executarAutenticado((accessToken) =>
        api.atualizarTime(id, accessToken, {
          nome: nome.trim(),
          sigla: sigla.trim(),
          descricao: descricao.trim() || null,
        }),
      );
      setNome(resposta.nome);
      setSigla(resposta.sigla);
      setDescricao(resposta.descricao ?? '');
      setDetalhe((atual) =>
        atual
          ? {
              ...atual,
              nome: resposta.nome,
              sigla: resposta.sigla,
              descricao: resposta.descricao,
            }
          : atual,
      );
      setMensagem('sucesso');
    } catch {
      setMensagem('erro');
    } finally {
      setSalvando(false);
    }
  }

  async function enviarEscudo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !arquivoEscudo ||
      !['image/png', 'image/jpeg', 'image/webp'].includes(arquivoEscudo.type) ||
      arquivoEscudo.size > 2 * 1024 * 1024
    ) {
      setMensagemEscudo('arquivo-invalido');
      return;
    }

    setOperandoEscudo(true);
    setMensagemEscudo(null);
    try {
      const resposta = await executarAutenticado((accessToken) =>
        api.enviarEscudo(id, accessToken, arquivoEscudo),
      );
      setDetalhe((atual) =>
        atual ? { ...atual, escudoUrl: resposta.escudoUrl } : atual,
      );
      setArquivoEscudo(null);
      setMensagemEscudo('upload');
    } catch {
      setMensagemEscudo('erro');
    } finally {
      setOperandoEscudo(false);
    }
  }

  async function removerEscudo() {
    setOperandoEscudo(true);
    setMensagemEscudo(null);
    try {
      await executarAutenticado((accessToken) =>
        api.removerEscudo(id, accessToken),
      );
      setDetalhe((atual) => (atual ? { ...atual, escudoUrl: null } : atual));
      setMensagemEscudo('remocao');
    } catch {
      setMensagemEscudo('erro');
    } finally {
      setOperandoEscudo(false);
    }
  }

  if (carregando) return <p role="status">Carregando dados do time...</p>;
  if (falhou || !detalhe) {
    return (
      <EstadoRecurso
        kind="error"
        title="Time não encontrado"
        description="Não foi possível carregar os dados públicos deste time."
      />
    );
  }

  return (
    <>
      <CabecalhoPagina
        title={detalhe.nome}
        subtitle={`Dados públicos · ${detalhe.municipio.nome}/${detalhe.municipio.uf}`}
        actions={
          <Button variant="campoOutline" asChild>
            <Link href={`/times/${id}`}>Ver página pública</Link>
          </Button>
        }
      />

      <form onSubmit={salvar}>
        <CartaoFormulario>
          <p className="border-l-2 border-accent pl-3 text-sm text-muted-foreground">
            Município, escudo, status, capitão e histórico não são alterados por
            este formulário.
          </p>

          <CampoFormulario label="Nome do time" htmlFor="nome-time">
            <Input
              id="nome-time"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              required
            />
          </CampoFormulario>

          <CampoFormulario label="Sigla" htmlFor="sigla-time">
            <Input
              id="sigla-time"
              value={sigla}
              onChange={(event) => setSigla(event.target.value)}
              required
            />
          </CampoFormulario>

          <CampoFormulario label="Descrição pública" htmlFor="descricao-time">
            <Textarea
              id="descricao-time"
              value={descricao}
              onChange={(event) => setDescricao(event.target.value)}
              maxLength={500}
              rows={5}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {descricao.length}/500 caracteres
            </p>
          </CampoFormulario>

          {mensagem === 'sucesso' ? (
            <p role="status" className="text-sm font-semibold text-green-dark">
              Dados públicos atualizados.
            </p>
          ) : null}
          {mensagem === 'erro' ? (
            <p role="alert" className="text-sm text-danger">
              Não foi possível salvar. Confirme seu vínculo de capitão e o
              estado do time.
            </p>
          ) : null}

          <Button type="submit" variant="campo" disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </CartaoFormulario>
      </form>

      <form onSubmit={enviarEscudo} className="mt-6">
        <CartaoFormulario>
          <div>
            <h2 className="font-display text-xl font-bold">Escudo do time</h2>
            <p className="text-sm text-muted-foreground">
              PNG, JPEG ou WebP de até 2 MB. O servidor normaliza a imagem para
              WebP quadrado de 512×512.
            </p>
          </div>

          <CampoFormulario label="Arquivo do escudo" htmlFor="arquivo-escudo">
            <Input
              id="arquivo-escudo"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) =>
                setArquivoEscudo(event.target.files?.[0] ?? null)
              }
            />
          </CampoFormulario>

          <p className="text-sm text-muted-foreground">
            {detalhe.escudoUrl
              ? 'O time possui um escudo publicado.'
              : 'O time está usando o escudo padrão.'}
          </p>

          {mensagemEscudo === 'upload' ? (
            <p role="status" className="text-sm font-semibold text-green-dark">
              Escudo atualizado.
            </p>
          ) : null}
          {mensagemEscudo === 'remocao' ? (
            <p role="status" className="text-sm font-semibold text-green-dark">
              Escudo removido. O fallback padrão será exibido.
            </p>
          ) : null}
          {mensagemEscudo === 'arquivo-invalido' ? (
            <p role="alert" className="text-sm text-danger">
              Escolha um PNG, JPEG ou WebP de até 2 MB.
            </p>
          ) : null}
          {mensagemEscudo === 'erro' ? (
            <p role="alert" className="text-sm text-danger">
              Não foi possível alterar o escudo. Confirme seu vínculo e tente
              novamente.
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button
              type="submit"
              variant="campo"
              disabled={operandoEscudo || !arquivoEscudo}
            >
              {operandoEscudo ? 'Processando...' : 'Enviar escudo'}
            </Button>
            <Button
              type="button"
              variant="campoOutline"
              disabled={operandoEscudo || !detalhe.escudoUrl}
              onClick={() => void removerEscudo()}
            >
              Remover escudo
            </Button>
          </div>
        </CartaoFormulario>
      </form>

      <GerenciarConvitesTime timeId={id} />
      <OperacoesTime
        timeId={id}
        status={detalhe.status}
        onStatusChange={(status) =>
          setDetalhe((atual) => (atual ? { ...atual, status } : atual))
        }
      />
    </>
  );
}

'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useParams } from 'next/navigation';

import { CabecalhoPagina } from '@/components/layout/cabecalho-pagina';
import { EstadoRecurso } from '@/components/layout/estado-recurso';
import { Button } from '@/components/ui/button';
import { useCamposApi } from '@/contexts/campos-api';
import { useGestaoCamposApi } from '@/contexts/gestao-campos-api';
import { useSessao } from '@/hooks/use-sessao';
import type {
  CampoDetalhado,
  StatusOperacionalCampo,
} from '@/types/api/campos';

export function TelaGerenciarCampo() {
  const { id } = useParams<{ id: string }>();
  const camposApi = useCamposApi();
  const gestaoApi = useGestaoCamposApi();
  const { executarAutenticado } = useSessao();
  const [campo, setCampo] = useState<CampoDetalhado | null>(null);
  const [erro, setErro] = useState(false);
  const [nome, setNome] = useState('');
  const [endereco, setEndereco] = useState('');
  const [descricao, setDescricao] = useState('');
  const [estadoDestino, setEstadoDestino] =
    useState<StatusOperacionalCampo>('ATIVO');
  const [motivo, setMotivo] = useState('');
  const [confirmacao, setConfirmacao] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      const atual = await camposApi.consultarCampo(id);
      setCampo(atual);
      setNome(atual.nome);
      setEndereco(atual.endereco);
      setDescricao(atual.descricao ?? '');
      setEstadoDestino(atual.statusOperacional);
      setErro(false);
    } catch {
      setErro(true);
    }
  }, [camposApi, id]);

  useEffect(() => {
    void Promise.resolve().then(carregar);
  }, [carregar]);

  async function salvar(event: FormEvent) {
    event.preventDefault();
    setProcessando(true);
    setMensagem(null);
    try {
      await executarAutenticado((accessToken) =>
        gestaoApi.atualizarCampo(id, accessToken, {
          nome: nome.trim(),
          endereco: endereco.trim(),
          descricao: descricao.trim() || null,
        }),
      );
      await carregar();
      setMensagem('Campo atualizado.');
    } catch {
      setMensagem('Não foi possível atualizar o Campo.');
    } finally {
      setProcessando(false);
    }
  }

  async function alterarEstado() {
    if (!confirmacao || !motivo.trim()) return;
    setProcessando(true);
    setMensagem(null);
    try {
      await executarAutenticado((accessToken) =>
        gestaoApi.alterarEstadoOperacional(id, accessToken, {
          statusOperacional: estadoDestino,
          motivo: motivo.trim(),
          confirmacao: true,
        }),
      );
      await carregar();
      setMotivo('');
      setConfirmacao(false);
      setMensagem('Estado operacional atualizado.');
    } catch {
      setMensagem('Não foi possível alterar o estado operacional.');
    } finally {
      setProcessando(false);
    }
  }

  if (erro) {
    return (
      <EstadoRecurso
        kind="error"
        title="Campo não disponível"
        description="O Campo não existe ou não pôde ser recuperado."
      />
    );
  }
  if (!campo) return <p role="status">Carregando Campo...</p>;

  return (
    <div className="space-y-8">
      <CabecalhoPagina
        title="Gerenciar Campo"
        subtitle={`${campo.prefeitura.nomeOficial} · ${campo.municipio.nome}/${campo.municipio.uf}`}
      />
      <form className="space-y-4" onSubmit={salvar}>
        <div>
          <label htmlFor="nome-campo" className="text-sm font-medium">
            Nome do campo
          </label>
          <input
            id="nome-campo"
            value={nome}
            onChange={(event) => setNome(event.target.value)}
            className="mt-1 min-h-11 w-full rounded-md border border-border bg-background px-3"
            required
          />
        </div>
        <div>
          <label htmlFor="endereco-campo" className="text-sm font-medium">
            Endereço completo
          </label>
          <input
            id="endereco-campo"
            value={endereco}
            onChange={(event) => setEndereco(event.target.value)}
            className="mt-1 min-h-11 w-full rounded-md border border-border bg-background px-3"
            required
          />
        </div>
        <div>
          <label htmlFor="descricao-campo" className="text-sm font-medium">
            Descrição pública
          </label>
          <textarea
            id="descricao-campo"
            value={descricao}
            onChange={(event) => setDescricao(event.target.value)}
            className="mt-1 min-h-28 w-full rounded-md border border-border bg-background p-3"
          />
        </div>
        <Button type="submit" tone="navy" disabled={processando}>
          Salvar alterações
        </Button>
      </form>

      <section className="border-t border-border pt-6">
        <h2 className="font-display text-2xl font-semibold">
          Estado operacional
        </h2>
        <div className="mt-4 grid gap-4">
          <div>
            <label htmlFor="estado-campo" className="text-sm font-medium">
              Novo estado operacional
            </label>
            <select
              id="estado-campo"
              value={estadoDestino}
              onChange={(event) =>
                setEstadoDestino(event.target.value as StatusOperacionalCampo)
              }
              className="mt-1 min-h-11 w-full rounded-md border border-border bg-background px-3"
            >
              <option value="ATIVO">Ativo</option>
              <option value="EM_MANUTENCAO">Em manutenção</option>
              <option value="INATIVO">Inativo</option>
            </select>
          </div>
          <div>
            <label htmlFor="motivo-estado" className="text-sm font-medium">
              Motivo da alteração
            </label>
            <textarea
              id="motivo-estado"
              value={motivo}
              onChange={(event) => setMotivo(event.target.value)}
              className="mt-1 min-h-24 w-full rounded-md border border-border bg-background p-3"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={confirmacao}
              onChange={(event) => setConfirmacao(event.target.checked)}
            />
            Confirmo a alteração do estado operacional
          </label>
          <Button
            tone="danger"
            disabled={!confirmacao || !motivo.trim() || processando}
            onClick={() => void alterarEstado()}
          >
            Alterar estado
          </Button>
        </div>
      </section>
      {mensagem ? <p role="status">{mensagem}</p> : null}
    </div>
  );
}

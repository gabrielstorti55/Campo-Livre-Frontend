'use client';

import { useCallback, useEffect, useState } from 'react';

import { CabecalhoPagina } from '@/components/layout/cabecalho-pagina';
import { Cartao } from '@/components/layout/cartao';
import { EstadoRecurso } from '@/components/layout/estado-recurso';
import { Button } from '@/components/ui/button';
import { useGestaoPrefeiturasApi } from '@/contexts/gestao-prefeituras-api';
import { useSessao } from '@/hooks/use-sessao';
import type { ConvitePrefeituraRecebido } from '@/types/api/prefeituras';

type Estado =
  | { status: 'carregando' }
  | { status: 'erro' }
  | { status: 'pronto'; convites: ConvitePrefeituraRecebido[] };

type Confirmacao = {
  convite: ConvitePrefeituraRecebido;
  acao: 'aceitar' | 'recusar';
} | null;

export function TelaConvitesPrefeitura() {
  const api = useGestaoPrefeiturasApi();
  const { executarAutenticado, recarregarMinhaConta } = useSessao();
  const [estado, setEstado] = useState<Estado>({ status: 'carregando' });
  const [confirmacao, setConfirmacao] = useState<Confirmacao>(null);
  const [processando, setProcessando] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setEstado({ status: 'carregando' });
    try {
      const pagina = await executarAutenticado((accessToken) =>
        api.listarConvitesRecebidos(accessToken, 1, 100),
      );
      setEstado({ status: 'pronto', convites: pagina.itens });
    } catch {
      setEstado({ status: 'erro' });
    }
  }, [api, executarAutenticado]);

  useEffect(() => {
    void Promise.resolve().then(carregar);
  }, [carregar]);

  async function concluir() {
    if (!confirmacao) return;
    setProcessando(true);
    setMensagem(null);
    try {
      if (confirmacao.acao === 'aceitar') {
        await executarAutenticado((accessToken) =>
          api.aceitarConviteRecebido(
            confirmacao.convite.conviteId,
            accessToken,
          ),
        );
        await recarregarMinhaConta();
        setMensagem('Convite aceito. O vínculo municipal já está ativo.');
      } else {
        await executarAutenticado((accessToken) =>
          api.recusarConviteRecebido(
            confirmacao.convite.conviteId,
            accessToken,
          ),
        );
        setMensagem('Convite recusado.');
      }
      setConfirmacao(null);
      await carregar();
    } catch {
      setMensagem('Não foi possível concluir a ação. Tente novamente.');
    } finally {
      setProcessando(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-[960px] px-4 py-8 sm:px-6 lg:px-8">
      <CabecalhoPagina
        title="Convites de Prefeitura"
        subtitle="Convites institucionais pendentes para sua conta"
      />

      {estado.status === 'carregando' ? (
        <p role="status">Carregando convites...</p>
      ) : null}
      {estado.status === 'erro' ? (
        <EstadoRecurso
          kind="error"
          title="Não foi possível carregar os convites"
          description="Tente novamente em alguns instantes."
        />
      ) : null}
      {estado.status === 'pronto' && estado.convites.length === 0 ? (
        <EstadoRecurso
          kind="empty"
          title="Nenhum convite pendente"
          description="Novos convites institucionais aparecerão aqui."
        />
      ) : null}
      {estado.status === 'pronto' && estado.convites.length > 0 ? (
        <div className="space-y-4">
          {estado.convites.map((convite) => (
            <Cartao key={convite.conviteId}>
              <h2 className="font-display text-xl font-semibold text-foreground">
                {convite.prefeitura.nomeOficial}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {convite.prefeitura.municipio.nome}/
                {convite.prefeitura.municipio.uf} ·{' '}
                {convite.papelDestino === 'RESPONSAVEL'
                  ? 'Responsável institucional'
                  : 'Membro institucional'}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {convite.acoesPermitidas.includes('ACEITAR') ? (
                  <Button
                    tone="green"
                    aria-label={`Aceitar convite da ${convite.prefeitura.nomeOficial}`}
                    onClick={() => setConfirmacao({ convite, acao: 'aceitar' })}
                  >
                    Aceitar
                  </Button>
                ) : null}
                {convite.acoesPermitidas.includes('RECUSAR') ? (
                  <Button
                    variant="campoOutline"
                    tone="danger"
                    aria-label={`Recusar convite da ${convite.prefeitura.nomeOficial}`}
                    onClick={() => setConfirmacao({ convite, acao: 'recusar' })}
                  >
                    Recusar
                  </Button>
                ) : null}
              </div>
            </Cartao>
          ))}
        </div>
      ) : null}

      {confirmacao ? (
        <section
          className="mt-6 border-y border-border py-5"
          aria-live="polite"
        >
          <h2 className="font-display text-xl font-semibold">
            {confirmacao.acao === 'aceitar'
              ? 'Confirmar aceite'
              : 'Confirmar recusa'}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {confirmacao.acao === 'aceitar'
              ? `Ao aceitar, sua conta ganhará o vínculo com ${confirmacao.convite.prefeitura.nomeOficial}.`
              : `O convite de ${confirmacao.convite.prefeitura.nomeOficial} será recusado.`}
          </p>
          <div className="mt-4 flex gap-2">
            <Button
              tone={confirmacao.acao === 'aceitar' ? 'green' : 'danger'}
              disabled={processando}
              onClick={() => void concluir()}
            >
              {confirmacao.acao === 'aceitar'
                ? 'Confirmar aceite'
                : 'Confirmar recusa'}
            </Button>
            <Button
              variant="campoOutline"
              disabled={processando}
              onClick={() => setConfirmacao(null)}
            >
              Cancelar
            </Button>
          </div>
        </section>
      ) : null}
      {mensagem ? (
        <p role="status" className="mt-4 text-sm text-muted-foreground">
          {mensagem}
        </p>
      ) : null}
    </main>
  );
}

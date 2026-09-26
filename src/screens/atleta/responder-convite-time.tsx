'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { CabecalhoPagina } from '@/components/layout/cabecalho-pagina';
import { EstadoRecurso } from '@/components/layout/estado-recurso';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTimesApi } from '@/contexts/times-api';
import { useSessao } from '@/hooks/use-sessao';
import { ErroApi } from '@/services/api/problem-details';
import type { ConviteTimePorToken } from '@/types/api/times';

type Acao = 'ACEITAR' | 'RECUSAR';

function mensagemErro(error: unknown): string {
  if (!(error instanceof ErroApi)) {
    return 'Não foi possível consultar o convite. Tente novamente.';
  }
  if (error.problem.status === 403) {
    return 'Este convite não está disponível para a conta autenticada.';
  }
  if (error.problem.status === 410) {
    return 'O prazo deste convite terminou. As ações não estão mais disponíveis.';
  }
  if (error.problem.status === 409) {
    return 'Este convite já foi encerrado e não pode receber outra resposta.';
  }
  if (error.problem.status === 404) {
    return 'Convite não encontrado.';
  }
  return 'Não foi possível consultar o convite. Tente novamente.';
}

export function TelaResponderConviteTime() {
  const { token } = useParams<{ token: string }>();
  const api = useTimesApi();
  const { session, executarAutenticado } = useSessao();
  const [convite, setConvite] = useState<ConviteTimePorToken | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [acao, setAcao] = useState<Acao | null>(null);
  const [processando, setProcessando] = useState(false);
  const [resultado, setResultado] = useState<'ACEITO' | 'RECUSADO' | null>(
    null,
  );
  const geracao = useRef(0);
  const identidade = `${token}:${session?.sessionId ?? ''}:${session?.account.id ?? ''}`;

  useEffect(() => {
    const atual = ++geracao.current;
    const carregar = async () => {
      await Promise.resolve();
      if (geracao.current !== atual)
        throw new DOMException('Aborted', 'AbortError');
      setConvite(null);
      setErro('');
      setResultado(null);
      setAcao(null);
      setCarregando(true);
      return executarAutenticado((accessToken) =>
        api.consultarConvitePorToken(token, accessToken),
      );
    };
    void carregar().then(
      (resposta) => {
        if (geracao.current !== atual) return;
        setConvite(resposta);
        setCarregando(false);
      },
      (error: unknown) => {
        if (geracao.current !== atual) return;
        setErro(mensagemErro(error));
        setCarregando(false);
      },
    );
    return () => {
      geracao.current += 1;
    };
  }, [api, executarAutenticado, identidade, token]);

  async function confirmar() {
    if (!acao || !convite?.acoesPermitidas.includes(acao)) return;
    const atual = geracao.current;
    setProcessando(true);
    setErro('');
    try {
      if (acao === 'ACEITAR') {
        await executarAutenticado((accessToken) =>
          api.aceitarConvitePorToken(token, accessToken),
        );
        if (geracao.current !== atual) return;
        setResultado('ACEITO');
      } else {
        await executarAutenticado((accessToken) =>
          api.recusarConvitePorToken(token, accessToken),
        );
        if (geracao.current !== atual) return;
        setResultado('RECUSADO');
      }
      setAcao(null);
    } catch (error) {
      if (geracao.current !== atual) return;
      setErro(mensagemErro(error));
      setAcao(null);
    } finally {
      if (geracao.current === atual) setProcessando(false);
    }
  }

  if (carregando) return <p role="status">Carregando convite...</p>;
  if (erro && !convite) {
    return (
      <EstadoRecurso
        kind="error"
        title="Convite indisponível"
        description={erro}
      />
    );
  }
  if (!convite) return null;

  return (
    <>
      <CabecalhoPagina
        title={convite.time.nome}
        subtitle={`Convite para entrar no Time · ${convite.time.sigla}`}
      />
      <section className="max-w-2xl border-t-2 border-green-dark bg-card p-5 sm:p-6">
        <p className="text-sm text-muted-foreground">
          Destinatário: <strong>{convite.destinatario.emailMascarado}</strong>
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Válido até {new Date(convite.expiraEm).toLocaleString('pt-BR')}.
        </p>

        {resultado ? (
          <div className="mt-5 space-y-3">
            <p role="status" className="font-semibold text-green-dark">
              {resultado === 'ACEITO' ? 'Convite aceito.' : 'Convite recusado.'}
            </p>
            {resultado === 'ACEITO' ? (
              <Button asChild variant="campo">
                <Link href="/atleta/time/buscar">Abrir Times e convites</Link>
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="mt-5 flex flex-wrap gap-3">
            {convite.acoesPermitidas.includes('ACEITAR') ? (
              <Button
                variant="campo"
                disabled={processando}
                onClick={() => setAcao('ACEITAR')}
              >
                Aceitar convite
              </Button>
            ) : null}
            {convite.acoesPermitidas.includes('RECUSAR') ? (
              <Button
                variant="campoOutline"
                disabled={processando}
                onClick={() => setAcao('RECUSAR')}
              >
                Recusar convite
              </Button>
            ) : null}
          </div>
        )}
        {erro && convite ? (
          <p role="alert" className="mt-4 text-sm text-danger">
            {erro}
          </p>
        ) : null}
      </section>

      <Dialog
        open={Boolean(acao)}
        onOpenChange={(open) => !open && setAcao(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {acao === 'ACEITAR' ? 'Confirmar aceite' : 'Confirmar recusa'}
            </DialogTitle>
            <DialogDescription>
              {acao === 'ACEITAR'
                ? 'Ao aceitar, sua conta receberá um vínculo ativo de atleta com este Time.'
                : 'Ao recusar, o convite será encerrado e não criará vínculo com o Time.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="campoOutline"
              disabled={processando}
              onClick={() => setAcao(null)}
            >
              Voltar
            </Button>
            <Button
              variant="campo"
              disabled={processando}
              onClick={() => void confirmar()}
            >
              {processando
                ? 'Processando...'
                : acao === 'ACEITAR'
                  ? 'Confirmar aceite'
                  : 'Confirmar recusa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

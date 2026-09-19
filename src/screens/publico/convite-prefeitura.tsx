'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { useGestaoPrefeiturasApi } from '@/contexts/gestao-prefeituras-api';
import { useSessao } from '@/hooks/use-sessao';
import { LayoutAutenticacao } from '@/layouts/autenticacao';
import type { ConvitePrefeituraPorToken } from '@/types/api/prefeituras';

export function TelaConvitePrefeituraPorToken() {
  const { token } = useParams<{ token: string }>();
  const api = useGestaoPrefeiturasApi();
  const { session, hydrated, executarAutenticado, recarregarMinhaConta } =
    useSessao();
  const [convite, setConvite] = useState<ConvitePrefeituraPorToken | null>(
    null,
  );
  const [erro, setErro] = useState('');
  const [acao, setAcao] = useState<'aceitar' | 'recusar' | null>(null);
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    void api.consultarConvitePorToken(token).then(setConvite, () => {
      setErro('Este convite não está disponível ou expirou.');
    });
  }, [api, token]);

  async function confirmar() {
    if (!acao) return;
    try {
      if (acao === 'aceitar') {
        await executarAutenticado((accessToken) =>
          api.aceitarConvitePorToken(token, accessToken),
        );
        await recarregarMinhaConta();
        setMensagem('Convite aceito. O vínculo municipal está ativo.');
      } else {
        await executarAutenticado((accessToken) =>
          api.recusarConvitePorToken(token, accessToken),
        );
        setMensagem('Convite recusado.');
      }
      setAcao(null);
    } catch {
      setMensagem('Não foi possível concluir a ação.');
    }
  }

  return (
    <LayoutAutenticacao>
      <p className="text-xs font-semibold tracking-[0.14em] text-green-dark uppercase">
        Convite institucional
      </p>
      {erro ? (
        <p role="alert" className="mt-4">
          {erro}
        </p>
      ) : null}
      {!convite && !erro ? (
        <p role="status" className="mt-4">
          Consultando convite...
        </p>
      ) : null}
      {convite ? (
        <div className="mt-4 space-y-4">
          <h1 className="font-display text-3xl font-semibold">
            {convite.prefeituraNome}
          </h1>
          <p className="text-sm text-muted-foreground">
            Papel:{' '}
            {convite.papelDestino === 'RESPONSAVEL'
              ? 'Responsável institucional'
              : 'Membro institucional'}
          </p>
          {!hydrated ? <p role="status">Carregando sua conta...</p> : null}
          {hydrated && !session ? (
            <Button asChild>
              <Link href="/login">Entrar para responder</Link>
            </Button>
          ) : null}
          {hydrated && session && !mensagem ? (
            <div className="flex gap-2">
              <Button onClick={() => setAcao('aceitar')}>
                Aceitar convite
              </Button>
              <Button
                tone="danger"
                variant="campoOutline"
                onClick={() => setAcao('recusar')}
              >
                Recusar convite
              </Button>
            </div>
          ) : null}
          {acao ? (
            <div className="border-y border-border py-4">
              <p className="text-sm">
                {acao === 'aceitar'
                  ? 'Confirme a criação do vínculo institucional.'
                  : 'Confirme a recusa definitiva deste convite.'}
              </p>
              <Button
                className="mt-3"
                tone={acao === 'aceitar' ? 'green' : 'danger'}
                onClick={() => void confirmar()}
              >
                {acao === 'aceitar' ? 'Confirmar aceite' : 'Confirmar recusa'}
              </Button>
            </div>
          ) : null}
          {mensagem ? <p role="status">{mensagem}</p> : null}
        </div>
      ) : null}
    </LayoutAutenticacao>
  );
}

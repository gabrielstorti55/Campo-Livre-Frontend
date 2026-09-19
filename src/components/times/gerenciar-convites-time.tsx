'use client';

import { type FormEvent, useEffect, useRef, useState } from 'react';

import { CampoFormulario } from '@/components/layout/campo-formulario';
import { CartaoFormulario } from '@/components/layout/cartao-formulario';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTimesApi } from '@/contexts/times-api';
import { useSessao } from '@/hooks/use-sessao';
import type {
  AtletaParaConvite,
  ConviteTimeEnviado,
  ConviteTimeEnviadoPendente,
} from '@/types/api/times';

function novaChave(): string {
  return crypto.randomUUID();
}

export function GerenciarConvitesTime({ timeId }: { timeId: string }) {
  const api = useTimesApi();
  const { executarAutenticado } = useSessao();
  const [email, setEmail] = useState('');
  const [atleta, setAtleta] = useState<AtletaParaConvite | null>(null);
  const [convite, setConvite] = useState<ConviteTimeEnviado | null>(null);
  const [convitesPendentes, setConvitesPendentes] = useState<
    ConviteTimeEnviadoPendente[]
  >([]);
  const [ocupado, setOcupado] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const chaveEnvio = useRef<string | null>(null);
  const chaveReenvio = useRef<string | null>(null);
  const chavesReenvioPendentes = useRef(new Map<string, string>());

  useEffect(() => {
    let ativo = true;
    void executarAutenticado((accessToken) =>
      api.listarConvitesEnviados(timeId, accessToken, 1, 20),
    ).then(
      (pagina) => {
        if (ativo) setConvitesPendentes(pagina.itens);
      },
      () => {
        if (ativo)
          setMensagem('Não foi possível carregar os convites pendentes.');
      },
    );
    return () => {
      ativo = false;
    };
  }, [api, executarAutenticado, timeId]);

  async function buscar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOcupado(true);
    setMensagem(null);
    setAtleta(null);
    setConvite(null);
    chaveEnvio.current = null;
    try {
      const resultado = await executarAutenticado((accessToken) =>
        api.buscarAtletaParaConvite(email.trim(), accessToken),
      );
      setAtleta(resultado);
    } catch {
      setMensagem('Nenhuma conta ativa foi encontrada para esse e-mail.');
    } finally {
      setOcupado(false);
    }
  }

  async function enviar() {
    if (!atleta) return;
    chaveEnvio.current ??= novaChave();
    setOcupado(true);
    setMensagem(null);
    try {
      const resultado = await executarAutenticado((accessToken) =>
        api.enviarConvite(
          timeId,
          accessToken,
          atleta.usuarioId,
          chaveEnvio.current!,
        ),
      );
      setConvite(resultado);
      chaveEnvio.current = null;
      setMensagem('Convite enviado.');
    } catch {
      setMensagem('Não foi possível enviar o convite.');
    } finally {
      setOcupado(false);
    }
  }

  async function reenviar() {
    if (!convite) return;
    chaveReenvio.current ??= novaChave();
    setOcupado(true);
    setMensagem(null);
    try {
      const resultado = await executarAutenticado((accessToken) =>
        api.reenviarConvite(
          timeId,
          convite.id,
          accessToken,
          chaveReenvio.current!,
        ),
      );
      setConvite((atual) =>
        atual
          ? {
              ...atual,
              linkCompartilhavel: resultado.linkCompartilhavel,
              expiraEm: resultado.expiraEm,
              emailEnvioAceito: resultado.emailEnvioAceito,
            }
          : atual,
      );
      chaveReenvio.current = null;
      setMensagem('Convite reenviado e token rotacionado.');
    } catch {
      setMensagem('Não foi possível reenviar o convite.');
    } finally {
      setOcupado(false);
    }
  }

  async function cancelar() {
    if (!convite) return;
    setOcupado(true);
    setMensagem(null);
    try {
      await executarAutenticado((accessToken) =>
        api.cancelarConvite(timeId, convite.id, accessToken),
      );
      setConvite(null);
      setMensagem('Convite cancelado.');
    } catch {
      setMensagem('Não foi possível cancelar o convite.');
    } finally {
      setOcupado(false);
    }
  }

  async function reenviarPendente(item: ConviteTimeEnviadoPendente) {
    const chave =
      chavesReenvioPendentes.current.get(item.conviteId) ?? novaChave();
    chavesReenvioPendentes.current.set(item.conviteId, chave);
    setOcupado(true);
    setMensagem(null);
    try {
      const resposta = await executarAutenticado((accessToken) =>
        api.reenviarConvite(timeId, item.conviteId, accessToken, chave),
      );
      chavesReenvioPendentes.current.delete(item.conviteId);
      setConvitesPendentes((atuais) =>
        atuais.map((atual) =>
          atual.conviteId === item.conviteId
            ? { ...atual, expiraEm: resposta.expiraEm }
            : atual,
        ),
      );
      setMensagem(
        `Convite reenviado. Novo link: ${resposta.linkCompartilhavel}`,
      );
    } catch {
      setMensagem('Não foi possível reenviar o convite.');
    } finally {
      setOcupado(false);
    }
  }

  async function cancelarPendente(item: ConviteTimeEnviadoPendente) {
    setOcupado(true);
    setMensagem(null);
    try {
      await executarAutenticado((accessToken) =>
        api.cancelarConvite(timeId, item.conviteId, accessToken),
      );
      setConvitesPendentes((atuais) =>
        atuais.filter((atual) => atual.conviteId !== item.conviteId),
      );
      setMensagem('Convite cancelado.');
    } catch {
      setMensagem('Não foi possível cancelar o convite.');
    } finally {
      setOcupado(false);
    }
  }

  return (
    <section className="mt-6" aria-labelledby="convites-time-title">
      <CartaoFormulario>
        <div>
          <h2
            id="convites-time-title"
            className="font-display text-xl font-bold"
          >
            Convidar atleta
          </h2>
          <p className="text-sm text-muted-foreground">
            A busca é exata por e-mail e retorna somente dados minimizados.
          </p>
        </div>

        <form onSubmit={buscar} className="space-y-3">
          <CampoFormulario label="E-mail do atleta" htmlFor="email-atleta">
            <Input
              id="email-atleta"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </CampoFormulario>
          <Button type="submit" variant="campoOutline" disabled={ocupado}>
            Buscar atleta
          </Button>
        </form>

        {atleta ? (
          <div className="border-l-2 border-accent pl-3 text-sm">
            <p className="font-semibold">{atleta.nome}</p>
            <p>@{atleta.nomeUsuario}</p>
            <p>
              {atleta.municipio.nome}/{atleta.municipio.uf} ·{' '}
              {atleta.emailMascarado}
            </p>
            {!convite ? (
              <Button
                type="button"
                variant="campo"
                className="mt-3"
                disabled={ocupado}
                onClick={() => void enviar()}
              >
                Enviar convite
              </Button>
            ) : null}
          </div>
        ) : null}

        {convitesPendentes.length > 0 ? (
          <div className="space-y-3 border-t border-border pt-4">
            <h3 className="font-display text-lg font-bold">
              Convites pendentes
            </h3>
            {convitesPendentes.map((item) => (
              <article
                key={item.conviteId}
                className="border-l-2 border-accent pl-3 text-sm"
              >
                <p className="font-semibold">{item.destinatario.nome}</p>
                <p>@{item.destinatario.nomeUsuario}</p>
                <p>{item.destinatario.emailMascarado}</p>
                <p>
                  Expira em {new Date(item.expiraEm).toLocaleString('pt-BR')}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {item.acoesPermitidas.includes('REENVIAR') ? (
                    <Button
                      type="button"
                      variant="campoOutline"
                      disabled={ocupado}
                      onClick={() => void reenviarPendente(item)}
                    >
                      Reenviar convite para {item.destinatario.nome}
                    </Button>
                  ) : null}
                  {item.acoesPermitidas.includes('CANCELAR') ? (
                    <Button
                      type="button"
                      variant="campoOutline"
                      disabled={ocupado}
                      onClick={() => void cancelarPendente(item)}
                    >
                      Cancelar convite para {item.destinatario.nome}
                    </Button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : null}

        {convite ? (
          <div className="space-y-3 rounded-md border border-border p-3 text-sm">
            <p className="font-semibold">Convite pendente</p>
            <p>
              Expira em {new Date(convite.expiraEm).toLocaleString('pt-BR')}
            </p>
            <CampoFormulario label="Link compartilhável" htmlFor="link-convite">
              <Input
                id="link-convite"
                value={convite.linkCompartilhavel}
                readOnly
              />
            </CampoFormulario>
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="campoOutline"
                disabled={ocupado}
                onClick={() => void reenviar()}
              >
                Reenviar convite
              </Button>
              <Button
                type="button"
                variant="campoOutline"
                disabled={ocupado}
                onClick={() => void cancelar()}
              >
                Cancelar convite
              </Button>
            </div>
          </div>
        ) : null}

        {mensagem ? (
          <p role="status" className="text-sm">
            {mensagem}
          </p>
        ) : null}
      </CartaoFormulario>
    </section>
  );
}

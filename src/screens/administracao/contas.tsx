'use client';

import { useState, type FormEvent } from 'react';

import { CabecalhoPagina } from '@/components/layout/cabecalho-pagina';
import { Button } from '@/components/ui/button';
import { useAdministracaoGlobalApi } from '@/contexts/administracao-global-api';
import { useSessao } from '@/hooks/use-sessao';
import type {
  CategoriaBloqueio,
  UsuarioInstitucional,
} from '@/types/api/administracao-global';

export function TelaContasAdministracao() {
  const api = useAdministracaoGlobalApi();
  const { session, executarAutenticado } = useSessao();
  const [email, setEmail] = useState('');
  const [usuario, setUsuario] = useState<UsuarioInstitucional | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  const [categoria, setCategoria] = useState<CategoriaBloqueio>('SEGURANCA');
  const [motivo, setMotivo] = useState('');
  const [mensagem, setMensagem] = useState<string | null>(null);

  async function buscar(event: FormEvent) {
    event.preventDefault();
    setMensagem(null);
    const resposta = await executarAutenticado((token) =>
      api.buscarUsuarioPorEmail(email, token),
    );
    setUsuario(resposta.itens[0] ?? null);
    if (!resposta.itens[0]) setMensagem('Nenhuma conta encontrada.');
  }

  async function bloquear() {
    if (!usuario || usuario.usuarioId === session?.account.id || !motivo.trim())
      return;
    await executarAutenticado((token) =>
      api.bloquearUsuario(
        usuario.usuarioId,
        { categoria, motivo: motivo.trim() },
        token,
      ),
    );
    setMensagem('Conta bloqueada e sessões revogadas.');
    setConfirmando(false);
    setUsuario(null);
    setMotivo('');
  }

  return (
    <div className="space-y-8">
      <CabecalhoPagina
        title="Contas"
        subtitle="Bloqueio administrativo com revogação de sessões"
      />
      <form className="flex flex-col gap-3 sm:flex-row" onSubmit={buscar}>
        <label className="flex-1 text-sm">
          E-mail exato da conta
          <input
            type="email"
            required
            className="mt-1 min-h-11 w-full border px-3"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <Button type="submit">Buscar conta</Button>
      </form>
      {usuario ? (
        <section className="border-y py-5">
          <h2 className="font-display text-xl font-semibold">{usuario.nome}</h2>
          <p className="text-sm text-muted-foreground">
            @{usuario.nomeUsuario}
          </p>
          {usuario.usuarioId === session?.account.id ? (
            <p role="alert" className="mt-3 text-sm text-danger">
              O administrador não pode bloquear a própria conta.
            </p>
          ) : (
            <Button
              className="mt-3"
              tone="danger"
              onClick={() => setConfirmando(true)}
            >
              Bloquear conta
            </Button>
          )}
        </section>
      ) : null}
      {confirmando ? (
        <section className="border-y py-5">
          <label className="block text-sm">
            Categoria do bloqueio
            <select
              className="mt-1 min-h-11 w-full border px-3"
              value={categoria}
              onChange={(event) =>
                setCategoria(event.target.value as CategoriaBloqueio)
              }
            >
              <option value="SEGURANCA">Segurança</option>
              <option value="FRAUDE">Fraude</option>
              <option value="VIOLACAO_TERMOS">Violação dos termos</option>
              <option value="OUTRO">Outro</option>
            </select>
          </label>
          <label className="mt-3 block text-sm">
            Motivo do bloqueio
            <textarea
              className="mt-1 min-h-24 w-full border p-3"
              value={motivo}
              onChange={(event) => setMotivo(event.target.value)}
            />
          </label>
          <Button
            className="mt-3"
            tone="danger"
            disabled={!motivo.trim()}
            onClick={() => void bloquear()}
          >
            Confirmar bloqueio
          </Button>
        </section>
      ) : null}
      {mensagem ? <p role="status">{mensagem}</p> : null}
    </div>
  );
}

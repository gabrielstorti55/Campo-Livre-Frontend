'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

import { CabecalhoPagina } from '@/components/layout/cabecalho-pagina';
import { Cartao } from '@/components/layout/cartao';
import { Button } from '@/components/ui/button';
import { useAdministracaoGlobalApi } from '@/contexts/administracao-global-api';
import { useSessao } from '@/hooks/use-sessao';
import { ErroApi } from '@/services/api/problem-details';
import type {
  ResumoAdministrador,
  UsuarioInstitucional,
} from '@/types/api/administracao-global';

type Acao =
  | { tipo: 'conceder'; usuario: UsuarioInstitucional }
  | { tipo: 'desbloquear' | 'revogar'; usuario: ResumoAdministrador }
  | null;

export function TelaAdministradores() {
  const api = useAdministracaoGlobalApi();
  const { session, executarAutenticado, recarregarMinhaConta } = useSessao();
  const router = useRouter();
  const [itens, setItens] = useState<ResumoAdministrador[]>([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [filtros, setFiltros] = useState({ nome: '', email: '' });
  const [emailBusca, setEmailBusca] = useState('');
  const [usuario, setUsuario] = useState<UsuarioInstitucional | null>(null);
  const [acao, setAcao] = useState<Acao>(null);
  const [justificativa, setJustificativa] = useState('');
  const [mensagem, setMensagem] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      const resposta = await executarAutenticado((token) =>
        api.listarAdministradores(token, {
          pagina,
          tamanho: 20,
          nome: filtros.nome || undefined,
          email: filtros.email || undefined,
        }),
      );
      setItens(resposta.itens);
      setTotalPaginas(resposta.totalPaginas);
    } catch (erro) {
      if (erro instanceof ErroApi && erro.problem.status === 403) {
        await recarregarMinhaConta();
        router.replace('/minha-area');
        return;
      }
      setMensagem('Não foi possível carregar os administradores.');
    }
  }, [api, executarAutenticado, filtros, pagina, recarregarMinhaConta, router]);

  useEffect(() => {
    void Promise.resolve().then(carregar);
  }, [carregar]);

  async function buscar(event: FormEvent) {
    event.preventDefault();
    const paginaUsuarios = await executarAutenticado((token) =>
      api.buscarUsuarioPorEmail(emailBusca, token),
    );
    setUsuario(paginaUsuarios.itens[0] ?? null);
  }

  async function confirmar() {
    if (!acao) return;
    if (acao.tipo === 'conceder') {
      await executarAutenticado((token) =>
        api.concederAdministrador(acao.usuario.usuarioId, token),
      );
      setMensagem('Autoridade administrativa concedida.');
    } else if (acao.tipo === 'desbloquear') {
      const resposta = await executarAutenticado((token) =>
        api.desbloquearUsuario(acao.usuario.usuarioId, justificativa, token),
      );
      setMensagem(
        resposta.novoLoginNecessario
          ? 'Conta desbloqueada; um novo login será necessário.'
          : 'Conta desbloqueada.',
      );
    } else {
      await executarAutenticado((token) =>
        api.revogarAdministrador(acao.usuario.usuarioId, justificativa, token),
      );
      setMensagem('Autoridade administrativa revogada.');
      if (acao.usuario.usuarioId === session?.account.id) {
        await recarregarMinhaConta();
        router.replace('/minha-area');
        return;
      }
    }
    setAcao(null);
    setJustificativa('');
    setUsuario(null);
    await carregar();
  }

  return (
    <div className="space-y-8">
      <CabecalhoPagina
        title="Administradores"
        subtitle="Autoridade global explícita"
      />
      <form
        className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          setPagina(1);
          setFiltros({ nome: nome.trim(), email: email.trim() });
        }}
      >
        <label className="text-sm">
          Nome do administrador
          <input
            className="mt-1 min-h-11 w-full border px-3"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </label>
        <label className="text-sm">
          E-mail do administrador
          <input
            className="mt-1 min-h-11 w-full border px-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <Button type="submit">Aplicar filtros</Button>
      </form>

      <div className="space-y-3">
        {itens.map((admin) => (
          <Cartao
            key={admin.usuarioId}
            className="flex flex-wrap items-center gap-3"
          >
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-lg font-semibold">
                {admin.nome}
              </h2>
              <p className="text-sm text-muted-foreground">{admin.email}</p>
              <p>{admin.status === 'BLOQUEADA' ? 'Bloqueada' : 'Ativa'}</p>
            </div>
            {admin.status === 'BLOQUEADA' ? (
              <Button
                aria-label={`Desbloquear ${admin.nome}`}
                onClick={() => setAcao({ tipo: 'desbloquear', usuario: admin })}
              >
                Desbloquear
              </Button>
            ) : null}
            <Button
              tone="danger"
              aria-label={`Revogar administração de ${admin.nome}`}
              onClick={() => setAcao({ tipo: 'revogar', usuario: admin })}
            >
              Revogar
            </Button>
          </Cartao>
        ))}
      </div>
      <div className="flex gap-2">
        <Button
          variant="campoOutline"
          disabled={pagina <= 1}
          onClick={() => setPagina((p) => p - 1)}
        >
          Página anterior
        </Button>
        <Button
          variant="campoOutline"
          disabled={pagina >= totalPaginas}
          onClick={() => setPagina((p) => p + 1)}
        >
          Próxima página
        </Button>
      </div>

      <section className="border-t pt-6">
        <h2 className="font-display text-xl font-semibold">
          Conceder administração
        </h2>
        <form className="mt-3 flex gap-3" onSubmit={buscar}>
          <label className="flex-1 text-sm">
            E-mail da conta elegível
            <input
              type="email"
              required
              className="mt-1 min-h-11 w-full border px-3"
              value={emailBusca}
              onChange={(e) => setEmailBusca(e.target.value)}
            />
          </label>
          <Button type="submit">Buscar conta</Button>
        </form>
        {usuario ? (
          <div className="mt-4 border-y py-4">
            <strong>{usuario.nome}</strong>
            <p>@{usuario.nomeUsuario}</p>
            <Button
              className="mt-3"
              onClick={() => setAcao({ tipo: 'conceder', usuario })}
            >
              Conceder administração
            </Button>
          </div>
        ) : null}
      </section>

      {acao ? (
        <section className="border-y py-5">
          <h2 className="font-display text-xl font-semibold">
            {acao.tipo === 'conceder'
              ? 'Confirmar concessão'
              : acao.tipo === 'desbloquear'
                ? 'Confirmar desbloqueio'
                : 'Confirmar revogação'}
          </h2>
          {acao.tipo !== 'conceder' ? (
            <label className="mt-3 block text-sm">
              {acao.tipo === 'desbloquear'
                ? 'Justificativa do desbloqueio'
                : 'Justificativa da revogação'}
              <textarea
                className="mt-1 min-h-24 w-full border p-3"
                value={justificativa}
                onChange={(e) => setJustificativa(e.target.value)}
              />
            </label>
          ) : null}
          <Button
            className="mt-3"
            disabled={acao.tipo !== 'conceder' && !justificativa.trim()}
            onClick={() => void confirmar()}
          >
            {acao.tipo === 'conceder'
              ? 'Confirmar concessão'
              : acao.tipo === 'desbloquear'
                ? 'Confirmar desbloqueio'
                : 'Confirmar revogação'}
          </Button>
        </section>
      ) : null}
      {mensagem ? <p role="status">{mensagem}</p> : null}
    </div>
  );
}

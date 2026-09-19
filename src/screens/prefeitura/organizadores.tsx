'use client';

import { useEffect, useState, type FormEvent } from 'react';

import { CabecalhoPagina } from '@/components/layout/cabecalho-pagina';
import { Cartao } from '@/components/layout/cartao';
import { EstadoRecurso } from '@/components/layout/estado-recurso';
import { Iniciais } from '@/components/layout/iniciais';
import { Secao } from '@/components/layout/secao';
import { Button } from '@/components/ui/button';
import { useGestaoPrefeiturasApi } from '@/contexts/gestao-prefeituras-api';
import { usePrefeiturasApi } from '@/contexts/prefeituras-api';
import { useSessao } from '@/hooks/use-sessao';
import type {
  ConvitePrefeituraEnviado,
  FuncionarioPrefeitura,
  PrefeituraDaConta,
  UsuarioInstitucional,
} from '@/types/api/prefeituras';

type EstadoFuncionarios =
  | { status: 'carregando' }
  | { status: 'sem-responsabilidade' }
  | { status: 'erro' }
  | {
      status: 'pronto';
      prefeitura: PrefeituraDaConta;
      funcionarios: FuncionarioPrefeitura[];
      convites: ConvitePrefeituraEnviado[];
    };

export function TelaOrganizadoresPrefeitura() {
  const api = usePrefeiturasApi();
  const gestaoApi = useGestaoPrefeiturasApi();
  const { executarAutenticado } = useSessao();
  const [estado, setEstado] = useState<EstadoFuncionarios>({
    status: 'carregando',
  });
  const [emailBusca, setEmailBusca] = useState('');
  const [usuarioEncontrado, setUsuarioEncontrado] =
    useState<UsuarioInstitucional | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mensagemConvite, setMensagemConvite] = useState<string | null>(null);
  const [membroEmRemocao, setMembroEmRemocao] =
    useState<FuncionarioPrefeitura | null>(null);
  const [membroEmTransferencia, setMembroEmTransferencia] =
    useState<FuncionarioPrefeitura | null>(null);
  const [motivoRemocao, setMotivoRemocao] = useState('');
  const [processandoAcao, setProcessandoAcao] = useState(false);

  useEffect(() => {
    let ativo = true;
    void executarAutenticado(async (accessToken) => {
      const prefeituras = await api.listarMinhasPrefeituras(
        accessToken,
        1,
        100,
      );
      const prefeitura = prefeituras.itens.find(
        (item) =>
          item.papel === 'RESPONSAVEL' && item.prefeitura.status === 'ATIVA',
      );
      if (!prefeitura) return null;
      const [funcionarios, convites] = await Promise.all([
        gestaoApi.listarFuncionarios(
          prefeitura.prefeitura.id,
          accessToken,
          'ATIVO',
          1,
          100,
        ),
        gestaoApi.listarConvitesEnviados(
          prefeitura.prefeitura.id,
          accessToken,
          1,
          100,
        ),
      ]);
      return { prefeitura, funcionarios, convites };
    }).then(
      (resultado) => {
        if (!ativo) return;
        if (!resultado) {
          setEstado({ status: 'sem-responsabilidade' });
          return;
        }
        setEstado({
          status: 'pronto',
          prefeitura: resultado.prefeitura,
          funcionarios: resultado.funcionarios.itens,
          convites: resultado.convites.itens,
        });
      },
      () => {
        if (ativo) setEstado({ status: 'erro' });
      },
    );
    return () => {
      ativo = false;
    };
  }, [api, executarAutenticado, gestaoApi]);

  async function buscarPessoa(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = emailBusca.trim();
    if (!email) return;
    setBuscando(true);
    setMensagemConvite(null);
    setUsuarioEncontrado(null);
    try {
      const pagina = await executarAutenticado((accessToken) =>
        gestaoApi.buscarUsuarioInstitucional(email, accessToken),
      );
      const usuario = pagina.itens[0] ?? null;
      setUsuarioEncontrado(usuario);
      setIdempotencyKey(usuario ? crypto.randomUUID() : '');
      if (!usuario) setMensagemConvite('Nenhuma conta elegível encontrada.');
    } catch {
      setMensagemConvite('Não foi possível buscar essa conta.');
    } finally {
      setBuscando(false);
    }
  }

  async function enviarConvite() {
    if (estado.status !== 'pronto' || !usuarioEncontrado || !idempotencyKey)
      return;
    setEnviando(true);
    setMensagemConvite(null);
    try {
      await executarAutenticado((accessToken) =>
        gestaoApi.convidarFuncionario(
          estado.prefeitura.prefeitura.id,
          usuarioEncontrado.usuarioId,
          accessToken,
          idempotencyKey,
        ),
      );
      const pagina = await executarAutenticado((accessToken) =>
        gestaoApi.listarConvitesEnviados(
          estado.prefeitura.prefeitura.id,
          accessToken,
          1,
          100,
        ),
      );
      setEstado({ ...estado, convites: pagina.itens });
      setMensagemConvite('Convite enviado com sucesso.');
      setUsuarioEncontrado(null);
      setEmailBusca('');
      setIdempotencyKey('');
    } catch {
      setMensagemConvite('Não foi possível enviar o convite.');
    } finally {
      setEnviando(false);
    }
  }

  async function reenviarConvite(convite: ConvitePrefeituraEnviado) {
    if (estado.status !== 'pronto') return;
    setProcessandoAcao(true);
    setMensagemConvite(null);
    try {
      await executarAutenticado((accessToken) =>
        gestaoApi.reenviarConvite(
          estado.prefeitura.prefeitura.id,
          convite.conviteId,
          accessToken,
          crypto.randomUUID(),
        ),
      );
      const pagina = await executarAutenticado((accessToken) =>
        gestaoApi.listarConvitesEnviados(
          estado.prefeitura.prefeitura.id,
          accessToken,
          1,
          100,
        ),
      );
      setEstado({ ...estado, convites: pagina.itens });
      setMensagemConvite('Convite reenviado com sucesso.');
    } catch {
      setMensagemConvite('Não foi possível reenviar o convite.');
    } finally {
      setProcessandoAcao(false);
    }
  }

  async function confirmarRemocao() {
    if (estado.status !== 'pronto' || !membroEmRemocao || !motivoRemocao.trim())
      return;
    setProcessandoAcao(true);
    try {
      await executarAutenticado((accessToken) =>
        gestaoApi.removerFuncionario(
          estado.prefeitura.prefeitura.id,
          membroEmRemocao.membroId,
          accessToken,
          motivoRemocao,
        ),
      );
      const pagina = await executarAutenticado((accessToken) =>
        gestaoApi.listarFuncionarios(
          estado.prefeitura.prefeitura.id,
          accessToken,
          'ATIVO',
          1,
          100,
        ),
      );
      setEstado({ ...estado, funcionarios: pagina.itens });
      setMembroEmRemocao(null);
      setMotivoRemocao('');
      setMensagemConvite('Funcionário removido.');
    } catch {
      setMensagemConvite('Não foi possível remover o funcionário.');
    } finally {
      setProcessandoAcao(false);
    }
  }

  async function confirmarTransferencia() {
    if (estado.status !== 'pronto' || !membroEmTransferencia) return;
    setProcessandoAcao(true);
    try {
      await executarAutenticado((accessToken) =>
        gestaoApi.transferirResponsabilidade(
          estado.prefeitura.prefeitura.id,
          membroEmTransferencia.membroId,
          accessToken,
        ),
      );
      await executarAutenticado((accessToken) =>
        api.listarMinhasPrefeituras(accessToken, 1, 100),
      );
      setMembroEmTransferencia(null);
      setMensagemConvite('Responsabilidade transferida.');
    } catch {
      setMensagemConvite('Não foi possível transferir a responsabilidade.');
    } finally {
      setProcessandoAcao(false);
    }
  }

  return (
    <>
      <CabecalhoPagina
        title="Funcionários municipais"
        subtitle="Vínculos e convites institucionais confirmados pela API"
      />

      {estado.status === 'carregando' ? (
        <p role="status">Carregando funcionários municipais...</p>
      ) : null}
      {estado.status === 'erro' ? (
        <EstadoRecurso
          kind="error"
          title="Não foi possível carregar os funcionários"
          description="Tente novamente em alguns instantes."
        />
      ) : null}
      {estado.status === 'sem-responsabilidade' ? (
        <EstadoRecurso
          kind="empty"
          title="Gestão restrita ao responsável"
          description="Sua conta não é responsável por uma Prefeitura ativa."
        />
      ) : null}

      {estado.status === 'pronto' ? (
        <div className="space-y-8">
          <Secao title="Convidar funcionário">
            <form className="space-y-3" onSubmit={buscarPessoa}>
              <label
                className="block text-sm font-medium text-foreground"
                htmlFor="email-funcionario"
              >
                E-mail da pessoa
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  id="email-funcionario"
                  type="email"
                  required
                  value={emailBusca}
                  onChange={(event) => setEmailBusca(event.target.value)}
                  className="min-h-11 flex-1 rounded-md border border-border bg-background px-3 text-sm"
                  placeholder="pessoa@exemplo.com"
                />
                <Button type="submit" tone="navy" disabled={buscando}>
                  {buscando ? 'Buscando...' : 'Buscar pessoa'}
                </Button>
              </div>
            </form>

            {usuarioEncontrado ? (
              <div className="mt-4 border-y border-border py-4">
                <p className="font-display font-semibold text-foreground">
                  {usuarioEncontrado.nome}
                </p>
                <p className="text-sm text-muted-foreground">
                  @{usuarioEncontrado.nomeUsuario}
                </p>
                <Button
                  className="mt-3"
                  tone="navy"
                  disabled={enviando}
                  onClick={() => void enviarConvite()}
                >
                  {enviando ? 'Enviando...' : 'Enviar convite'}
                </Button>
              </div>
            ) : null}
            {mensagemConvite ? (
              <p role="status" className="mt-3 text-sm text-muted-foreground">
                {mensagemConvite}
              </p>
            ) : null}
          </Secao>

          <Secao
            title={`Equipe de ${estado.prefeitura.prefeitura.nomeOficial}`}
          >
            <div className="space-y-3">
              {estado.funcionarios.map((funcionario) => (
                <Cartao
                  key={funcionario.membroId}
                  className="flex flex-col gap-3 sm:flex-row sm:items-center"
                >
                  <Iniciais
                    name={funcionario.nome}
                    tone="navy"
                    className="h-10 w-10 text-xs"
                  />
                  <div className="min-w-0 flex-1">
                    <h2 className="font-display font-semibold text-foreground">
                      {funcionario.nome}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      @{funcionario.nomeUsuario} ·{' '}
                      {funcionario.papel === 'RESPONSAVEL'
                        ? 'Responsável institucional'
                        : 'Membro institucional'}
                    </p>
                  </div>
                  {funcionario.papel === 'MEMBRO' ? (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="campoOutline"
                        tone="danger"
                        aria-label={`Remover ${funcionario.nome}`}
                        onClick={() => {
                          setMembroEmRemocao(funcionario);
                          setMembroEmTransferencia(null);
                        }}
                      >
                        Remover
                      </Button>
                      <Button
                        variant="campoOutline"
                        tone="navy"
                        aria-label={`Transferir responsabilidade para ${funcionario.nome}`}
                        onClick={() => {
                          setMembroEmTransferencia(funcionario);
                          setMembroEmRemocao(null);
                        }}
                      >
                        Transferir responsabilidade
                      </Button>
                    </div>
                  ) : null}
                </Cartao>
              ))}
              {estado.funcionarios.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum vínculo ativo encontrado.
                </p>
              ) : null}
            </div>
            {membroEmRemocao ? (
              <div className="mt-4 border-t border-border pt-4">
                <label
                  htmlFor="motivo-remocao"
                  className="block text-sm font-medium"
                >
                  Motivo da remoção
                </label>
                <textarea
                  id="motivo-remocao"
                  value={motivoRemocao}
                  onChange={(event) => setMotivoRemocao(event.target.value)}
                  className="mt-2 min-h-24 w-full rounded-md border border-border bg-background p-3 text-sm"
                />
                <Button
                  className="mt-3"
                  tone="danger"
                  disabled={!motivoRemocao.trim() || processandoAcao}
                  onClick={() => void confirmarRemocao()}
                >
                  Confirmar remoção
                </Button>
              </div>
            ) : null}
            {membroEmTransferencia ? (
              <div className="mt-4 border-t border-border pt-4">
                <p className="text-sm text-muted-foreground">
                  A responsabilidade será transferida para{' '}
                  <strong>{membroEmTransferencia.nome}</strong>. Sua conta
                  passará a ser membro institucional.
                </p>
                <Button
                  className="mt-3"
                  tone="danger"
                  disabled={processandoAcao}
                  onClick={() => void confirmarTransferencia()}
                >
                  Confirmar transferência
                </Button>
              </div>
            ) : null}
          </Secao>

          <Secao title="Convites pendentes">
            <div className="space-y-3">
              {estado.convites.map((convite) => (
                <Cartao key={convite.conviteId}>
                  <h2 className="font-display font-semibold text-foreground">
                    {convite.destinatario.nome}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    @{convite.destinatario.nomeUsuario}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {convite.destinatario.emailMascarado}
                  </p>
                  {convite.acoesPermitidas.includes('REENVIAR') ? (
                    <Button
                      className="mt-3"
                      variant="campoOutline"
                      tone="navy"
                      disabled={processandoAcao}
                      aria-label={`Reenviar convite para ${convite.destinatario.nome}`}
                      onClick={() => void reenviarConvite(convite)}
                    >
                      Reenviar
                    </Button>
                  ) : null}
                </Cartao>
              ))}
              {estado.convites.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum convite pendente.
                </p>
              ) : null}
            </div>
          </Secao>
        </div>
      ) : null}
    </>
  );
}

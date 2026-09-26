import { act, render, screen, waitFor } from '@testing-library/react';
import { useEffect, useRef, useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ErroApi } from '@/services/api/problem-details';
import type { AutenticacaoApi } from '@/services/autenticacao/autenticacao-api';
import { useSessao } from '@/hooks/use-sessao';
import { ProvedorSessao } from '@/stores/sessao';
import type { MinhaConta, RespostaLogin } from '@/types/api/autenticacao';

const account: MinhaConta = {
  id: 'conta-1',
  nome: 'Ana Souza',
  nomeUsuario: 'anasouza',
  email: 'ana@campolivre.test',
  emailPendente: null,
  emailConfirmado: true,
  telefone: null,
  cpf: '00000000000',
  rg: { numero: '000000000', orgaoExpedidor: 'SSP', uf: 'SP' },
  dataNascimento: '1997-01-01',
  idade: 29,
  municipio: { id: 'municipio-franca', nome: 'Franca', uf: 'SP' },
  fotoUrl: null,
  biografia: null,
  posicaoPrincipal: null,
  status: 'ATIVA',
  organizadorHabilitado: false,
  administrador: false,
  criadoEm: '2026-01-01T00:00:00.000Z',
  atualizadoEm: '2026-01-01T00:00:00.000Z',
};

const renewal = {
  accessToken: 'refresh-token',
  tokenTipo: 'Bearer' as const,
  accessTokenExpiraEm: '2030-01-01T00:15:00.000Z',
  refreshToken: null,
  refreshTokenExpiraEm: '2030-01-30T00:00:00.000Z',
};

function createApi(overrides: Partial<AutenticacaoApi> = {}): AutenticacaoApi {
  return {
    ativarOrganizador: vi.fn().mockResolvedValue({
      organizadorHabilitado: true,
      organizadorHabilitadoEm: '2030-01-01T12:00:00.000Z',
    }),
    desativarConta: vi.fn().mockResolvedValue({
      contaInativada: true,
      sessoesRevogadas: true,
      eliminacaoPrevistaEm: '2030-04-01T12:00:00.000Z',
      prazoDias: 90,
    }),
    login: vi.fn().mockResolvedValue({
      ...renewal,
      accessToken: 'login-token',
      usuario: {
        id: account.id,
        nome: account.nome,
        nomeUsuario: account.nomeUsuario,
        administrador: false,
        organizadorHabilitado: false,
      },
    }),
    renovar: vi.fn().mockResolvedValue(renewal),
    logout: vi.fn().mockResolvedValue(undefined),
    consultarMinhaConta: vi.fn().mockResolvedValue(account),
    atualizarMinhaConta: vi.fn().mockResolvedValue(account),
    enviarFotoMinhaConta: vi.fn(),
    removerFotoMinhaConta: vi.fn(),
    alterarSenha: vi.fn(),
    solicitarAlteracaoEmail: vi.fn(),
    confirmarAlteracaoEmail: vi.fn(),
    reativarConta: vi.fn(),
    solicitarReativacaoConta: vi.fn(),
    confirmarReativacaoConta: vi.fn(),
    solicitarRecuperacao: vi.fn(),
    redefinirSenha: vi.fn(),
    cadastrar: vi.fn(),
    confirmarEmail: vi.fn(),
    reenviarConfirmacaoEmail: vi.fn(),
    ...overrides,
  };
}

function Probe() {
  const auth = useSessao();
  const [resultado, setResultado] = useState('');
  return (
    <div>
      <span data-testid="status">{auth.status}</span>
      <span data-testid="email">{auth.session?.account.email ?? ''}</span>
      <span data-testid="cidade">{auth.session?.account.city ?? ''}</span>
      <span data-testid="erro">{auth.erroSessao ?? ''}</span>
      <span data-testid="resultado">{resultado}</span>
      <span data-testid="organizador">
        {auth.session?.capabilities.includes('organizador') ? 'sim' : 'nao'}
      </span>
      <button
        onClick={() => {
          void auth.enableOrganizer().then(() => setResultado('ativado'));
        }}
      >
        ativar organizador
      </button>
      <button
        type="button"
        onClick={() =>
          void auth.signIn(' ANA@CAMPO.test ', 'senha').catch(() => undefined)
        }
      >
        login
      </button>
      <button type="button" onClick={() => void auth.signOut()}>
        logout
      </button>
      <button
        type="button"
        onClick={() =>
          void auth
            .executarAutenticado(async (accessToken) => accessToken)
            .then(setResultado)
        }
      >
        executar autenticado
      </button>
    </div>
  );
}

describe('ProvedorSessao', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('preserva o contexto escolhido ao recarregar a conta e ao remontar o provedor', async () => {
    const contaOrganizadora = { ...account, organizadorHabilitado: true };
    const api = createApi({
      consultarMinhaConta: vi.fn().mockResolvedValue(contaOrganizadora),
    });

    function ProbeContexto() {
      const auth = useSessao();
      return (
        <>
          <span data-testid="contexto-ativo">
            {auth.session?.activeContext ?? 'nenhum'}
          </span>
          <button
            type="button"
            onClick={() => auth.switchContext('organizador')}
          >
            escolher organizador
          </button>
          <button
            type="button"
            onClick={() => void auth.recarregarMinhaConta()}
          >
            recarregar conta
          </button>
        </>
      );
    }

    const primeiraMontagem = render(
      <ProvedorSessao api={api} modo="prototipo">
        <ProbeContexto />
      </ProvedorSessao>,
    );
    await waitFor(() =>
      expect(screen.getByTestId('contexto-ativo')).toHaveTextContent('nenhum'),
    );

    screen.getByRole('button', { name: 'escolher organizador' }).click();
    await waitFor(() =>
      expect(screen.getByTestId('contexto-ativo')).toHaveTextContent(
        'organizador',
      ),
    );

    screen.getByRole('button', { name: 'recarregar conta' }).click();
    await waitFor(() =>
      expect(screen.getByTestId('contexto-ativo')).toHaveTextContent(
        'organizador',
      ),
    );

    primeiraMontagem.unmount();
    render(
      <ProvedorSessao api={api} modo="prototipo">
        <ProbeContexto />
      </ProvedorSessao>,
    );
    await waitFor(() =>
      expect(screen.getByTestId('contexto-ativo')).toHaveTextContent(
        'organizador',
      ),
    );
  });

  it('recupera a sessão por refresh e consulta a própria conta', async () => {
    const api = createApi();
    render(
      <ProvedorSessao api={api}>
        <Probe />
      </ProvedorSessao>,
    );

    expect(screen.getByTestId('status')).toHaveTextContent('carregando');
    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('autenticado'),
    );
    expect(screen.getByTestId('email')).toHaveTextContent(account.email);
    expect(api.renovar).toHaveBeenCalledTimes(1);
    expect(api.consultarMinhaConta).toHaveBeenCalledWith('refresh-token');
  });

  it('hidrata conta ativa mesmo quando a projeção privada contém campos nullable', async () => {
    const accountNullable: MinhaConta = {
      ...account,
      cpf: null,
      rg: { numero: null, orgaoExpedidor: null, uf: null },
      dataNascimento: null,
      idade: null,
      municipio: null,
    };
    const api = createApi({
      consultarMinhaConta: vi.fn().mockResolvedValue(accountNullable),
    });

    render(
      <ProvedorSessao api={api}>
        <Probe />
      </ProvedorSessao>,
    );

    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('autenticado'),
    );
    expect(screen.getByTestId('cidade')).toBeEmptyDOMElement();
  });

  it('habilita organizador somente após a resposta autenticada da API', async () => {
    let concluir!: (value: {
      organizadorHabilitado: true;
      organizadorHabilitadoEm: string;
    }) => void;
    const ativarOrganizador = vi.fn(
      () =>
        new Promise<{
          organizadorHabilitado: true;
          organizadorHabilitadoEm: string;
        }>((resolve) => {
          concluir = resolve;
        }),
    );
    const api = createApi({ ativarOrganizador });
    render(
      <ProvedorSessao api={api}>
        <Probe />
      </ProvedorSessao>,
    );
    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('autenticado'),
    );

    screen.getByRole('button', { name: 'ativar organizador' }).click();
    expect(screen.getByTestId('organizador')).toHaveTextContent('nao');
    expect(ativarOrganizador).toHaveBeenCalledWith('refresh-token');

    await act(async () =>
      concluir({
        organizadorHabilitado: true,
        organizadorHabilitadoEm: '2030-02-01T12:00:00.000Z',
      }),
    );
    await waitFor(() =>
      expect(screen.getByTestId('organizador')).toHaveTextContent('sim'),
    );
  });

  it('termina como visitante quando não há refresh válido', async () => {
    const api = createApi({
      renovar: vi.fn().mockRejectedValue(
        new ErroApi({
          type: 'about:blank',
          title: 'Sem sessão',
          status: 401,
          codigo: 'RENOVACAO_INVALIDA',
        }),
      ),
    });
    render(
      <ProvedorSessao api={api}>
        <Probe />
      </ProvedorSessao>,
    );

    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('visitante'),
    );
  });

  it('autentica por e-mail/senha sem persistir tokens em Web Storage', async () => {
    const api = createApi({
      renovar: vi.fn().mockRejectedValue(
        new ErroApi({
          type: 'about:blank',
          title: 'Sem sessão',
          status: 401,
          codigo: 'RENOVACAO_INVALIDA',
        }),
      ),
    });
    render(
      <ProvedorSessao api={api}>
        <Probe />
      </ProvedorSessao>,
    );
    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('visitante'),
    );

    await act(async () =>
      screen.getByRole('button', { name: 'login' }).click(),
    );

    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('autenticado'),
    );
    expect(api.login).toHaveBeenCalledWith({
      email: 'ana@campo.test',
      senha: 'senha',
      plataforma: 'WEB',
    });
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
  });

  it('limpa a sessão local mesmo ao encerrar uma sessão já expirada', async () => {
    const api = createApi({
      logout: vi.fn().mockRejectedValue(new Error('expirada')),
    });
    render(
      <ProvedorSessao api={api}>
        <Probe />
      </ProvedorSessao>,
    );
    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('autenticado'),
    );

    await act(async () =>
      screen.getByRole('button', { name: 'logout' }).click(),
    );

    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('visitante'),
    );
    expect(screen.getByTestId('email')).toBeEmptyDOMElement();
    expect(api.logout).toHaveBeenCalledWith('refresh-token');
  });

  it('entrega a credencial em memória para requisições autenticadas', async () => {
    const api = createApi();
    render(
      <ProvedorSessao api={api}>
        <Probe />
      </ProvedorSessao>,
    );
    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('autenticado'),
    );

    await act(async () =>
      screen.getByRole('button', { name: 'executar autenticado' }).click(),
    );

    await waitFor(() =>
      expect(screen.getByTestId('resultado')).toHaveTextContent(
        'refresh-token',
      ),
    );
  });

  it('mantém executarAutenticado estável após renovar a credencial', async () => {
    const api = createApi({
      renovar: vi
        .fn()
        .mockResolvedValueOnce({ ...renewal, accessToken: 'token-inicial' })
        .mockResolvedValueOnce({ ...renewal, accessToken: 'token-novo' }),
    });
    const tokens: string[] = [];

    function ProbeEstabilidade() {
      const auth = useSessao();
      const primeiraReferencia = useRef(auth.executarAutenticado);
      const [identidade, setIdentidade] = useState('estável');
      const [resultado, setResultado] = useState('');

      useEffect(() => {
        if (primeiraReferencia.current !== auth.executarAutenticado) {
          setIdentidade('alterada');
        }
      }, [auth.executarAutenticado]);

      return (
        <>
          <span data-testid="status-estabilidade">{auth.status}</span>
          <span data-testid="identidade-executor">{identidade}</span>
          <span data-testid="resultado-estabilidade">{resultado}</span>
          <button
            type="button"
            onClick={() =>
              void auth
                .executarAutenticado(async (accessToken) => {
                  tokens.push(accessToken);
                  if (tokens.length === 1) {
                    throw new ErroApi({
                      type: 'about:blank',
                      title: 'Não autenticado',
                      status: 401,
                      codigo: 'NAO_AUTENTICADO',
                    });
                  }
                  return accessToken;
                })
                .then(setResultado)
            }
          >
            renovar durante operação
          </button>
        </>
      );
    }

    render(
      <ProvedorSessao api={api}>
        <ProbeEstabilidade />
      </ProvedorSessao>,
    );
    await waitFor(() =>
      expect(screen.getByTestId('status-estabilidade')).toHaveTextContent(
        'autenticado',
      ),
    );

    screen.getByRole('button', { name: 'renovar durante operação' }).click();

    await waitFor(() =>
      expect(screen.getByTestId('resultado-estabilidade')).toHaveTextContent(
        'token-novo',
      ),
    );
    expect(screen.getByTestId('identidade-executor')).toHaveTextContent(
      'estável',
    );
    expect(tokens).toEqual(['token-inicial', 'token-novo']);
  });

  it('reusa a credencial já renovada quando um 401 antigo chega depois', async () => {
    let rejeitarPrimeira!: (reason: unknown) => void;
    let rejeitarSegunda!: (reason: unknown) => void;
    const primeiraPendente = new Promise<never>((_resolve, reject) => {
      rejeitarPrimeira = reject;
    });
    const segundaPendente = new Promise<never>((_resolve, reject) => {
      rejeitarSegunda = reject;
    });
    const erro401 = new ErroApi({
      type: 'about:blank',
      title: 'Token expirado',
      status: 401,
      codigo: 'ACCESS_TOKEN_EXPIRADO',
    });
    const api = createApi({
      renovar: vi
        .fn()
        .mockResolvedValueOnce({ ...renewal, accessToken: 'token-inicial' })
        .mockResolvedValueOnce({ ...renewal, accessToken: 'token-novo' }),
    });
    const tokensPrimeira: string[] = [];
    const tokensSegunda: string[] = [];

    function ProbeConcorrente() {
      const auth = useSessao();
      const [resultado, setResultado] = useState('');
      return (
        <>
          <span data-testid="status-concorrente">{auth.status}</span>
          <span data-testid="resultado-concorrente">{resultado}</span>
          <button
            type="button"
            onClick={() =>
              void Promise.all([
                auth.executarAutenticado(async (accessToken) => {
                  tokensPrimeira.push(accessToken);
                  if (tokensPrimeira.length === 1) return primeiraPendente;
                  return `primeira:${accessToken}`;
                }),
                auth.executarAutenticado(async (accessToken) => {
                  tokensSegunda.push(accessToken);
                  if (tokensSegunda.length === 1) return segundaPendente;
                  return `segunda:${accessToken}`;
                }),
              ]).then((valores) => setResultado(valores.join('|')))
            }
          >
            executar concorrentes
          </button>
        </>
      );
    }

    render(
      <ProvedorSessao api={api}>
        <ProbeConcorrente />
      </ProvedorSessao>,
    );
    await waitFor(() =>
      expect(screen.getByTestId('status-concorrente')).toHaveTextContent(
        'autenticado',
      ),
    );

    screen.getByRole('button', { name: 'executar concorrentes' }).click();
    await waitFor(() => {
      expect(tokensPrimeira).toEqual(['token-inicial']);
      expect(tokensSegunda).toEqual(['token-inicial']);
    });

    await act(async () => rejeitarPrimeira(erro401));
    await waitFor(() =>
      expect(tokensPrimeira).toEqual(['token-inicial', 'token-novo']),
    );
    expect(api.renovar).toHaveBeenCalledTimes(2);

    await act(async () => rejeitarSegunda(erro401));
    await waitFor(() =>
      expect(screen.getByTestId('resultado-concorrente')).toHaveTextContent(
        'primeira:token-novo|segunda:token-novo',
      ),
    );
    expect(tokensSegunda).toEqual(['token-inicial', 'token-novo']);
    expect(api.renovar).toHaveBeenCalledTimes(2);
  });

  it('não repete uma requisição antiga com a credencial de outra sessão', async () => {
    let rejeitarRequisicao!: (reason: unknown) => void;
    const requisicaoPendente = new Promise<never>((_resolve, reject) => {
      rejeitarRequisicao = reject;
    });
    const contaB: MinhaConta = {
      ...account,
      id: 'conta-2',
      nome: 'Beatriz Lima',
      nomeUsuario: 'beatriz',
      email: 'beatriz@campolivre.test',
    };
    const api = createApi({
      renovar: vi.fn().mockResolvedValue({
        ...renewal,
        accessToken: 'token-conta-a',
      }),
      login: vi.fn().mockResolvedValue({
        ...renewal,
        accessToken: 'token-conta-b',
        usuario: {
          id: contaB.id,
          nome: contaB.nome,
          nomeUsuario: contaB.nomeUsuario,
          administrador: false,
          organizadorHabilitado: false,
        },
      }),
      consultarMinhaConta: vi
        .fn()
        .mockResolvedValueOnce(account)
        .mockResolvedValueOnce(contaB),
    });
    const tokens: string[] = [];

    function ProbeTrocaSessao() {
      const auth = useSessao();
      const [resultado, setResultado] = useState('');
      return (
        <>
          <span data-testid="status-troca">{auth.status}</span>
          <span data-testid="email-troca">
            {auth.session?.account.email ?? ''}
          </span>
          <span data-testid="resultado-troca">{resultado}</span>
          <button
            type="button"
            onClick={() =>
              void auth
                .executarAutenticado(async (accessToken) => {
                  tokens.push(accessToken);
                  if (tokens.length === 1) return requisicaoPendente;
                  return 'repetida';
                })
                .then(setResultado)
                .catch(() => setResultado('rejeitada'))
            }
          >
            iniciar requisição antiga
          </button>
          <button
            type="button"
            onClick={() =>
              void auth
                .signOut()
                .then(() => auth.signIn(contaB.email, 'senha'))
                .catch(() => undefined)
            }
          >
            trocar sessão
          </button>
        </>
      );
    }

    render(
      <ProvedorSessao api={api}>
        <ProbeTrocaSessao />
      </ProvedorSessao>,
    );
    await waitFor(() =>
      expect(screen.getByTestId('status-troca')).toHaveTextContent(
        'autenticado',
      ),
    );

    screen.getByRole('button', { name: 'iniciar requisição antiga' }).click();
    await waitFor(() => expect(tokens).toEqual(['token-conta-a']));
    screen.getByRole('button', { name: 'trocar sessão' }).click();
    await waitFor(() =>
      expect(screen.getByTestId('email-troca')).toHaveTextContent(contaB.email),
    );

    await act(async () =>
      rejeitarRequisicao(
        new ErroApi({
          type: 'about:blank',
          title: 'Token expirado',
          status: 401,
          codigo: 'ACCESS_TOKEN_EXPIRADO',
        }),
      ),
    );

    await waitFor(() =>
      expect(screen.getByTestId('resultado-troca')).toHaveTextContent(
        'rejeitada',
      ),
    );
    expect(tokens).toEqual(['token-conta-a']);
    expect(api.renovar).toHaveBeenCalledTimes(1);
  });

  it('ignora recarga bem-sucedida de uma sessão substituída', async () => {
    let resolverContaAntiga!: (value: MinhaConta) => void;
    const contaAntigaPendente = new Promise<MinhaConta>((resolve) => {
      resolverContaAntiga = resolve;
    });
    const contaB: MinhaConta = {
      ...account,
      id: 'conta-2',
      nome: 'Beatriz Lima',
      nomeUsuario: 'beatriz',
      email: 'beatriz@campolivre.test',
    };
    let consultasContaA = 0;
    const consultarMinhaConta = vi.fn((accessToken: string) => {
      if (accessToken === 'token-conta-b') return Promise.resolve(contaB);
      consultasContaA += 1;
      return consultasContaA === 1
        ? Promise.resolve(account)
        : contaAntigaPendente;
    });
    const api = createApi({
      renovar: vi.fn().mockResolvedValue({
        ...renewal,
        accessToken: 'token-conta-a',
      }),
      login: vi.fn().mockResolvedValue({
        ...renewal,
        accessToken: 'token-conta-b',
        usuario: {
          id: contaB.id,
          nome: contaB.nome,
          nomeUsuario: contaB.nomeUsuario,
          administrador: false,
          organizadorHabilitado: false,
        },
      }),
      consultarMinhaConta,
    });

    function ProbeRecargaAntiga() {
      const auth = useSessao();
      const [resultado, setResultado] = useState('');
      return (
        <>
          <span data-testid="status-recarga">{auth.status}</span>
          <span data-testid="email-recarga">
            {auth.session?.account.email ?? ''}
          </span>
          <span data-testid="resultado-recarga">{resultado}</span>
          <button
            type="button"
            onClick={() =>
              void auth
                .recarregarMinhaConta()
                .then(() => setResultado('aplicada'))
                .catch(() => setResultado('rejeitada'))
            }
          >
            recarregar conta antiga
          </button>
          <button
            type="button"
            onClick={() =>
              void auth
                .signOut()
                .then(() => auth.signIn(contaB.email, 'senha'))
                .catch(() => undefined)
            }
          >
            substituir sessão
          </button>
        </>
      );
    }

    render(
      <ProvedorSessao api={api}>
        <ProbeRecargaAntiga />
      </ProvedorSessao>,
    );
    await waitFor(() =>
      expect(screen.getByTestId('status-recarga')).toHaveTextContent(
        'autenticado',
      ),
    );

    screen.getByRole('button', { name: 'recarregar conta antiga' }).click();
    await waitFor(() => expect(consultarMinhaConta).toHaveBeenCalledTimes(2));
    screen.getByRole('button', { name: 'substituir sessão' }).click();
    await waitFor(() =>
      expect(screen.getByTestId('email-recarga')).toHaveTextContent(
        contaB.email,
      ),
    );

    await act(async () => resolverContaAntiga(account));

    await waitFor(() =>
      expect(screen.getByTestId('resultado-recarga')).toHaveTextContent(
        'rejeitada',
      ),
    );
    expect(screen.getByTestId('email-recarga')).toHaveTextContent(contaB.email);
  });

  it('não encerra a sessão nova quando um login antigo falha tarde', async () => {
    let rejeitarContaA!: (reason: unknown) => void;
    const contaAPendente = new Promise<MinhaConta>((_resolve, reject) => {
      rejeitarContaA = reject;
    });
    const contaB: MinhaConta = {
      ...account,
      id: 'conta-2',
      nome: 'Beatriz Lima',
      nomeUsuario: 'beatriz',
      email: 'beatriz@campolivre.test',
    };
    const api = createApi({
      renovar: vi.fn().mockRejectedValue(
        new ErroApi({
          type: 'about:blank',
          title: 'Sem sessão',
          status: 401,
          codigo: 'RENOVACAO_INVALIDA',
        }),
      ),
      login: vi.fn(({ email }) =>
        Promise.resolve({
          ...renewal,
          accessToken:
            email === contaB.email ? 'token-conta-b' : 'token-conta-a',
          usuario: {
            id: email === contaB.email ? contaB.id : account.id,
            nome: email === contaB.email ? contaB.nome : account.nome,
            nomeUsuario:
              email === contaB.email ? contaB.nomeUsuario : account.nomeUsuario,
            administrador: false,
            organizadorHabilitado: false,
          },
        }),
      ),
      consultarMinhaConta: vi.fn((accessToken: string) =>
        accessToken === 'token-conta-a'
          ? contaAPendente
          : Promise.resolve(contaB),
      ),
    });

    function ProbeLoginsConcorrentes() {
      const auth = useSessao();
      const [resultadoA, setResultadoA] = useState('');
      return (
        <>
          <span data-testid="status-logins">{auth.status}</span>
          <span data-testid="email-logins">
            {auth.session?.account.email ?? ''}
          </span>
          <span data-testid="resultado-login-a">{resultadoA}</span>
          <button
            type="button"
            onClick={() =>
              void auth
                .signIn(account.email, 'senha')
                .then(() => setResultadoA('aplicado'))
                .catch(() => setResultadoA('rejeitado'))
            }
          >
            iniciar login A
          </button>
          <button
            type="button"
            onClick={() => void auth.signIn(contaB.email, 'senha')}
          >
            iniciar login B
          </button>
        </>
      );
    }

    render(
      <ProvedorSessao api={api}>
        <ProbeLoginsConcorrentes />
      </ProvedorSessao>,
    );
    await waitFor(() =>
      expect(screen.getByTestId('status-logins')).toHaveTextContent(
        'visitante',
      ),
    );

    screen.getByRole('button', { name: 'iniciar login A' }).click();
    await waitFor(() =>
      expect(api.consultarMinhaConta).toHaveBeenCalledWith('token-conta-a'),
    );
    screen.getByRole('button', { name: 'iniciar login B' }).click();
    await waitFor(() =>
      expect(screen.getByTestId('email-logins')).toHaveTextContent(
        contaB.email,
      ),
    );

    await act(async () => rejeitarContaA(new Error('falha tardia')));

    await waitFor(() =>
      expect(screen.getByTestId('resultado-login-a')).toHaveTextContent(
        'rejeitado',
      ),
    );
    expect(api.logout).not.toHaveBeenCalled();
    expect(screen.getByTestId('email-logins')).toHaveTextContent(contaB.email);
  });

  it('revalida a geração antes de aplicar a recarga da conta', async () => {
    let resolverConta!: (value: MinhaConta) => void;
    let encerrarSessao!: () => Promise<void>;
    const contaPendente = new Promise<MinhaConta>((resolve) => {
      resolverConta = resolve;
    });
    const consultarMinhaConta = vi
      .fn()
      .mockResolvedValueOnce(account)
      .mockReturnValueOnce(contaPendente);
    const api = createApi({ consultarMinhaConta });

    function ProbeJanelaRecarga() {
      const auth = useSessao();
      const [resultado, setResultado] = useState('');
      useEffect(() => {
        encerrarSessao = auth.signOut;
      }, [auth.signOut]);
      return (
        <>
          <span data-testid="status-janela">{auth.status}</span>
          <span data-testid="email-janela">
            {auth.session?.account.email ?? ''}
          </span>
          <span data-testid="resultado-janela">{resultado}</span>
          <button
            type="button"
            onClick={() =>
              void auth
                .recarregarMinhaConta()
                .then(() => setResultado('aplicada'))
                .catch(() => setResultado('rejeitada'))
            }
          >
            iniciar recarga
          </button>
        </>
      );
    }

    render(
      <ProvedorSessao api={api}>
        <ProbeJanelaRecarga />
      </ProvedorSessao>,
    );
    await waitFor(() =>
      expect(screen.getByTestId('status-janela')).toHaveTextContent(
        'autenticado',
      ),
    );

    screen.getByRole('button', { name: 'iniciar recarga' }).click();
    await waitFor(() => expect(consultarMinhaConta).toHaveBeenCalledTimes(2));

    await act(async () => {
      resolverConta(account);
      queueMicrotask(() => void encerrarSessao());
    });

    await waitFor(() =>
      expect(screen.getByTestId('status-janela')).toHaveTextContent(
        'visitante',
      ),
    );
    await waitFor(() =>
      expect(screen.getByTestId('resultado-janela')).toHaveTextContent(
        'rejeitada',
      ),
    );
    expect(screen.getByTestId('email-janela')).toBeEmptyDOMElement();
  });

  it('invalida a credencial anterior ao iniciar login de outra conta', async () => {
    let resolverLoginB!: (value: RespostaLogin) => void;
    let resolverRecargaA!: (value: MinhaConta) => void;
    const loginBPendente = new Promise<RespostaLogin>((resolve) => {
      resolverLoginB = resolve;
    });
    const recargaAPendente = new Promise<MinhaConta>((resolve) => {
      resolverRecargaA = resolve;
    });
    const contaB: MinhaConta = {
      ...account,
      id: 'conta-b',
      email: 'bia@campolivre.test',
      nome: 'Bia',
    };
    let consultasTokenA = 0;
    const consultarMinhaConta = vi.fn((accessToken: string) => {
      if (accessToken === 'token-conta-b') return Promise.resolve(contaB);
      consultasTokenA += 1;
      return consultasTokenA === 1
        ? Promise.resolve(account)
        : recargaAPendente;
    });
    const api = createApi({
      login: vi.fn().mockReturnValue(loginBPendente),
      consultarMinhaConta,
    });

    function ProbeLoginEmAndamento() {
      const auth = useSessao();
      const [resultadoRecarga, setResultadoRecarga] = useState('');
      return (
        <>
          <span data-testid="status-login-pendente">{auth.status}</span>
          <span data-testid="email-login-pendente">
            {auth.session?.account.email ?? ''}
          </span>
          <span data-testid="resultado-recarga-pendente">
            {resultadoRecarga}
          </span>
          <button
            type="button"
            onClick={() => void auth.signIn(contaB.email, 'Senha@123')}
          >
            entrar B
          </button>
          <button
            type="button"
            onClick={() =>
              void auth
                .recarregarMinhaConta()
                .then(() => setResultadoRecarga('aplicada'))
                .catch(() => setResultadoRecarga('rejeitada'))
            }
          >
            recarregar durante login
          </button>
        </>
      );
    }

    render(
      <ProvedorSessao api={api}>
        <ProbeLoginEmAndamento />
      </ProvedorSessao>,
    );
    await waitFor(() =>
      expect(screen.getByTestId('status-login-pendente')).toHaveTextContent(
        'autenticado',
      ),
    );

    screen.getByRole('button', { name: 'entrar B' }).click();
    await waitFor(() =>
      expect(screen.getByTestId('status-login-pendente')).toHaveTextContent(
        'autenticando',
      ),
    );
    screen.getByRole('button', { name: 'recarregar durante login' }).click();

    await act(async () => {
      resolverLoginB({
        ...renewal,
        accessToken: 'token-conta-b',
        usuario: {
          id: contaB.id,
          nome: contaB.nome,
          nomeUsuario: contaB.nomeUsuario,
          administrador: false,
          organizadorHabilitado: false,
        },
      });
    });
    await waitFor(() =>
      expect(screen.getByTestId('email-login-pendente')).toHaveTextContent(
        contaB.email,
      ),
    );

    await act(async () => resolverRecargaA(account));
    await waitFor(() =>
      expect(
        screen.getByTestId('resultado-recarga-pendente'),
      ).toHaveTextContent('rejeitada'),
    );
    expect(consultasTokenA).toBe(1);
    expect(screen.getByTestId('email-login-pendente')).toHaveTextContent(
      contaB.email,
    );
  });

  it('não transforma falha transitória do bootstrap em visitante', async () => {
    const api = createApi({
      renovar: vi.fn().mockRejectedValue(new Error('rede indisponível')),
    });
    render(
      <ProvedorSessao api={api}>
        <Probe />
      </ProvedorSessao>,
    );

    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('indisponivel'),
    );
    expect(screen.getByTestId('erro')).toHaveTextContent(
      'Não foi possível validar sua sessão agora.',
    );
  });

  it('informa encerramento de segurança quando há reutilização', async () => {
    const api = createApi({
      renovar: vi.fn().mockRejectedValue(
        new ErroApi({
          type: 'about:blank',
          title: 'Reutilização detectada',
          status: 401,
          codigo: 'REUTILIZACAO_DETECTADA',
        }),
      ),
    });
    render(
      <ProvedorSessao api={api}>
        <Probe />
      </ProvedorSessao>,
    );

    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('visitante'),
    );
    expect(screen.getByTestId('erro')).toHaveTextContent(
      'Sua sessão foi encerrada por segurança.',
    );
  });

  it('encerra a sessão local quando a conta se torna inapta', async () => {
    const api = createApi({
      renovar: vi.fn().mockRejectedValue(
        new ErroApi({
          type: 'about:blank',
          title: 'Conta inapta',
          status: 403,
          codigo: 'CONTA_INAPTA',
        }),
      ),
    });
    render(
      <ProvedorSessao api={api}>
        <Probe />
      </ProvedorSessao>,
    );

    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('visitante'),
    );
    expect(screen.getByTestId('email')).toBeEmptyDOMElement();
    expect(screen.getByTestId('erro')).toHaveTextContent(
      'Sua conta não está disponível para acesso.',
    );
  });

  it('encerra best-effort a sessão criada quando /minha-conta falha', async () => {
    const logout = vi.fn().mockResolvedValue(undefined);
    const api = createApi({
      renovar: vi.fn().mockRejectedValue(
        new ErroApi({
          type: 'about:blank',
          title: 'Sem sessão',
          status: 401,
          codigo: 'RENOVACAO_INVALIDA',
        }),
      ),
      consultarMinhaConta: vi.fn().mockRejectedValue(new Error('falha')),
      logout,
    });
    render(
      <ProvedorSessao api={api}>
        <Probe />
      </ProvedorSessao>,
    );
    await waitFor(() =>
      expect(screen.getByTestId('status')).toHaveTextContent('visitante'),
    );

    await act(async () =>
      screen.getByRole('button', { name: 'login' }).click(),
    );

    await waitFor(() => expect(logout).toHaveBeenCalledTimes(1));
    expect(logout).toHaveBeenCalledWith('login-token');
    expect(screen.getByTestId('status')).toHaveTextContent('visitante');
  });
});

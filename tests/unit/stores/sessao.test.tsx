import { act, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { ErroApi } from '@/services/api/problem-details';
import type { AutenticacaoApi } from '@/services/autenticacao/autenticacao-api';
import { useSessao } from '@/hooks/use-sessao';
import { ProvedorSessao } from '@/stores/sessao';
import type { MinhaConta } from '@/types/api/autenticacao';

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
      <span data-testid="erro">{auth.erroSessao ?? ''}</span>
      <span data-testid="resultado">{resultado}</span>
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
    expect(screen.getByTestId('status')).toHaveTextContent('visitante');
  });
});

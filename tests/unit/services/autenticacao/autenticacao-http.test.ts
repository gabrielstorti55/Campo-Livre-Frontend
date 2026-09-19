import { describe, expect, it, vi } from 'vitest';

import { AutenticacaoHttp } from '@/services/autenticacao/autenticacao-http';

describe('AutenticacaoHttp', () => {
  it('ativa a capacidade pessoal de organizador com confirmação explícita', async () => {
    const response = {
      organizadorHabilitado: true as const,
      organizadorHabilitadoEm: '2030-01-01T12:00:00.000Z',
    };
    const request = vi.fn().mockResolvedValue(response);
    const api = new AutenticacaoHttp({ request });

    await expect(api.ativarOrganizador('access-token')).resolves.toEqual(
      response,
    );
    expect(request).toHaveBeenCalledWith('/minha-conta/organizador', {
      method: 'POST',
      accessToken: 'access-token',
      body: { confirmacao: true },
    });
  });

  it('envia login web com cookie e sem expor refresh token', async () => {
    const response = {
      accessToken: 'access',
      tokenTipo: 'Bearer',
      accessTokenExpiraEm: '2030-01-01T00:15:00.000Z',
      refreshToken: null,
      refreshTokenExpiraEm: '2030-01-30T00:00:00.000Z',
      usuario: {
        id: 'conta-1',
        nome: 'Pessoa',
        nomeUsuario: 'pessoa',
        administrador: false,
        organizadorHabilitado: false,
      },
    };
    const request = vi.fn().mockResolvedValue(response);
    const api = new AutenticacaoHttp({ request });

    await expect(
      api.login({
        email: ' pessoa@exemplo.com ',
        senha: 'segredo',
        plataforma: 'WEB',
      }),
    ).resolves.toEqual(response);

    expect(request).toHaveBeenCalledWith('/login', {
      method: 'POST',
      credentials: 'include',
      body: {
        email: 'pessoa@exemplo.com',
        senha: 'segredo',
        plataforma: 'WEB',
      },
    });
  });

  it('aceita resumo de usuário nullable conforme o contrato executável do login', async () => {
    const response = {
      accessToken: 'access',
      tokenTipo: 'Bearer',
      accessTokenExpiraEm: '2030-01-01T00:15:00.000Z',
      refreshToken: null,
      refreshTokenExpiraEm: '2030-01-30T00:00:00.000Z',
      usuario: {
        id: 'conta-1',
        nome: null,
        nomeUsuario: null,
        administrador: false,
        organizadorHabilitado: false,
      },
    };
    const request = vi.fn().mockResolvedValue(response);
    const api = new AutenticacaoHttp({ request });

    await expect(
      api.login({
        email: 'pessoa@exemplo.com',
        senha: 'segredo',
        plataforma: 'WEB',
      }),
    ).resolves.toEqual(response);
  });

  it('consulta a conta usando somente o access token recebido', async () => {
    const request = vi.fn().mockResolvedValue({ id: 'conta-1' });
    const api = new AutenticacaoHttp({ request });

    await api.consultarMinhaConta('access');

    expect(request).toHaveBeenCalledWith('/minha-conta', {
      accessToken: 'access',
    });
  });

  it('desativa a própria conta com confirmação explícita', async () => {
    const response = {
      contaInativada: true as const,
      sessoesRevogadas: true as const,
      eliminacaoPrevistaEm: '2030-04-01T12:00:00.000Z',
      prazoDias: 90,
    };
    const request = vi.fn().mockResolvedValue(response);
    const api = new AutenticacaoHttp({ request });

    await expect(api.desativarConta('access-token')).resolves.toEqual(response);
    expect(request).toHaveBeenCalledWith('/minha-conta/desativacao', {
      method: 'POST',
      accessToken: 'access-token',
      body: { confirmacao: true },
    });
  });

  it('encerra a sessão web com Bearer e tentativa de envio do cookie', async () => {
    const request = vi.fn().mockResolvedValue(undefined);
    const api = new AutenticacaoHttp({ request });

    await api.logout('access-token');

    expect(request).toHaveBeenCalledWith('/logout', {
      method: 'POST',
      accessToken: 'access-token',
      credentials: 'include',
    });
  });

  it('rejeita refresh token exposto no JSON do cliente web', async () => {
    const request = vi.fn().mockResolvedValue({
      accessToken: 'access',
      tokenTipo: 'Bearer',
      accessTokenExpiraEm: '2030-01-01T00:15:00.000Z',
      refreshToken: 'segredo-que-nao-deveria-estar-no-json',
      refreshTokenExpiraEm: '2030-01-30T00:00:00.000Z',
    });
    const api = new AutenticacaoHttp({ request });

    await expect(api.renovar()).rejects.toThrow(
      'Resposta de autenticação web incompatível com o contrato.',
    );
  });

  it('reenvia confirmação com resposta neutra a partir do e-mail normalizado', async () => {
    const request = vi.fn().mockResolvedValue({ envioAceito: true });
    const api = new AutenticacaoHttp({ request });

    await expect(
      api.reenviarConfirmacaoEmail(' PESSOA@EXEMPLO.COM '),
    ).resolves.toEqual({
      envioAceito: true,
    });
    expect(request).toHaveBeenCalledWith('/confirmacoes-email/reenvios', {
      method: 'POST',
      body: { email: 'pessoa@exemplo.com' },
    });
  });

  it('confirma o e-mail aceitando a continuidade parental em cookie HttpOnly', async () => {
    const request = vi.fn().mockResolvedValue({
      emailConfirmado: true,
      statusConta: 'AGUARDANDO_CONSENTIMENTO',
      consentimentoResponsavelNecessario: true,
    });
    const api = new AutenticacaoHttp({ request });

    await api.confirmarEmail('token-opaco');

    expect(request).toHaveBeenCalledWith('/confirmacoes-email', {
      method: 'POST',
      credentials: 'include',
      body: { token: 'token-opaco' },
    });
  });

  it('altera a senha da conta autenticada e envia o Bearer', async () => {
    const request = vi.fn().mockResolvedValue({
      senhaAlterada: true,
      sessoesRevogadas: true,
      novoLoginNecessario: true,
    });
    const api = new AutenticacaoHttp({ request });

    await api.alterarSenha('access-token', {
      senhaAtual: 'senha-atual',
      novaSenha: 'nova-senha',
    });

    expect(request).toHaveBeenCalledWith('/minha-conta/senha', {
      method: 'PUT',
      accessToken: 'access-token',
      body: { senhaAtual: 'senha-atual', novaSenha: 'nova-senha' },
    });
  });

  it('solicita alteração de e-mail sem substituir imediatamente o atual', async () => {
    const request = vi.fn().mockResolvedValue({
      confirmacaoPendente: true,
      novoEmailMascarado: 'n***@exemplo.com',
      expiraEm: '2030-01-01T00:30:00.000Z',
    });
    const api = new AutenticacaoHttp({ request });

    await api.solicitarAlteracaoEmail('access-token', ' NOVO@EXEMPLO.COM ');

    expect(request).toHaveBeenCalledWith('/minha-conta/alteracao-email', {
      method: 'POST',
      accessToken: 'access-token',
      body: { novoEmail: 'novo@exemplo.com' },
    });
  });

  it('confirma publicamente a alteração de e-mail com token de uso único', async () => {
    const request = vi.fn().mockResolvedValue({
      emailAlterado: true,
      emailConfirmado: true,
    });
    const api = new AutenticacaoHttp({ request });

    await api.confirmarAlteracaoEmail('token-opaco');

    expect(request).toHaveBeenCalledWith('/alteracoes-email/confirmacoes', {
      method: 'POST',
      body: { token: 'token-opaco' },
    });
  });

  it('reativa conta no prazo sem criar uma sessão', async () => {
    const request = vi.fn().mockResolvedValue({
      contaReativada: true,
      eliminacaoCancelada: true,
      novoLoginNecessario: true,
    });
    const api = new AutenticacaoHttp({ request });

    await api.reativarConta({
      email: ' pessoa@exemplo.com ',
      senha: 'senha',
      confirmacao: true,
    });

    expect(request).toHaveBeenCalledWith('/reativacao-conta', {
      method: 'POST',
      body: {
        email: 'pessoa@exemplo.com',
        senha: 'senha',
        confirmacao: true,
      },
    });
  });

  it('solicita reativação por e-mail com resposta neutra', async () => {
    const request = vi.fn().mockResolvedValue({ solicitacaoAceita: true });
    const api = new AutenticacaoHttp({ request });

    await api.solicitarReativacaoConta(' PESSOA@EXEMPLO.COM ');

    expect(request).toHaveBeenCalledWith('/reativacao-conta/solicitacoes', {
      method: 'POST',
      body: { email: 'pessoa@exemplo.com' },
    });
  });

  it('confirma reativação por token sem criar sessão', async () => {
    const request = vi.fn().mockResolvedValue({
      contaReativada: true,
      eliminacaoCancelada: true,
      novoLoginNecessario: true,
    });
    const api = new AutenticacaoHttp({ request });

    await api.confirmarReativacaoConta('token-opaco');

    expect(request).toHaveBeenCalledWith('/reativacao-conta/confirmacoes', {
      method: 'POST',
      body: { token: 'token-opaco', confirmacao: true },
    });
  });
});

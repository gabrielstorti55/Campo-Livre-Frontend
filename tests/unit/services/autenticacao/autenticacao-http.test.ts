import { describe, expect, it, vi } from 'vitest';

import { AutenticacaoHttp } from '@/services/autenticacao/autenticacao-http';

describe('AutenticacaoHttp', () => {
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

  it('consulta a conta usando somente o access token recebido', async () => {
    const request = vi.fn().mockResolvedValue({ id: 'conta-1' });
    const api = new AutenticacaoHttp({ request });

    await api.consultarMinhaConta('access');

    expect(request).toHaveBeenCalledWith('/minha-conta', {
      accessToken: 'access',
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
});

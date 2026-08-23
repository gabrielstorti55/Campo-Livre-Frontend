import { afterEach, describe, expect, it, vi } from 'vitest';

import { ClienteApi } from '@/services/api/cliente-api';

describe('ClienteApi', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('envia JSON, Bearer e cookies quando solicitado', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const client = new ClienteApi('https://api.campolivre.test/api/v1');
    await client.request('/minha-conta', {
      method: 'POST',
      body: { value: 1 },
      accessToken: 'access-em-memoria',
      credentials: 'include',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.campolivre.test/api/v1/minha-conta',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ value: 1 }),
        headers: expect.objectContaining({
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer access-em-memoria',
        }),
      }),
    );
  });

  it('aceita resposta 204 sem tentar interpretar JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(null, { status: 204 })),
    );
    const client = new ClienteApi('https://api.campolivre.test/api/v1');

    await expect(
      client.request('/logout', { method: 'POST' }),
    ).resolves.toBeUndefined();
  });

  it('converte erro HTTP em ErroApi sanitizado', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            title: 'Credenciais inválidas',
            status: 401,
            codigo: 'CREDENCIAIS_INVALIDAS',
            segredo: 'não deve vazar',
          }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/problem+json' },
          },
        ),
      ),
    );
    const client = new ClienteApi('https://api.campolivre.test/api/v1');

    await expect(
      client.request('/login', { method: 'POST' }),
    ).rejects.toMatchObject({
      name: 'ErroApi',
      problem: {
        type: 'about:blank',
        title: 'Credenciais inválidas',
        status: 401,
        codigo: 'CREDENCIAIS_INVALIDAS',
      },
    });
  });
});

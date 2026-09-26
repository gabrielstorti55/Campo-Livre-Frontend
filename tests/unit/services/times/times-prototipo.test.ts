import { describe, expect, it } from 'vitest';

import { TimesPrototipo } from '@/services/times/times-prototipo';

describe('TimesPrototipo', () => {
  it('mantém a mesma data de entrada do fundador em todas as projeções do time criado', async () => {
    const api = new TimesPrototipo(() => 'mock-person-unlinked-1');
    const criado = await api.criarTime(
      'token',
      {
        nome: 'Estrela do Norte',
        sigla: 'EDN',
        municipioId: 'municipio-franca',
        descricao: null,
      },
      'criar-estrela-data',
    );

    const [meusTimes, elenco, historico] = await Promise.all([
      api.listarMeusTimes('token'),
      api.listarElenco(criado.id),
      api.listarHistoricoElenco(criado.id, 'token'),
    ]);

    expect(meusTimes.itens[0]?.entrouEm).toBe(elenco.itens[0]?.entrouEm);
    expect(meusTimes.itens[0]?.entrouEm).toBe(historico.itens[0]?.entrouEm);
  });

  it('cria Time recuperável e vincula a idempotência ao payload', async () => {
    const api = new TimesPrototipo(() => 'conta-criadora');
    const input = {
      nome: '  Leões   Livres ',
      sigla: 'lel',
      municipioId: '00000000-0000-4000-8000-000000000001',
      descricao: ' Time local ',
    };

    const criado = await api.criarTime('access', input, 'mesma-chave');
    const repetido = await api.criarTime('access', input, 'mesma-chave');

    expect(repetido).toEqual(criado);
    expect(criado).toMatchObject({ nome: 'Leões Livres', sigla: 'LEL' });
    await expect(api.consultarTime(criado.id)).resolves.toMatchObject({
      id: criado.id,
      nome: 'Leões Livres',
    });
    await expect(api.listarMeusTimes('access', 1, 20)).resolves.toMatchObject({
      itens: [
        expect.objectContaining({
          funcao: 'CAPITAO',
          time: {
            id: criado.id,
            nome: 'Leões Livres',
            sigla: 'LEL',
            escudoUrl: null,
            status: 'ATIVO',
          },
        }),
      ],
    });
    await expect(api.listarElenco(criado.id, 1, 20)).resolves.toMatchObject({
      itens: [
        expect.objectContaining({
          nome: 'Capitão do time',
          funcao: 'CAPITAO',
        }),
      ],
      totalItens: 1,
    });
    const historico = await api.listarHistoricoElenco(
      criado.id,
      'access',
      1,
      20,
    );
    expect(historico).toMatchObject({
      itens: [
        expect.objectContaining({
          nome: 'Capitão do time',
          origem: 'FUNDADOR',
        }),
      ],
      totalItens: 1,
    });
    expect(historico.itens).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ nome: 'Marcos Oliveira' }),
      ]),
    );
    await expect(
      api.criarTime('access', { ...input, nome: 'Outro Time' }, 'mesma-chave'),
    ).rejects.toThrow('IDEMPOTENCY_KEY_REUTILIZADA');
  });

  it('aceita convite por token, encerra a pendência e cria vínculo de atleta', async () => {
    const api = new TimesPrototipo(() => 'mock-person-unlinked-1');

    await expect(
      api.consultarConvitePorToken(
        'convite-time-leoes-1',
        'access-token-prototipo-apenas-em-memoria',
      ),
    ).resolves.toMatchObject({ status: 'PENDENTE' });
    await api.aceitarConvitePorToken(
      'convite-time-leoes-1',
      'access-token-prototipo-apenas-em-memoria',
    );

    await expect(
      api.listarMeusConvites('access-token-prototipo-apenas-em-memoria', 1, 20),
    ).resolves.toMatchObject({ itens: [], totalItens: 0 });
    await expect(
      api.listarMeusTimes('access-token-prototipo-apenas-em-memoria', 1, 20),
    ).resolves.toMatchObject({
      itens: [
        expect.objectContaining({
          funcao: 'ATLETA',
          time: expect.objectContaining({ id: '2' }),
        }),
      ],
    });
  });

  it('isola os convites privados pela conta ativa', async () => {
    const destinatario = new TimesPrototipo(() => 'mock-person-unlinked-1');
    const outraConta = new TimesPrototipo(() => 'mock-person-1');

    const paginaDestinatario = await destinatario.listarMeusConvites(
      'access-token-prototipo-apenas-em-memoria',
      1,
      20,
    );
    const paginaOutraConta = await outraConta.listarMeusConvites(
      'access-token-prototipo-apenas-em-memoria',
      1,
      20,
    );

    expect(paginaDestinatario.itens).toHaveLength(1);
    expect(paginaDestinatario.itens[0]?.time.nome).toBe('Leões FC');
    expect(paginaOutraConta.itens).toEqual([]);
  });

  it('não entrega convites com credencial divergente', async () => {
    const api = new TimesPrototipo((accessToken) =>
      accessToken === 'access-valido' ? 'mock-person-unlinked-1' : null,
    );

    await expect(
      api.listarMeusConvites('access-invalido', 1, 20),
    ).rejects.toMatchObject({ problem: { status: 401 } });
  });
});

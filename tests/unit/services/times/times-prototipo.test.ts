import { describe, expect, it } from 'vitest';

import { TimesPrototipo } from '@/services/times/times-prototipo';

describe('TimesPrototipo', () => {
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

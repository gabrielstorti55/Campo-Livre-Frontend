import { describe, expect, it, vi } from 'vitest';

import { ErroApi } from '@/services/api/problem-details';
import { CoordenadorRefresh } from '@/services/autenticacao/coordenador-refresh';
import type { RespostaRenovacao } from '@/types/api/autenticacao';

function renewal(accessToken = 'novo'): RespostaRenovacao {
  return {
    accessToken,
    tokenTipo: 'Bearer',
    accessTokenExpiraEm: '2030-01-01T00:15:00.000Z',
    refreshToken: null,
    refreshTokenExpiraEm: '2030-01-30T00:00:00.000Z',
  };
}

describe('CoordenadorRefresh', () => {
  it('compartilha uma única renovação entre chamadas concorrentes', async () => {
    let resolve!: (value: RespostaRenovacao) => void;
    const renovar = vi.fn().mockReturnValue(
      new Promise<RespostaRenovacao>((done) => {
        resolve = done;
      }),
    );
    const coordinator = new CoordenadorRefresh({ renovar });

    const first = coordinator.renovar();
    const second = coordinator.renovar();
    resolve(renewal());

    await expect(Promise.all([first, second])).resolves.toEqual([
      renewal(),
      renewal(),
    ]);
    expect(renovar).toHaveBeenCalledTimes(1);
  });

  it('limpa a renovação em andamento após falha', async () => {
    const renovar = vi
      .fn()
      .mockRejectedValueOnce(
        new ErroApi({
          type: 'about:blank',
          title: 'Expirada',
          status: 401,
          codigo: 'RENOVACAO_EXPIRADA',
        }),
      )
      .mockResolvedValueOnce(renewal());
    const coordinator = new CoordenadorRefresh({ renovar });

    await expect(coordinator.renovar()).rejects.toBeInstanceOf(ErroApi);
    await expect(coordinator.renovar()).resolves.toEqual(renewal());
    expect(renovar).toHaveBeenCalledTimes(2);
  });

  it('renova e repete uma requisição 401 somente uma vez', async () => {
    const renovar = vi.fn().mockResolvedValue(renewal());
    const coordinator = new CoordenadorRefresh({ renovar });
    const request = vi
      .fn()
      .mockRejectedValueOnce(
        new ErroApi({
          type: 'about:blank',
          title: 'Access expirado',
          status: 401,
          codigo: 'ACCESS_TOKEN_EXPIRADO',
        }),
      )
      .mockResolvedValueOnce('ok');

    await expect(coordinator.executarComRenovacao(request)).resolves.toBe('ok');
    expect(request).toHaveBeenNthCalledWith(1);
    expect(request).toHaveBeenNthCalledWith(2, 'novo');
    expect(renovar).toHaveBeenCalledTimes(1);
  });

  it('não renova em 403 e não cria loop após um segundo 401', async () => {
    const renovar = vi.fn().mockResolvedValue(renewal());
    const forbidden = new ErroApi({
      type: 'about:blank',
      title: 'Sem permissão',
      status: 403,
      codigo: 'ACESSO_NEGADO',
    });
    const unauthorized = new ErroApi({
      type: 'about:blank',
      title: 'Access expirado',
      status: 401,
      codigo: 'ACCESS_TOKEN_EXPIRADO',
    });
    const coordinator = new CoordenadorRefresh({ renovar });

    await expect(
      coordinator.executarComRenovacao(vi.fn().mockRejectedValue(forbidden)),
    ).rejects.toBe(forbidden);
    expect(renovar).not.toHaveBeenCalled();

    const repeated401 = vi.fn().mockRejectedValue(unauthorized);
    await expect(coordinator.executarComRenovacao(repeated401)).rejects.toBe(
      unauthorized,
    );
    expect(repeated401).toHaveBeenCalledTimes(2);
    expect(renovar).toHaveBeenCalledTimes(1);
  });
});

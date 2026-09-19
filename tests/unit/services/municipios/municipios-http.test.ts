import { describe, expect, it, vi } from 'vitest';

import { MunicipiosHttp } from '@/services/municipios/municipios-http';

describe('MunicipiosHttp', () => {
  it('consulta municípios publicamente com filtros e paginação canônicos', async () => {
    const response = {
      itens: [
        {
          id: 'municipio-1',
          nome: 'Franca',
          uf: 'SP',
          codigoIbge: '3516200',
        },
      ],
      pagina: 1,
      tamanho: 20,
      totalItens: 1,
      totalPaginas: 1,
    };
    const request = vi.fn().mockResolvedValue(response);
    const api = new MunicipiosHttp({ request });

    await expect(
      api.listarMunicipios({ nome: 'Fran', uf: 'sp', pagina: 1, tamanho: 20 }),
    ).resolves.toEqual(response);

    expect(request).toHaveBeenCalledWith(
      '/municipios?nome=Fran&uf=SP&pagina=1&tamanho=20',
    );
    expect(request.mock.calls[0]?.[1]).toBeUndefined();
  });
});

import { describe, expect, it, vi } from 'vitest';

import { CampeonatosHttp } from '@/services/campeonatos/campeonatos-http';
import { CampeonatosPrototipo } from '@/services/campeonatos/campeonatos-prototipo';
import { catalogoOrganizadorMock } from '@/services/organizador/catalogo-organizador.mock';

describe('CampeonatosHttp', () => {
  it('lista campeonatos públicos com filtros e paginação canônicos sem credencial', async () => {
    const response = {
      itens: [],
      pagina: 2,
      tamanho: 10,
      totalItens: 0,
      totalPaginas: 0,
    };
    const request = vi.fn().mockResolvedValue(response);
    const api = new CampeonatosHttp({ request });

    await expect(
      api.listarCampeonatosPublicos({
        pagina: 2,
        tamanho: 10,
        nome: 'Copa Livre',
        municipioId: 'municipio-1',
        uf: 'sp',
        status: 'EM_ANDAMENTO',
      }),
    ).resolves.toEqual(response);

    expect(request).toHaveBeenCalledWith(
      '/campeonatos?pagina=2&tamanho=10&nome=Copa+Livre&municipioId=municipio-1&uf=SP&status=EM_ANDAMENTO',
    );
  });

  it('cria campeonato com o contrato inicial e a mesma chave idempotente da tentativa', async () => {
    const response = {
      id: 'campeonato-9',
      status: 'EM_INSCRICOES',
      responsavelUsuarioId: 'usuario-1',
      situacaoComercial: 'AUTORIZADO',
      origemAutorizacao: 'BENEFICIO',
      pagamentoNecessario: false,
    };
    const request = vi.fn().mockResolvedValue(response);
    const api = new CampeonatosHttp({ request });
    const input = {
      nome: 'Copa Franca 2026',
      municipioId: 'municipio-franca',
      contexto: 'PESSOAL' as const,
      prefeituraId: null,
      formato: 'PONTOS_CORRIDOS' as const,
      inicioPrevistoEm: '2026-09-10',
    };

    await expect(
      api.criarCampeonato('token', input, 'tentativa-1'),
    ).resolves.toEqual(response);
    expect(request).toHaveBeenCalledWith('/campeonatos', {
      method: 'POST',
      accessToken: 'token',
      headers: { 'Idempotency-Key': 'tentativa-1' },
      body: input,
    });
  });
});

describe('CampeonatosPrototipo', () => {
  it('torna o campeonato criado acessível no workspace da mesma conta', async () => {
    const api = new CampeonatosPrototipo(() => 'mock-person-1');
    const criado = await api.criarCampeonato(
      'token',
      {
        nome: 'Copa Nova',
        municipioId: '00000000-0000-4000-8000-000000000001',
        contexto: 'PESSOAL',
        prefeituraId: null,
        formato: 'PONTOS_CORRIDOS',
        inicioPrevistoEm: '2026-10-01',
      },
      'tentativa-prototipo',
    );

    expect(
      catalogoOrganizadorMock.obterCampeonato(criado.id, 'mock-person-1', []),
    ).toMatchObject({ id: Number(criado.id), nome: 'Copa Nova' });
  });

  it('gera um ID novo sem colidir com campeonatos já existentes', async () => {
    const api = new CampeonatosPrototipo(() => 'mock-person-1');
    const input = {
      nome: 'Copa sem colisão',
      municipioId: '00000000-0000-4000-8000-000000000001',
      contexto: 'PESSOAL' as const,
      prefeituraId: null,
      formato: 'PONTOS_CORRIDOS' as const,
      inicioPrevistoEm: '2026-11-01',
    };

    const criado = await api.criarCampeonato('token', input, 'tentativa-unica');
    const idsAnteriores = [1, 2, 4, 5, 7];

    expect(idsAnteriores).not.toContain(Number(criado.id));
    expect(
      catalogoOrganizadorMock.obterCampeonato(criado.id, 'mock-person-1', []),
    ).toMatchObject({
      id: Number(criado.id),
      nome: 'Copa sem colisão',
      estado: 'EM_INSCRICOES',
    });
  });
});

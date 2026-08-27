import { describe, expect, it, vi } from 'vitest';

import { CamposHttp } from '@/services/campos/campos-http';

describe('CamposHttp', () => {
  it('lista campos publicamente com os filtros canônicos e paginação', async () => {
    const response = {
      itens: [],
      pagina: 2,
      tamanho: 20,
      totalItens: 0,
      totalPaginas: 0,
    };
    const request = vi.fn().mockResolvedValue(response);
    const api = new CamposHttp({ request });

    await expect(
      api.listarCampos({
        nome: 'Estádio Municipal',
        municipioId: 'municipio-1',
        statusOperacional: 'EM_MANUTENCAO',
        pagina: 2,
        tamanho: 20,
      }),
    ).resolves.toEqual(response);

    expect(request).toHaveBeenCalledWith(
      '/campos?nome=Est%C3%A1dio+Municipal&municipioId=municipio-1&statusOperacional=EM_MANUTENCAO&page=2&size=20',
    );
  });

  it('deixa o estado operacional padrão sob responsabilidade do backend', async () => {
    const request = vi.fn().mockResolvedValue({});
    const api = new CamposHttp({ request });

    await api.listarCampos();

    expect(request).toHaveBeenCalledWith('/campos?page=1&size=20');
  });

  it('consulta o detalhe público sem credencial', async () => {
    const response = {
      id: 'campo-1',
      nome: 'Estádio Municipal',
      descricao: null,
      endereco: 'Rua do Campo, 100',
      municipio: { id: 'municipio-1', nome: 'Franca', uf: 'SP' },
      statusOperacional: 'ATIVO',
      prefeitura: {
        nomeOficial: 'Prefeitura Municipal de Franca',
        emailInstitucional: 'esportes@franca.sp.gov.br',
      },
      aviso:
        'Cadastro informativo; não representa reserva ou autorização de uso.',
    };
    const request = vi.fn().mockResolvedValue(response);
    const api = new CamposHttp({ request });

    await expect(api.consultarCampo('campo-1')).resolves.toEqual(response);

    expect(request).toHaveBeenCalledWith('/campos/campo-1');
  });
});

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
      '/campos?nome=Est%C3%A1dio+Municipal&municipioId=municipio-1&statusOperacional=EM_MANUTENCAO&pagina=2&tamanho=20',
    );
  });

  it('deixa o estado operacional padrão sob responsabilidade do backend', async () => {
    const request = vi.fn().mockResolvedValue({});
    const api = new CamposHttp({ request });

    await api.listarCampos();

    expect(request).toHaveBeenCalledWith('/campos?pagina=1&tamanho=20');
  });

  it('cadastra um Campo no contexto da Prefeitura autenticada', async () => {
    const response = {
      id: 'campo-1',
      prefeituraId: 'prefeitura-1',
      municipioId: 'municipio-1',
      nome: 'Campo Comunitário',
      descricao: null,
      endereco: 'Rua do Esporte, 10',
      statusOperacional: 'ATIVO',
      criadoEm: '2026-09-16T12:00:00.000Z',
    };
    const request = vi.fn().mockResolvedValue(response);
    const api = new CamposHttp({ request });

    await expect(
      api.cadastrarCampo('prefeitura-1', 'access-token', {
        nome: 'Campo Comunitário',
        endereco: 'Rua do Esporte, 10',
        descricao: null,
      }),
    ).resolves.toEqual(response);

    expect(request).toHaveBeenCalledWith('/prefeituras/prefeitura-1/campos', {
      method: 'POST',
      accessToken: 'access-token',
      body: {
        nome: 'Campo Comunitário',
        endereco: 'Rua do Esporte, 10',
        descricao: null,
      },
    });
  });

  it('edita um Campo conhecido com PATCH autenticado', async () => {
    const response = {
      id: 'campo-1',
      nome: 'Estádio reformado',
      descricao: null,
      endereco: 'Rua Nova, 20',
      atualizadoEm: '2026-09-17T12:00:00.000Z',
    };
    const request = vi.fn().mockResolvedValue(response);
    const api = new CamposHttp({ request });

    await expect(
      api.atualizarCampo('campo-1', 'access-token', {
        nome: 'Estádio reformado',
        descricao: null,
        endereco: 'Rua Nova, 20',
      }),
    ).resolves.toEqual(response);

    expect(request).toHaveBeenCalledWith('/campos/campo-1', {
      method: 'PATCH',
      accessToken: 'access-token',
      body: {
        nome: 'Estádio reformado',
        descricao: null,
        endereco: 'Rua Nova, 20',
      },
    });
  });

  it('altera o estado operacional com motivo e confirmação explícita', async () => {
    const response = {
      id: 'campo-1',
      statusOperacional: 'EM_MANUTENCAO',
      estadoAnterior: 'ATIVO',
      alterado: true,
      alteradoEm: '2026-09-17T12:00:00.000Z',
    };
    const request = vi.fn().mockResolvedValue(response);
    const api = new CamposHttp({ request });

    await expect(
      api.alterarEstadoOperacional('campo-1', 'access-token', {
        statusOperacional: 'EM_MANUTENCAO',
        motivo: 'Reparo do gramado',
        confirmacao: true,
      }),
    ).resolves.toEqual(response);

    expect(request).toHaveBeenCalledWith('/campos/campo-1/estado-operacional', {
      method: 'POST',
      accessToken: 'access-token',
      body: {
        statusOperacional: 'EM_MANUTENCAO',
        motivo: 'Reparo do gramado',
        confirmacao: true,
      },
    });
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

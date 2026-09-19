import { describe, expect, it, vi } from 'vitest';

import { PrefeiturasHttp } from '@/services/prefeituras/prefeituras-http';

describe('PrefeiturasHttp', () => {
  it('recupera somente os vínculos institucionais da conta autenticada', async () => {
    const response = {
      itens: [],
      pagina: 1,
      tamanho: 100,
      totalItens: 0,
      totalPaginas: 0,
    };
    const request = vi.fn().mockResolvedValue(response);
    const api = new PrefeiturasHttp({ request });

    await expect(api.listarMinhasPrefeituras('token', 1, 100)).resolves.toEqual(
      response,
    );
    expect(request).toHaveBeenCalledWith(
      '/minha-conta/prefeituras?pagina=1&tamanho=100',
      { accessToken: 'token' },
    );
  });

  it('lista os funcionários ativos da Prefeitura com paginação explícita', async () => {
    const response = {
      itens: [],
      pagina: 1,
      tamanho: 100,
      totalItens: 0,
      totalPaginas: 0,
    };
    const request = vi.fn().mockResolvedValue(response);
    const api = new PrefeiturasHttp({ request });

    await expect(
      api.listarFuncionarios('prefeitura-1', 'token', 'ATIVO', 1, 100),
    ).resolves.toEqual(response);
    expect(request).toHaveBeenCalledWith(
      '/prefeituras/prefeitura-1/funcionarios?status=ATIVO&pagina=1&tamanho=100',
      { accessToken: 'token' },
    );
  });

  it('lista os convites pendentes enviados sem expor credenciais', async () => {
    const response = {
      itens: [],
      pagina: 1,
      tamanho: 100,
      totalItens: 0,
      totalPaginas: 0,
    };
    const request = vi.fn().mockResolvedValue(response);
    const api = new PrefeiturasHttp({ request });

    await expect(
      api.listarConvitesEnviados('prefeitura-1', 'token', 1, 100),
    ).resolves.toEqual(response);
    expect(request).toHaveBeenCalledWith(
      '/prefeituras/prefeitura-1/convites?pagina=1&tamanho=100',
      { accessToken: 'token' },
    );
  });

  it('busca uma conta institucional por e-mail codificado', async () => {
    const response = {
      itens: [
        { usuarioId: 'usuario-2', nome: 'Pessoa', nomeUsuario: 'pessoa' },
      ],
      pagina: 1,
      tamanho: 20,
      totalItens: 1,
      totalPaginas: 1,
    };
    const request = vi.fn().mockResolvedValue(response);
    const api = new PrefeiturasHttp({ request });

    await expect(
      api.buscarUsuarioInstitucional('pessoa+teste@example.test', 'token'),
    ).resolves.toEqual(response);
    expect(request).toHaveBeenCalledWith(
      '/usuarios/busca-institucional?email=pessoa%2Bteste%40example.test',
      { accessToken: 'token' },
    );
  });

  it('envia convite nominal com chave de idempotência', async () => {
    const response = {
      conviteId: 'convite-1',
      papelDestino: 'MEMBRO',
      status: 'PENDENTE',
      expiraEm: '2026-09-24T12:00:00.000Z',
    };
    const request = vi.fn().mockResolvedValue(response);
    const api = new PrefeiturasHttp({ request });

    await expect(
      api.convidarFuncionario(
        'prefeitura-1',
        'usuario-2',
        'token',
        'idempotencia-1',
      ),
    ).resolves.toEqual(response);
    expect(request).toHaveBeenCalledWith('/prefeituras/prefeitura-1/convites', {
      method: 'POST',
      accessToken: 'token',
      headers: { 'Idempotency-Key': 'idempotencia-1' },
      body: { usuarioId: 'usuario-2' },
    });
  });

  it('reenvia convite pendente com uma nova intenção idempotente', async () => {
    const request = vi.fn().mockResolvedValue({
      conviteId: 'convite-1',
      status: 'PENDENTE',
      expiraEm: '2026-09-25T12:00:00.000Z',
    });
    const api = new PrefeiturasHttp({ request });

    await api.reenviarConvite(
      'prefeitura-1',
      'convite-1',
      'token',
      'idempotencia-reenvio',
    );

    expect(request).toHaveBeenCalledWith(
      '/prefeituras/prefeitura-1/convites/convite-1/reenvio',
      {
        method: 'POST',
        accessToken: 'token',
        headers: { 'Idempotency-Key': 'idempotencia-reenvio' },
      },
    );
  });

  it('remove membro com motivo e confirmação explícita', async () => {
    const request = vi.fn().mockResolvedValue({
      membroId: 'membro-2',
      status: 'ENCERRADO',
      encerradoEm: '2026-09-17T12:00:00.000Z',
    });
    const api = new PrefeiturasHttp({ request });

    await api.removerFuncionario(
      'prefeitura-1',
      'membro-2',
      'token',
      'Encerramento do vínculo institucional',
    );

    expect(request).toHaveBeenCalledWith(
      '/prefeituras/prefeitura-1/funcionarios/membro-2/remocao',
      {
        method: 'POST',
        accessToken: 'token',
        body: {
          motivo: 'Encerramento do vínculo institucional',
          confirmacao: true,
        },
      },
    );
  });

  it('transfere a responsabilidade somente com confirmação explícita', async () => {
    const request = vi.fn().mockResolvedValue({
      prefeituraId: 'prefeitura-1',
      responsavelMembroId: 'membro-2',
      responsavelAnteriorPapel: 'MEMBRO',
      transferidoEm: '2026-09-17T12:00:00.000Z',
    });
    const api = new PrefeiturasHttp({ request });

    await api.transferirResponsabilidade('prefeitura-1', 'membro-2', 'token');

    expect(request).toHaveBeenCalledWith(
      '/prefeituras/prefeitura-1/transferencia-responsabilidade',
      {
        method: 'POST',
        accessToken: 'token',
        body: { sucessorMembroId: 'membro-2', confirmacao: true },
      },
    );
  });

  it('lista os convites municipais recebidos pela conta', async () => {
    const request = vi.fn().mockResolvedValue({ itens: [] });
    const api = new PrefeiturasHttp({ request });

    await api.listarConvitesRecebidos('token', 1, 100);

    expect(request).toHaveBeenCalledWith(
      '/minha-conta/convites-prefeitura?pagina=1&tamanho=100',
      { accessToken: 'token' },
    );
  });

  it('aceita convite recebido por ID com confirmação explícita', async () => {
    const request = vi.fn().mockResolvedValue({ vinculoAtivo: true });
    const api = new PrefeiturasHttp({ request });

    await api.aceitarConviteRecebido('convite-1', 'token');

    expect(request).toHaveBeenCalledWith(
      '/minha-conta/convites-prefeitura/convite-1/aceite',
      { method: 'POST', accessToken: 'token', body: { confirmacao: true } },
    );
  });

  it('recusa convite recebido por ID sem inventar motivo', async () => {
    const request = vi.fn().mockResolvedValue(undefined);
    const api = new PrefeiturasHttp({ request });

    await api.recusarConviteRecebido('convite-1', 'token');

    expect(request).toHaveBeenCalledWith(
      '/minha-conta/convites-prefeitura/convite-1/recusa',
      { method: 'POST', accessToken: 'token' },
    );
  });

  it('consulta convite municipal público por token opaco', async () => {
    const request = vi.fn().mockResolvedValue({ status: 'PENDENTE' });
    const api = new PrefeiturasHttp({ request });

    await api.consultarConvitePorToken('token com espaço');

    expect(request).toHaveBeenCalledWith(
      '/convites-prefeitura/token%20com%20espa%C3%A7o',
    );
  });

  it('aceita convite por token somente com confirmação explícita', async () => {
    const request = vi.fn().mockResolvedValue({ vinculoAtivo: true });
    const api = new PrefeiturasHttp({ request });

    await api.aceitarConvitePorToken('token-1', 'access-token');

    expect(request).toHaveBeenCalledWith(
      '/convites-prefeitura/token-1/aceite',
      {
        method: 'POST',
        accessToken: 'access-token',
        body: { confirmacao: true },
      },
    );
  });

  it('recusa convite por token sem corpo inventado', async () => {
    const request = vi.fn().mockResolvedValue(undefined);
    const api = new PrefeiturasHttp({ request });

    await api.recusarConvitePorToken('token-1', 'access-token');

    expect(request).toHaveBeenCalledWith(
      '/convites-prefeitura/token-1/recusa',
      { method: 'POST', accessToken: 'access-token' },
    );
  });
});

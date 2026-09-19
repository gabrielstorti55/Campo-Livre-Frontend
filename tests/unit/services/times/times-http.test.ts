import { describe, expect, it, vi } from 'vitest';

import { TimesHttp } from '@/services/times/times-http';

describe('TimesHttp', () => {
  it('consulta e responde convite por token sem persistir nem enviar corpo', async () => {
    const request = vi.fn().mockResolvedValue({});
    const api = new TimesHttp({ request });

    await api.consultarConvitePorToken('token opaco', 'access');
    await api.aceitarConvitePorToken('token opaco', 'access');
    await api.recusarConvitePorToken('token opaco', 'access');

    expect(request.mock.calls).toEqual([
      ['/convites-time/token%20opaco', { accessToken: 'access' }],
      [
        '/convites-time/token%20opaco/aceite',
        { method: 'POST', accessToken: 'access' },
      ],
      [
        '/convites-time/token%20opaco/recusa',
        { method: 'POST', accessToken: 'access' },
      ],
    ]);
  });

  it('cria Time com payload normalizado e chave idempotente', async () => {
    const response = {
      id: 'time-9',
      nome: 'Leões da Vila',
      sigla: 'LEV',
      municipioId: 'municipio-1',
      descricao: null,
      escudoUrl: null,
      status: 'ATIVO',
      capitaoMembroId: 'membro-9',
    };
    const request = vi.fn().mockResolvedValue(response);
    const api = new TimesHttp({ request });

    await expect(
      api.criarTime(
        'access-token',
        {
          nome: '  Leões   da Vila ',
          sigla: 'lev',
          municipioId: 'municipio-1',
          descricao: null,
        },
        'criar-time-1',
      ),
    ).resolves.toEqual(response);
    expect(request).toHaveBeenCalledWith('/times', {
      method: 'POST',
      accessToken: 'access-token',
      headers: { 'Idempotency-Key': 'criar-time-1' },
      body: {
        nome: 'Leões da Vila',
        sigla: 'LEV',
        municipioId: 'municipio-1',
        descricao: null,
      },
    });
  });

  it('representa as mutações e o histórico administrativo de Times', async () => {
    const request = vi.fn().mockResolvedValue({});
    const api = new TimesHttp({ request });

    await api.buscarAtletaParaConvite('ana+futebol@example.com', 'access');
    await api.enviarConvite('time-1', 'access', 'usuario-1', 'key-envio');
    await api.listarConvitesEnviados('time-1', 'access', 2, 20);
    await api.reenviarConvite('time-1', 'convite-1', 'access', 'key-reenvio');
    await api.cancelarConvite('time-1', 'convite-1', 'access');
    await api.removerAtleta('time-1', 'membro-1', 'access', 'motivo');
    await api.sairDoTime('time-1', 'access');
    await api.transferirCapitania('time-1', 'membro-2', 'access');
    await api.listarHistoricoElenco('time-1', 'access', 2, 20);
    await api.desativarTime('time-1', 'access', 'encerramento');
    await api.reativarTime('time-1', 'access');

    expect(request.mock.calls).toEqual([
      [
        '/usuarios/busca-time?email=ana%2Bfutebol%40example.com',
        { accessToken: 'access' },
      ],
      [
        '/times/time-1/convites',
        {
          method: 'POST',
          accessToken: 'access',
          headers: { 'Idempotency-Key': 'key-envio' },
          body: { usuarioDestinatarioId: 'usuario-1' },
        },
      ],
      ['/times/time-1/convites?pagina=2&tamanho=20', { accessToken: 'access' }],
      [
        '/times/time-1/convites/convite-1/reenvio',
        {
          method: 'POST',
          accessToken: 'access',
          headers: { 'Idempotency-Key': 'key-reenvio' },
        },
      ],
      [
        '/times/time-1/convites/convite-1/cancelamento',
        { method: 'POST', accessToken: 'access' },
      ],
      [
        '/times/time-1/elenco/membro-1/remocao',
        { method: 'POST', accessToken: 'access', body: { motivo: 'motivo' } },
      ],
      ['/times/time-1/saida', { method: 'POST', accessToken: 'access' }],
      [
        '/times/time-1/transferencia-capitania',
        {
          method: 'POST',
          accessToken: 'access',
          body: { sucessorMembroId: 'membro-2', confirmacao: true },
        },
      ],
      [
        '/times/time-1/historico-elenco?pagina=2&tamanho=20',
        { accessToken: 'access' },
      ],
      [
        '/times/time-1/desativacao',
        {
          method: 'POST',
          accessToken: 'access',
          body: { motivo: 'encerramento', confirmacao: true },
        },
      ],
      ['/times/time-1/reativacao', { method: 'POST', accessToken: 'access' }],
    ]);
  });

  it('envia e remove o escudo pelo contrato multipart autenticado', async () => {
    const request = vi.fn().mockResolvedValue({});
    const api = new TimesHttp({ request });
    const arquivo = new File(['imagem'], 'escudo.png', { type: 'image/png' });

    await api.enviarEscudo('time-1', 'access', arquivo);
    await api.removerEscudo('time-1', 'access');

    const body = request.mock.calls[0]?.[1]?.body as FormData;
    expect(body.get('arquivo')).toBe(arquivo);
    expect(request.mock.calls[0]?.[0]).toBe('/times/time-1/escudo');
    expect(request.mock.calls[0]?.[1]).toMatchObject({
      method: 'PUT',
      accessToken: 'access',
    });
    expect(request.mock.calls[1]).toEqual([
      '/times/time-1/escudo',
      { method: 'DELETE', accessToken: 'access' },
    ]);
  });

  it('atualiza somente os dados públicos permitidos com a sessão do capitão', async () => {
    const response = {
      id: 'time-1',
      nome: 'Leões do Norte',
      sigla: 'LDN',
      descricao: 'Novo texto público',
      atualizadoEm: '2030-01-01T12:00:00.000Z',
    };
    const request = vi.fn().mockResolvedValue(response);
    const api = new TimesHttp({ request });

    await expect(
      api.atualizarTime('time-1', 'access-capitao', {
        nome: 'Leões do Norte',
        sigla: 'LDN',
        descricao: 'Novo texto público',
      }),
    ).resolves.toEqual(response);

    expect(request).toHaveBeenCalledWith('/times/time-1', {
      method: 'PATCH',
      accessToken: 'access-capitao',
      body: {
        nome: 'Leões do Norte',
        sigla: 'LDN',
        descricao: 'Novo texto público',
      },
    });
  });

  it('consulta o detalhe e o elenco públicos do time', async () => {
    const request = vi.fn().mockResolvedValue({});
    const api = new TimesHttp({ request });

    await api.consultarTime('time-1');
    await api.listarElenco('time-1', 2, 20);

    expect(request).toHaveBeenNthCalledWith(1, '/times/time-1');
    expect(request).toHaveBeenNthCalledWith(
      2,
      '/times/time-1/elenco?pagina=2&tamanho=20',
    );
  });

  it('lista times ativos com filtros públicos e paginação', async () => {
    const response = {
      itens: [
        {
          id: 'time-1',
          nome: 'Leões FC',
          sigla: 'LEO',
          escudoUrl: null,
          municipio: { nome: 'Franca', uf: 'SP' },
        },
      ],
      pagina: 2,
      tamanho: 20,
      totalItens: 21,
      totalPaginas: 2,
    };
    const request = vi.fn().mockResolvedValue(response);
    const api = new TimesHttp({ request });

    await expect(
      api.listarTimes({
        nome: 'Leões',
        municipioId: 'municipio-1',
        uf: 'SP',
        pagina: 2,
        tamanho: 20,
      }),
    ).resolves.toEqual(response);

    expect(request).toHaveBeenCalledWith(
      '/times?nome=Le%C3%B5es&municipioId=municipio-1&uf=SP&pagina=2&tamanho=20',
    );
  });

  it('lista somente os vínculos de time ativos da conta autenticada', async () => {
    const response = {
      itens: [
        {
          membroId: 'membro-1',
          funcao: 'CAPITAO',
          entrouEm: '2030-01-01T12:00:00.000Z',
          time: {
            id: 'time-1',
            nome: 'Leões FC',
            sigla: 'LEO',
            escudoUrl: null,
            status: 'ATIVO',
          },
        },
      ],
      pagina: 1,
      tamanho: 20,
      totalItens: 1,
      totalPaginas: 1,
    };
    const request = vi.fn().mockResolvedValue(response);
    const api = new TimesHttp({ request });

    await expect(api.listarMeusTimes('access-token', 1, 20)).resolves.toEqual(
      response,
    );

    expect(request).toHaveBeenCalledWith(
      '/minha-conta/times?pagina=1&tamanho=20',
      {
        accessToken: 'access-token',
      },
    );
  });

  it('lista somente os convites da conta derivada do Bearer', async () => {
    const response = {
      itens: [
        {
          id: 'convite-1',
          time: {
            id: 'time-1',
            nome: 'Leões FC',
            sigla: 'LEO',
            escudoUrl: null,
          },
          remetente: {
            nome: 'Rafael Lima',
            nomeUsuario: 'rafaellima',
          },
          expiraEm: '2030-01-07T12:00:00.000Z',
        },
      ],
      pagina: 1,
      tamanho: 20,
      totalItens: 1,
      totalPaginas: 1,
    };
    const request = vi.fn().mockResolvedValue(response);
    const api = new TimesHttp({ request });

    await expect(
      api.listarMeusConvites('access-token', 1, 20),
    ).resolves.toEqual(response);

    expect(request).toHaveBeenCalledWith(
      '/minha-conta/convites-time?pagina=1&tamanho=20',
      { accessToken: 'access-token' },
    );
  });
});

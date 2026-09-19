import { describe, expect, it, vi } from 'vitest';

import { PartidasHttp } from '@/services/partidas/partidas-http';

describe('PartidasHttp', () => {
  it('lista a agenda com os filtros públicos canônicos e consulta o detalhe sem Bearer', async () => {
    const response = {
      itens: [],
      pagina: 1,
      tamanho: 20,
      totalItens: 0,
      totalPaginas: 0,
    };
    const request = vi.fn().mockResolvedValue(response);
    const api = new PartidasHttp({ request });
    const signal = new AbortController().signal;

    await api.listarAgenda(
      {
        pagina: 1,
        tamanho: 20,
        campeonatoId: 'camp-1',
        faseId: 'fase-1',
        timeId: 'time-1',
        campoId: 'campo-1',
        municipioId: 'municipio-1',
        estado: 'AGENDADA',
        inicioDe: '2026-09-01T00:00:00.000Z',
        inicioAte: '2026-09-30T23:59:59.000Z',
      },
      { signal },
    );
    await api.consultarPartida('partida 1', { signal });

    expect(request.mock.calls).toEqual([
      [
        '/partidas?pagina=1&tamanho=20&campeonatoId=camp-1&faseId=fase-1&timeId=time-1&campoId=campo-1&municipioId=municipio-1&estado=AGENDADA&inicioDe=2026-09-01T00%3A00%3A00.000Z&inicioAte=2026-09-30T23%3A59%3A59.000Z',
        { signal },
      ],
      ['/partidas/partida%201', { signal }],
    ]);
  });

  it('consulta a artilharia pública sem Bearer', async () => {
    const response = {
      itens: [],
      pagina: 2,
      tamanho: 10,
      totalItens: 0,
      totalPaginas: 0,
    };
    const request = vi.fn().mockResolvedValue(response);
    const api = new PartidasHttp({ request });

    await expect(
      api.consultarArtilharia('campeonato 1', 2, 10),
    ).resolves.toEqual(response);
    expect(request).toHaveBeenCalledWith(
      '/campeonatos/campeonato%201/artilharia?pagina=2&tamanho=10',
    );
  });

  it('registra WO definitivo com idempotência e o DTO canônico', async () => {
    const response = {
      partidaId: 'partida-1',
      estadoPartida: 'ENCERRADA_WO',
      timeBeneficiadoId: 'time-1',
      timeInfratorId: 'time-2',
      placar: { golsMandante: 3, golsVisitante: 0 },
      registradoEm: '2026-08-28T12:00:00.000Z',
    };
    const request = vi.fn().mockResolvedValue(response);
    const api = new PartidasHttp({ request });
    const input = {
      confirmacaoDefinitiva: true as const,
      timeBeneficiadoId: 'time-1',
      fundamentoCodigo: 'AUSENCIA',
      justificativa: 'Equipe adversária não compareceu.',
      referenciaAdministrativa: null,
    };

    await expect(
      api.registrarWo('partida-1', 'token', input, 'wo-1'),
    ).resolves.toEqual(response);
    expect(request).toHaveBeenCalledWith('/partidas/partida-1/wo', {
      method: 'POST',
      accessToken: 'token',
      headers: { 'Idempotency-Key': 'wo-1' },
      body: input,
    });
  });

  it('lista e administra agendamentos com versão concorrente e cancelamento', async () => {
    const request = vi.fn().mockResolvedValue({});
    const api = new PartidasHttp({ request });
    const signal = new AbortController().signal;

    await api.listarAgenda(
      { campeonatoId: 'camp-1', pagina: 1, tamanho: 100 },
      { signal },
    );
    await api.consultarAdministracao('partida-1', 'token', { signal });
    await api.salvarAgendamento('partida-1', 'token', {
      inicioEm: '2026-09-01T18:00:00.000Z',
      campoId: 'campo-1',
      autorizacaoExternaConfirmada: true,
      motivo: null,
      versaoEsperada: 1,
    });
    await api.adiarPartida('partida-1', 'token', {
      motivo: 'Chuva forte',
      confirmacao: true,
      versaoEsperada: 2,
    });
    await api.cancelarPartida('partida-1', 'token', {
      motivo: 'Decisão administrativa',
      categoriaPublica: 'DECISAO_ADMINISTRATIVA',
      confirmacao: true,
      versaoEsperada: 3,
    });

    expect(request.mock.calls).toEqual([
      ['/partidas?pagina=1&tamanho=100&campeonatoId=camp-1', { signal }],
      ['/partidas/partida-1/administracao', { accessToken: 'token', signal }],
      [
        '/partidas/partida-1/agendamento',
        {
          method: 'PUT',
          accessToken: 'token',
          body: {
            inicioEm: '2026-09-01T18:00:00.000Z',
            campoId: 'campo-1',
            autorizacaoExternaConfirmada: true,
            motivo: null,
            versaoEsperada: 1,
          },
        },
      ],
      [
        '/partidas/partida-1/adiamentos',
        {
          method: 'POST',
          accessToken: 'token',
          body: { motivo: 'Chuva forte', confirmacao: true, versaoEsperada: 2 },
        },
      ],
      [
        '/partidas/partida-1/cancelamentos',
        {
          method: 'POST',
          accessToken: 'token',
          body: {
            motivo: 'Decisão administrativa',
            categoriaPublica: 'DECISAO_ADMINISTRATIVA',
            confirmacao: true,
            versaoEsperada: 3,
          },
        },
      ],
    ]);
  });
});

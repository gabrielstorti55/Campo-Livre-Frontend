import { describe, expect, it, vi } from 'vitest';

import { CampeonatosHttp } from '@/services/campeonatos/campeonatos-http';

describe('CampeonatosHttp — participantes e estrutura', () => {
  it('mapeia participantes, convites e estrutura com os contratos publicados', async () => {
    const request = vi.fn().mockResolvedValue({});
    const api = new CampeonatosHttp({ request });

    await api.listarTimesParticipantes('camp-1', undefined, 1, 100);
    await api.convidarTime('camp-1', 'time-2', 'token');
    await api.cancelarConviteTime('camp-1', 'convite-2', 'token');
    await api.selecionarEstruturaFases('camp-1', 'token', {
      formato: 'PONTOS_CORRIDOS',
      fases: [
        {
          nome: 'Liga',
          tipo: 'PONTOS_CORRIDOS',
          ordem: 1,
          turnos: 'TURNO_UNICO',
          pontosVitoria: 3,
          pontosEmpate: 1,
          pontosDerrota: 0,
          quantidadeGrupos: null,
          classificadosPorGrupo: null,
          numeroPartidasConfronto: null,
          permiteProrrogacao: null,
          permitePenaltis: null,
          golDeOuro: null,
        },
      ],
    });
    await api.distribuirTimes('camp-1', 'token', 'AUTOMATICA', [], 'dist-1');
    await api.materializarPontosCorridos(
      'camp-1',
      'token',
      'AUTOMATICA',
      [],
      'estrutura-1',
    );

    expect(request.mock.calls).toEqual([
      ['/campeonatos/camp-1/times?pagina=1&tamanho=100', undefined],
      [
        '/campeonatos/camp-1/convites',
        { method: 'POST', accessToken: 'token', body: { timeId: 'time-2' } },
      ],
      [
        '/campeonatos/camp-1/convites/convite-2/cancelamento',
        { method: 'POST', accessToken: 'token', body: { confirmacao: true } },
      ],
      [
        '/campeonatos/camp-1/estrutura-fases',
        {
          method: 'PUT',
          accessToken: 'token',
          body: {
            formato: 'PONTOS_CORRIDOS',
            fases: [
              {
                nome: 'Liga',
                tipo: 'PONTOS_CORRIDOS',
                ordem: 1,
                turnos: 'TURNO_UNICO',
                pontosVitoria: 3,
                pontosEmpate: 1,
                pontosDerrota: 0,
                quantidadeGrupos: null,
                classificadosPorGrupo: null,
                numeroPartidasConfronto: null,
                permiteProrrogacao: null,
                permitePenaltis: null,
                golDeOuro: null,
              },
            ],
          },
        },
      ],
      [
        '/campeonatos/camp-1/distribuicao',
        {
          method: 'POST',
          accessToken: 'token',
          headers: { 'Idempotency-Key': 'dist-1' },
          body: { modo: 'AUTOMATICA', posicoesManuais: [] },
        },
      ],
      [
        '/campeonatos/camp-1/estrutura/pontos-corridos',
        {
          method: 'POST',
          accessToken: 'token',
          headers: { 'Idempotency-Key': 'estrutura-1' },
          body: { modo: 'AUTOMATICA', partidasManuais: [] },
        },
      ],
    ]);
  });

  it('consulta fases e materializa o chaveamento pelos contratos publicados', async () => {
    const request = vi.fn().mockResolvedValue({});
    const api = new CampeonatosHttp({ request });

    await api.consultarFases('camp-1', 'token');
    await api.materializarMataMata(
      'camp-1',
      'token',
      'AUTOMATICA',
      [],
      'mata-1',
    );

    expect(request.mock.calls).toEqual([
      ['/campeonatos/camp-1/fases', { accessToken: 'token' }],
      [
        '/campeonatos/camp-1/estrutura/mata-mata',
        {
          method: 'POST',
          accessToken: 'token',
          headers: { 'Idempotency-Key': 'mata-1' },
          body: { modo: 'AUTOMATICA', confrontosManuais: [] },
        },
      ],
    ]);
  });

  it('recupera integralmente o workspace administrativo publicado', async () => {
    const request = vi.fn().mockResolvedValue({});
    const api = new CampeonatosHttp({ request });

    await api.listarCampeonatosAdministrados('token', 2, 20);
    await api.consultarAdministracao('camp-1', 'token');
    await api.listarOrganizadores('camp-1', 'token', 1, 20, 'ATIVO');
    await api.buscarOrganizadorElegivel(
      'camp-1',
      'pessoa@example.com',
      'token',
    );
    await api.listarConvitesEnviados('camp-1', 'token', 1, 20, 'PENDENTE');
    await api.consultarElencoContextual('camp-1', 'time-1', 'token');
    await api.consultarDistribuicao('camp-1', 'token');
    await api.consultarEstrutura('camp-1', 'token');

    expect(request.mock.calls).toEqual([
      [
        '/minha-conta/campeonatos?pagina=2&tamanho=20',
        { accessToken: 'token' },
      ],
      ['/campeonatos/camp-1/administracao', { accessToken: 'token' }],
      [
        '/campeonatos/camp-1/organizadores?pagina=1&tamanho=20&status=ATIVO',
        { accessToken: 'token' },
      ],
      [
        '/usuarios/busca-organizadores?email=pessoa%40example.com&campeonatoId=camp-1',
        { accessToken: 'token' },
      ],
      [
        '/campeonatos/camp-1/convites?pagina=1&tamanho=20&status=PENDENTE',
        { accessToken: 'token' },
      ],
      ['/campeonatos/camp-1/times/time-1/elenco', { accessToken: 'token' }],
      ['/campeonatos/camp-1/distribuicao', { accessToken: 'token' }],
      ['/campeonatos/camp-1/estrutura', { accessToken: 'token' }],
    ]);
  });
});

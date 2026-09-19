import { describe, expect, it, vi } from 'vitest';

import { CampeonatosHttp } from '@/services/campeonatos/campeonatos-http';

describe('CampeonatosHttp — workspace', () => {
  it('mapeia os comandos contratuais do workspace sem inventar rotas', async () => {
    const request = vi.fn().mockResolvedValue({});
    const api = new CampeonatosHttp({ request });

    await api.consultarCampeonato('camp-1', 'token');
    await api.atualizarCampeonato('camp-1', 'token', {
      nome: 'Copa Atualizada',
      descricao: null,
      inicioPrevistoEm: '2026-10-01',
      fimPrevistoEm: null,
    });
    await api.configurarRegulamento('camp-1', 'token', {
      regulamentoTexto: 'Regras',
      limiteAtletasPorTime: 20,
      permiteWo: true,
      placarWoMandante: 3,
      placarWoVisitante: 0,
      criterioBye: 'ORDEM_INSCRICAO',
    });
    await api.configurarCriteriosDesempate('camp-1', 'fase-1', 'token', [
      'PONTOS',
      'VITORIAS',
      'SALDO_GOLS',
    ]);
    await api.adicionarOrganizador('camp-1', 'usuario-2', 'token');
    await api.removerOrganizador(
      'camp-1',
      'organizador-2',
      'token',
      'Equipe atualizada',
    );
    await api.validarConfiguracao('camp-1', 'token');
    await api.finalizarInscricoes('camp-1', 'token', 'tentativa-finalizacao');
    await api.iniciarCampeonato('camp-1', 'token');
    await api.encerrarCampeonato('camp-1', 'token');
    await api.cancelarCampeonato('camp-1', 'token', 'Motivo administrativo');

    expect(request.mock.calls).toEqual([
      ['/campeonatos/camp-1', { accessToken: 'token' }],
      [
        '/campeonatos/camp-1',
        {
          method: 'PATCH',
          accessToken: 'token',
          body: {
            nome: 'Copa Atualizada',
            descricao: null,
            inicioPrevistoEm: '2026-10-01',
            fimPrevistoEm: null,
          },
        },
      ],
      [
        '/campeonatos/camp-1/regulamento',
        {
          method: 'PUT',
          accessToken: 'token',
          body: {
            regulamentoTexto: 'Regras',
            limiteAtletasPorTime: 20,
            permiteWo: true,
            placarWoMandante: 3,
            placarWoVisitante: 0,
            criterioBye: 'ORDEM_INSCRICAO',
          },
        },
      ],
      [
        '/campeonatos/camp-1/fases/fase-1/criterios-desempate',
        {
          method: 'PUT',
          accessToken: 'token',
          body: { criterios: ['PONTOS', 'VITORIAS', 'SALDO_GOLS'] },
        },
      ],
      [
        '/campeonatos/camp-1/organizadores',
        {
          method: 'POST',
          accessToken: 'token',
          body: { usuarioId: 'usuario-2' },
        },
      ],
      [
        '/campeonatos/camp-1/organizadores/organizador-2/remocao',
        {
          method: 'POST',
          accessToken: 'token',
          body: { motivo: 'Equipe atualizada', confirmacao: true },
        },
      ],
      [
        '/campeonatos/camp-1/validacoes',
        { method: 'POST', accessToken: 'token', body: {} },
      ],
      [
        '/campeonatos/camp-1/finalizacao-inscricoes',
        {
          method: 'POST',
          accessToken: 'token',
          headers: { 'Idempotency-Key': 'tentativa-finalizacao' },
          body: { confirmacao: true },
        },
      ],
      [
        '/campeonatos/camp-1/inicio',
        { method: 'POST', accessToken: 'token', body: { confirmacao: true } },
      ],
      [
        '/campeonatos/camp-1/encerramento',
        { method: 'POST', accessToken: 'token', body: { confirmacao: true } },
      ],
      [
        '/campeonatos/camp-1/cancelamento',
        {
          method: 'POST',
          accessToken: 'token',
          body: { motivo: 'Motivo administrativo', confirmacao: true },
        },
      ],
    ]);
  });
});

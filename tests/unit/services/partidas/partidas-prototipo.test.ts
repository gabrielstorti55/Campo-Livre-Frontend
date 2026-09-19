import { describe, expect, it } from 'vitest';

import { vinculosCampeonatoOrganizadorMock } from '@/mocks/organizador/dados-organizador';
import { PartidasPrototipo } from '@/services/partidas/partidas-prototipo';

const agendamento = (versaoEsperada: number) => ({
  inicioEm: '2026-09-01T18:00:00.000Z',
  campoId: 'campo-1',
  autorizacaoExternaConfirmada: true as const,
  motivo: null,
  versaoEsperada,
});

describe('PartidasPrototipo', () => {
  it('projeta resultado e eventos públicos de uma súmula definitiva', async () => {
    const api = new PartidasPrototipo(() => null);

    const detalhe = await api.consultarPartida('3');
    expect(detalhe).toMatchObject({
      partidaId: '3',
      estado: 'ENCERRADA_SUMULA',
      resultado: {
        tipo: 'SUMULA',
        placarRegulamentar: { mandante: 3, visitante: 1 },
      },
    });
    expect(detalhe.sumulaPublica?.gols).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ autor: 'Marcos Oliveira', minuto: 12 }),
      ]),
    );
    expect(detalhe.sumulaPublica?.cartoes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ jogador: 'Diego Souza', tipo: 'amarelo' }),
      ]),
    );
    expect(detalhe.sumulaPublica?.substituicoes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ entra: 'Vitor Nunes', minuto: 61 }),
      ]),
    );
  });

  it('projeta estados públicos sem expor resultado não publicado', async () => {
    const api = new PartidasPrototipo(() => null);

    await expect(api.consultarPartida('4')).resolves.toMatchObject({
      estado: 'AGENDADA',
      resultado: null,
      sumulaPublica: null,
    });
    await expect(api.consultarPartida('7')).resolves.toMatchObject({
      estado: 'ADIADA',
      motivoPublico: 'CONDICAO_CAMPO',
      resultado: null,
    });
    await expect(api.consultarPartida('8')).resolves.toMatchObject({
      estado: 'CANCELADA',
      motivoPublico: 'DECISAO_ADMINISTRATIVA',
      resultado: null,
    });
  });

  it('mantém a agenda pública e o detalhe administrativo da partida coerentes', async () => {
    const api = new PartidasPrototipo(() => 'mock-person-1');
    const agendaInicial = await api.listarAgenda({ campeonatoId: '1' });
    const partida = agendaInicial.itens[0];
    expect(partida).toBeDefined();

    await api.salvarAgendamento(partida!.partidaId, 'token', agendamento(1));

    const detalhe = await api.consultarAdministracao(
      partida!.partidaId,
      'token',
    );
    const agendaAtualizada = await api.listarAgenda({ campeonatoId: '1' });
    expect(detalhe).toMatchObject({
      estado: 'AGENDADA',
      agendamento: {
        inicioEm: '2026-09-01T18:00:00.000Z',
        campoId: 'campo-1',
        versao: 2,
        autorizacaoExternaConfirmada: true,
      },
    });
    expect(agendaAtualizada.itens[0]).toMatchObject({
      partidaId: partida!.partidaId,
      estado: 'AGENDADA',
      inicioEm: '2026-09-01T18:00:00.000Z',
      campo: { id: 'campo-1' },
    });
  });

  it('nega detalhe e mutação à conta sem vínculo com o campeonato da partida', async () => {
    const api = new PartidasPrototipo(() => 'conta-sem-vinculo');

    await expect(api.consultarAdministracao('1', 'token')).rejects.toThrow(
      'NAO_AUTORIZADO',
    );
    await expect(
      api.salvarAgendamento('1', 'token', agendamento(1)),
    ).rejects.toThrow('NAO_AUTORIZADO');
  });

  it('falha fechado para partida inexistente e versão concorrente divergente', async () => {
    const api = new PartidasPrototipo(() => 'mock-person-1');

    await expect(
      api.consultarAdministracao('partida-inexistente', 'token'),
    ).rejects.toThrow('RECURSO_NAO_ENCONTRADO');
    await expect(
      api.salvarAgendamento('1', 'token', agendamento(99)),
    ).rejects.toThrow('VERSAO_DIVERGENTE');
  });

  it('exige confirmação definitiva mesmo em chamadas fora do TypeScript', async () => {
    const api = new PartidasPrototipo(() => 'mock-person-1');

    await expect(
      api.cancelarPartida('1', 'token', {
        motivo: 'Sem confirmação',
        categoriaPublica: 'DECISAO_ADMINISTRATIVA',
        confirmacao: false,
        versaoEsperada: 1,
      } as never),
    ).rejects.toThrow('CONFIRMACAO_OBRIGATORIA');
  });

  it('projeta adiamento, cancelamento e WO nos estados consultados', async () => {
    const apiAdiada = new PartidasPrototipo(() => 'mock-person-1');
    await apiAdiada.salvarAgendamento('1', 'token', agendamento(1));
    await apiAdiada.adiarPartida('1', 'token', {
      motivo: 'Chuva forte',
      confirmacao: true,
      versaoEsperada: 2,
    });
    await expect(
      apiAdiada.consultarAdministracao('1', 'token'),
    ).resolves.toMatchObject({
      estado: 'ADIADA',
      motivoAdministrativo: 'Chuva forte',
      agendamento: { versao: 3 },
    });

    const apiCancelada = new PartidasPrototipo(() => 'mock-person-1');
    await apiCancelada.cancelarPartida('1', 'token', {
      motivo: 'Decisão administrativa',
      categoriaPublica: 'DECISAO_ADMINISTRATIVA',
      confirmacao: true,
      versaoEsperada: 1,
    });
    const agendaCancelada = await apiCancelada.listarAgenda({
      campeonatoId: '1',
    });
    expect(agendaCancelada.itens[0]).toMatchObject({ estado: 'CANCELADA' });

    const apiWo = new PartidasPrototipo(() => 'mock-person-1');
    await apiWo.registrarWo(
      '1',
      'token',
      {
        confirmacaoDefinitiva: true,
        timeBeneficiadoId: '1',
        fundamentoCodigo: 'AUSENCIA',
        justificativa: 'Equipe adversária não compareceu.',
        referenciaAdministrativa: null,
      },
      'wo-prototipo',
    );
    await expect(
      apiWo.consultarAdministracao('1', 'token'),
    ).resolves.toMatchObject({
      estado: 'ENCERRADA_WO',
      agendamento: { versao: 2 },
    });
  });

  it('restringe WO ao responsável mesmo quando existe vínculo organizador', async () => {
    const vinculoOrganizador = {
      contaId: 'organizador-da-partida',
      campeonatoId: 1,
      papel: 'ORGANIZADOR' as const,
    };
    vinculosCampeonatoOrganizadorMock.push(vinculoOrganizador);
    const api = new PartidasPrototipo(() => vinculoOrganizador.contaId);

    try {
      const detalhe = await api.consultarAdministracao('1', 'token');
      expect(detalhe.operacoesPermitidas).not.toContain('REGISTRAR_WO');
      await expect(
        api.registrarWo(
          '1',
          'token',
          {
            confirmacaoDefinitiva: true,
            timeBeneficiadoId: '1',
            fundamentoCodigo: 'AUSENCIA',
            justificativa: 'Ausência confirmada.',
            referenciaAdministrativa: null,
          },
          'mesma-chave',
        ),
      ).rejects.toThrow('PERMISSAO_INSUFICIENTE');
    } finally {
      vinculosCampeonatoOrganizadorMock.splice(
        vinculosCampeonatoOrganizadorMock.indexOf(vinculoOrganizador),
        1,
      );
    }
  });

  it('isola a idempotência de WO por conta e operação', async () => {
    const segundoResponsavel = {
      contaId: 'segundo-responsavel',
      campeonatoId: 1,
      papel: 'RESPONSAVEL' as const,
    };
    vinculosCampeonatoOrganizadorMock.push(segundoResponsavel);
    let contaAtiva = 'mock-person-1';
    const api = new PartidasPrototipo(() => contaAtiva);
    const comando = {
      confirmacaoDefinitiva: true as const,
      timeBeneficiadoId: '1',
      fundamentoCodigo: 'AUSENCIA',
      justificativa: 'Ausência confirmada.',
      referenciaAdministrativa: null,
    };

    try {
      const primeira = await api.registrarWo(
        '1',
        'token-a',
        comando,
        'chave-reutilizada',
      );
      await expect(
        api.registrarWo('1', 'token-a', comando, 'chave-reutilizada'),
      ).resolves.toEqual(primeira);
      await expect(
        api.registrarWo(
          '1',
          'token-a',
          { ...comando, justificativa: 'Justificativa incompatível.' },
          'chave-reutilizada',
        ),
      ).rejects.toThrow('IDEMPOTENCY_KEY_REUTILIZADA');
      contaAtiva = segundoResponsavel.contaId;
      await expect(
        api.registrarWo('1', 'token-b', comando, 'chave-reutilizada'),
      ).rejects.toThrow('OPERACAO_NAO_PERMITIDA');
    } finally {
      vinculosCampeonatoOrganizadorMock.splice(
        vinculosCampeonatoOrganizadorMock.indexOf(segundoResponsavel),
        1,
      );
    }
  });
});

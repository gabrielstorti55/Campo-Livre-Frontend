import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TelaGerenciarPartidas } from '@/screens/organizador/gerenciar-partidas';
import type {
  DetalheAdministrativoPartida,
  ItemAgendaPartida,
} from '@/types/api/partidas';

const { api, executarAutenticado, sessao } = vi.hoisted(() => ({
  api: {
    listarAgenda: vi.fn(),
    consultarAdministracao: vi.fn(),
    salvarAgendamento: vi.fn(),
    adiarPartida: vi.fn(),
    cancelarPartida: vi.fn(),
    registrarWo: vi.fn(),
  },
  sessao: {
    sessionId: 'sessao-1',
    accountId: 'organizador-1',
    token: 'token-administrativo',
  },
  executarAutenticado: <T,>(request: (token: string) => Promise<T>) =>
    request(sessao.token),
}));

vi.mock('@/contexts/partidas-api', () => ({ usePartidasApi: () => api }));
vi.mock('@/hooks/use-sessao', () => ({
  useSessao: () => ({
    hydrated: true,
    session: {
      sessionId: sessao.sessionId,
      account: { id: sessao.accountId },
    },
    executarAutenticado,
  }),
}));

const item: ItemAgendaPartida = {
  partidaId: 'partida-uuid',
  campeonato: { id: 'campeonato-uuid', nome: 'Copa UUID' },
  faseId: 'fase-uuid',
  rodada: 2,
  mandante: { timeId: 'time-casa-uuid', nome: 'Mandante UUID', sigla: 'MAN' },
  visitante: { timeId: 'time-fora-uuid', nome: 'Visitante UUID', sigla: 'VIS' },
  inicioEm: '2026-09-01T18:00:00.000Z',
  campo: { id: 'campo-uuid', nome: 'Campo Municipal' },
  estado: 'AGENDADA',
};

const detalhe: DetalheAdministrativoPartida = {
  partidaId: item.partidaId,
  campeonatoId: item.campeonato.id,
  faseId: item.faseId,
  grupoId: null,
  confrontoId: 'confronto-uuid',
  rodada: 2,
  mandante: {
    timeCampeonatoId: 'tc-casa-uuid',
    timeId: item.mandante.timeId,
    nome: item.mandante.nome,
  },
  visitante: {
    timeCampeonatoId: 'tc-fora-uuid',
    timeId: item.visitante.timeId,
    nome: item.visitante.nome,
  },
  estado: 'AGENDADA',
  agendamento: {
    inicioEm: item.inicioEm,
    campoId: item.campo!.id,
    versao: 9,
    autorizacaoExternaConfirmada: true,
  },
  motivoAdministrativo: null,
  operacoesPermitidas: ['REGISTRAR_WO'],
  pdfOficial: { status: 'INEXISTENTE' },
  atualizadoEm: '2026-08-28T12:00:00.000Z',
};

beforeEach(() => {
  vi.clearAllMocks();
  sessao.sessionId = 'sessao-1';
  sessao.accountId = 'organizador-1';
  sessao.token = 'token-administrativo';
  api.listarAgenda.mockResolvedValue({
    itens: [item],
    pagina: 1,
    tamanho: 100,
    totalItens: 1,
    totalPaginas: 1,
  });
  api.consultarAdministracao.mockResolvedValue(detalhe);
  api.registrarWo.mockResolvedValue({
    partidaId: item.partidaId,
    estadoPartida: 'ENCERRADA_WO',
    timeBeneficiadoId: item.mandante.timeId,
    timeInfratorId: item.visitante.timeId,
    placar: { golsMandante: 3, golsVisitante: 0 },
    registradoEm: '2026-09-01T20:00:00.000Z',
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('registro definitivo de WO', () => {
  it('preserva UUIDs, exige confirmação explícita e atualiza a agenda', async () => {
    render(<TelaGerenciarPartidas campeonatoId="campeonato-uuid" />);

    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Registrar WO na partida partida-uuid',
      }),
    );
    expect(screen.getByRole('option', { name: 'Mandante UUID' })).toHaveValue(
      'time-casa-uuid',
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Revisar WO definitivo' }),
    );
    expect(api.registrarWo).not.toHaveBeenCalled();

    fireEvent.click(
      screen.getByRole('button', { name: 'Registrar WO definitivo' }),
    );

    await waitFor(() =>
      expect(api.registrarWo).toHaveBeenCalledWith(
        'partida-uuid',
        'token-administrativo',
        {
          confirmacaoDefinitiva: true,
          timeBeneficiadoId: 'time-casa-uuid',
          fundamentoCodigo: 'AUSENCIA',
          justificativa: 'Ausência da equipe adversária',
          referenciaAdministrativa: null,
        },
        expect.any(String),
      ),
    );
    await waitFor(() => expect(api.listarAgenda).toHaveBeenCalledTimes(2));
  });

  it('congela o alvo e o payload revisados até confirmar ou voltar à edição', async () => {
    render(<TelaGerenciarPartidas campeonatoId="campeonato-uuid" />);

    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Registrar WO na partida partida-uuid',
      }),
    );
    fireEvent.change(screen.getByLabelText('Time vencedor por WO'), {
      target: { value: 'time-fora-uuid' },
    });
    fireEvent.change(screen.getByLabelText('Justificativa do WO'), {
      target: { value: '  Ausência confirmada em campo  ' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Revisar WO definitivo' }),
    );

    expect(screen.getByLabelText('Time vencedor por WO')).toBeDisabled();
    expect(screen.getByLabelText('Justificativa do WO')).toBeDisabled();
    fireEvent.click(
      screen.getByRole('button', { name: 'Registrar WO definitivo' }),
    );

    await waitFor(() =>
      expect(api.registrarWo).toHaveBeenCalledWith(
        'partida-uuid',
        'token-administrativo',
        {
          confirmacaoDefinitiva: true,
          timeBeneficiadoId: 'time-fora-uuid',
          fundamentoCodigo: 'AUSENCIA',
          justificativa: 'Ausência confirmada em campo',
          referenciaAdministrativa: null,
        },
        expect.any(String),
      ),
    );
  });

  it('informa sucesso do WO sem sugerir nova mutação quando somente a atualização falha', async () => {
    api.listarAgenda
      .mockResolvedValueOnce({
        itens: [item],
        pagina: 1,
        tamanho: 100,
        totalItens: 1,
        totalPaginas: 1,
      })
      .mockRejectedValueOnce(new Error('falha no refresh'));
    render(<TelaGerenciarPartidas campeonatoId="campeonato-uuid" />);

    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Registrar WO na partida partida-uuid',
      }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Revisar WO definitivo' }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Registrar WO definitivo' }),
    );

    expect(
      await screen.findByText(
        'WO registrado definitivamente, mas não foi possível atualizar as partidas.',
      ),
    ).toBeVisible();
    expect(
      screen.queryByText('Não foi possível registrar o WO. Tente novamente.'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Registrar WO definitivo' }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Mandante UUID × Visitante UUID')).toBeVisible();
    expect(api.registrarWo).toHaveBeenCalledTimes(1);
  });

  it('reutiliza a mesma chave de idempotência ao tentar novamente após falha do comando', async () => {
    vi.stubGlobal('crypto', { randomUUID: vi.fn(() => 'chave-reutilizada') });
    api.registrarWo
      .mockRejectedValueOnce(new Error('falha transitória'))
      .mockResolvedValueOnce({});
    render(<TelaGerenciarPartidas campeonatoId="campeonato-uuid" />);

    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Registrar WO na partida partida-uuid',
      }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Revisar WO definitivo' }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Registrar WO definitivo' }),
    );
    await screen.findByText(
      'Não foi possível registrar o WO. Tente novamente.',
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Registrar WO definitivo' }),
    );

    await waitFor(() => expect(api.registrarWo).toHaveBeenCalledTimes(2));
    expect(api.registrarWo.mock.calls[0]?.[3]).toBe('chave-reutilizada');
    expect(api.registrarWo.mock.calls[1]?.[3]).toBe('chave-reutilizada');
  });

  it('gera uma nova chave de idempotência ao fechar e reabrir o registro', async () => {
    const randomUUID = vi
      .fn()
      .mockReturnValueOnce('chave-wo-1')
      .mockReturnValueOnce('chave-wo-2');
    vi.stubGlobal('crypto', { randomUUID });
    api.registrarWo
      .mockRejectedValueOnce(new Error('falha transitória'))
      .mockResolvedValueOnce({});
    render(<TelaGerenciarPartidas campeonatoId="campeonato-uuid" />);

    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Registrar WO na partida partida-uuid',
      }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Revisar WO definitivo' }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Registrar WO definitivo' }),
    );
    expect(
      await screen.findByText(
        'Não foi possível registrar o WO. Tente novamente.',
      ),
    ).toBeVisible();

    fireEvent.click(
      screen.getByRole('button', { name: 'Fechar registro de WO' }),
    );
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Registrar WO na partida partida-uuid',
      }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Revisar WO definitivo' }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Registrar WO definitivo' }),
    );

    await waitFor(() => expect(api.registrarWo).toHaveBeenCalledTimes(2));
    expect(api.registrarWo.mock.calls[0]?.[3]).toBe('chave-wo-1');
    expect(api.registrarWo.mock.calls[1]?.[3]).toBe('chave-wo-2');
  });

  it('gera uma nova chave de idempotência ao trocar de partida', async () => {
    const outraPartida: ItemAgendaPartida = {
      ...item,
      partidaId: 'outra-partida-uuid',
      mandante: { ...item.mandante, nome: 'Outro Mandante' },
      visitante: { ...item.visitante, nome: 'Outro Visitante' },
    };
    vi.stubGlobal('crypto', {
      randomUUID: vi
        .fn()
        .mockReturnValueOnce('chave-primeira-partida')
        .mockReturnValueOnce('chave-outra-partida'),
    });
    api.listarAgenda.mockResolvedValue({
      itens: [item, outraPartida],
      pagina: 1,
      tamanho: 100,
      totalItens: 2,
      totalPaginas: 1,
    });
    api.consultarAdministracao.mockImplementation((partidaId: string) =>
      Promise.resolve({ ...detalhe, partidaId }),
    );
    api.registrarWo
      .mockRejectedValueOnce(new Error('falha transitória'))
      .mockResolvedValueOnce({});
    render(<TelaGerenciarPartidas campeonatoId="campeonato-uuid" />);

    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Registrar WO na partida partida-uuid',
      }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Revisar WO definitivo' }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Registrar WO definitivo' }),
    );
    await screen.findByText(
      'Não foi possível registrar o WO. Tente novamente.',
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Registrar WO na partida outra-partida-uuid',
      }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Revisar WO definitivo' }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Registrar WO definitivo' }),
    );

    await waitFor(() => expect(api.registrarWo).toHaveBeenCalledTimes(2));
    expect(api.registrarWo.mock.calls[0]?.[3]).toBe('chave-primeira-partida');
    expect(api.registrarWo.mock.calls[1]?.[0]).toBe('outra-partida-uuid');
    expect(api.registrarWo.mock.calls[1]?.[3]).toBe('chave-outra-partida');
  });

  it('fecha o WO e descarta sua chave ao trocar de sessão', async () => {
    vi.stubGlobal('crypto', {
      randomUUID: vi
        .fn()
        .mockReturnValueOnce('chave-sessao-antiga')
        .mockReturnValueOnce('chave-sessao-nova'),
    });
    api.registrarWo
      .mockRejectedValueOnce(new Error('falha transitória'))
      .mockResolvedValueOnce({});
    const { rerender } = render(
      <TelaGerenciarPartidas campeonatoId="campeonato-uuid" />,
    );

    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Registrar WO na partida partida-uuid',
      }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Revisar WO definitivo' }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Registrar WO definitivo' }),
    );
    await screen.findByText(
      'Não foi possível registrar o WO. Tente novamente.',
    );

    sessao.sessionId = 'sessao-2';
    sessao.accountId = 'organizador-2';
    sessao.token = 'token-sessao-nova';
    rerender(<TelaGerenciarPartidas campeonatoId="campeonato-uuid" />);
    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: 'Registrar WO definitivo' }),
      ).not.toBeInTheDocument(),
    );
    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Registrar WO na partida partida-uuid',
      }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Revisar WO definitivo' }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Registrar WO definitivo' }),
    );

    await waitFor(() => expect(api.registrarWo).toHaveBeenCalledTimes(2));
    expect(api.registrarWo.mock.calls[1]?.[1]).toBe('token-sessao-nova');
    expect(api.registrarWo.mock.calls[1]?.[3]).toBe('chave-sessao-nova');
  });
});

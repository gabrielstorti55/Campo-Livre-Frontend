import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TelaGerenciarPartidas } from '@/screens/organizador/gerenciar-partidas';
import type {
  DetalheAdministrativoPartida,
  ItemAgendaPartida,
} from '@/types/api/partidas';

const { api, sessao } = vi.hoisted(() => ({
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
    accountId: 'organizador-uuid',
    token: 'token-administrativo',
    executarAutenticado: <T,>(request: (token: string) => Promise<T>) =>
      request('token-administrativo'),
  },
}));

vi.mock('@/contexts/partidas-api', () => ({ usePartidasApi: () => api }));
vi.mock('@/hooks/use-sessao', () => ({
  useSessao: () => ({
    hydrated: true,
    session: {
      sessionId: sessao.sessionId,
      account: { id: sessao.accountId },
      links: { organizedChampionshipIds: ['campeonato-uuid'] },
    },
    executarAutenticado: sessao.executarAutenticado,
  }),
}));

const item: ItemAgendaPartida = {
  partidaId: 'partida-uuid',
  campeonato: { id: 'campeonato-uuid', nome: 'Copa UUID' },
  faseId: 'fase-uuid',
  rodada: 1,
  mandante: { timeId: 'time-casa-uuid', nome: 'Time A', sigla: 'TMA' },
  visitante: { timeId: 'time-fora-uuid', nome: 'Time B', sigla: 'TMB' },
  inicioEm: null,
  campo: null,
  estado: 'PENDENTE_AGENDAMENTO',
};

const detalhe: DetalheAdministrativoPartida = {
  partidaId: item.partidaId,
  campeonatoId: item.campeonato.id,
  faseId: item.faseId,
  grupoId: null,
  confrontoId: 'confronto-uuid',
  rodada: 1,
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
  estado: 'PENDENTE_AGENDAMENTO',
  agendamento: {
    inicioEm: null,
    campoId: null,
    versao: 7,
    autorizacaoExternaConfirmada: false,
  },
  motivoAdministrativo: null,
  operacoesPermitidas: ['AGENDAR'],
  pdfOficial: { status: 'INEXISTENTE' },
  atualizadoEm: '2026-08-28T12:00:00.000Z',
};

beforeEach(() => {
  vi.clearAllMocks();
  sessao.sessionId = 'sessao-1';
  sessao.accountId = 'organizador-uuid';
  sessao.token = 'token-administrativo';
  sessao.executarAutenticado = <T,>(request: (token: string) => Promise<T>) =>
    request(sessao.token);
  api.listarAgenda.mockResolvedValue({
    itens: [item],
    pagina: 1,
    tamanho: 100,
    totalItens: 1,
    totalPaginas: 1,
  });
  api.consultarAdministracao.mockResolvedValue(detalhe);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('administração de partidas pela API', () => {
  it('lista a agenda pública sem token e carrega os detalhes administrativos autenticados por UUID', async () => {
    render(<TelaGerenciarPartidas campeonatoId="campeonato-uuid" />);

    expect(screen.getByRole('status')).toHaveTextContent('Carregando partidas');
    expect(await screen.findByText('Time A × Time B')).toBeVisible();

    expect(api.listarAgenda).toHaveBeenCalledWith(
      {
        campeonatoId: 'campeonato-uuid',
        pagina: 1,
        tamanho: 100,
      },
      { signal: expect.any(AbortSignal) },
    );
    expect(api.listarAgenda).toHaveBeenCalledTimes(1);
    expect(api.consultarAdministracao).toHaveBeenCalledWith(
      'partida-uuid',
      'token-administrativo',
      { signal: expect.any(AbortSignal) },
    );
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Agendar partida partida-uuid' }),
      ).toBeVisible(),
    );
  });

  it('salva o agendamento autenticado com a versão administrativa e atualiza a agenda', async () => {
    api.salvarAgendamento.mockResolvedValue({});
    render(<TelaGerenciarPartidas campeonatoId="campeonato-uuid" />);

    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Agendar partida partida-uuid',
      }),
    );
    fireEvent.change(screen.getByLabelText('Nova data'), {
      target: { value: '2026-09-01' },
    });
    fireEvent.change(screen.getByLabelText('Novo horário'), {
      target: { value: '18:00' },
    });
    fireEvent.change(screen.getByLabelText('Campo (UUID)'), {
      target: { value: 'campo-uuid' },
    });
    const autorizacao = screen.getByRole('checkbox', {
      name: 'Confirmo que o campo e o horário foram autorizados externamente',
    });
    const confirmar = screen.getByRole('button', {
      name: 'Confirmar agendamento',
    });
    expect(confirmar).toBeDisabled();
    fireEvent.click(autorizacao);
    fireEvent.click(confirmar);

    await waitFor(() =>
      expect(api.salvarAgendamento).toHaveBeenCalledWith(
        'partida-uuid',
        'token-administrativo',
        {
          inicioEm: new Date('2026-09-01T18:00:00').toISOString(),
          campoId: 'campo-uuid',
          autorizacaoExternaConfirmada: true,
          motivo: null,
          versaoEsperada: 7,
        },
      ),
    );
    await waitFor(() => expect(api.listarAgenda).toHaveBeenCalledTimes(2));
    expect(screen.getByRole('status')).toHaveTextContent('Agendamento salvo.');
  });

  it('mantém o sucesso da mutação quando a atualização posterior falha', async () => {
    api.salvarAgendamento.mockResolvedValue({});
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
        name: 'Agendar partida partida-uuid',
      }),
    );
    fireEvent.change(screen.getByLabelText('Nova data'), {
      target: { value: '2026-09-01' },
    });
    fireEvent.change(screen.getByLabelText('Novo horário'), {
      target: { value: '18:00' },
    });
    fireEvent.change(screen.getByLabelText('Campo (UUID)'), {
      target: { value: 'campo-uuid' },
    });
    fireEvent.click(
      screen.getByRole('checkbox', {
        name: 'Confirmo que o campo e o horário foram autorizados externamente',
      }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Confirmar agendamento' }),
    );

    expect(
      await screen.findByText(
        'Agendamento salvo, mas não foi possível atualizar as partidas.',
      ),
    ).toBeVisible();
    expect(
      screen.queryByText('Não foi possível concluir a operação.'),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Time A × Time B')).toBeVisible();
    expect(api.salvarAgendamento).toHaveBeenCalledTimes(1);
  });

  it('ignora o aborto do refresh pós-mutação substituído por outra geração', async () => {
    api.salvarAgendamento.mockResolvedValue({});
    let sinalRefresh: AbortSignal | undefined;
    api.listarAgenda
      .mockResolvedValueOnce({
        itens: [item],
        pagina: 1,
        tamanho: 100,
        totalItens: 1,
        totalPaginas: 1,
      })
      .mockImplementationOnce(
        (_filtros: unknown, opcoes?: { signal?: AbortSignal }) => {
          sinalRefresh = opcoes?.signal;
          return new Promise((_resolve, reject) => {
            sinalRefresh?.addEventListener(
              'abort',
              () => reject(new DOMException('Aborted', 'AbortError')),
              { once: true },
            );
          });
        },
      )
      .mockResolvedValueOnce({
        itens: [item],
        pagina: 1,
        tamanho: 100,
        totalItens: 1,
        totalPaginas: 1,
      });
    const { rerender } = render(
      <TelaGerenciarPartidas campeonatoId="campeonato-uuid" />,
    );

    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Agendar partida partida-uuid',
      }),
    );
    fireEvent.change(screen.getByLabelText('Nova data'), {
      target: { value: '2026-09-01' },
    });
    fireEvent.change(screen.getByLabelText('Novo horário'), {
      target: { value: '18:00' },
    });
    fireEvent.change(screen.getByLabelText('Campo (UUID)'), {
      target: { value: 'campo-uuid' },
    });
    fireEvent.click(
      screen.getByRole('checkbox', {
        name: 'Confirmo que o campo e o horário foram autorizados externamente',
      }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Confirmar agendamento' }),
    );

    await waitFor(() => expect(api.listarAgenda).toHaveBeenCalledTimes(2));
    sessao.executarAutenticado = <T,>(request: (token: string) => Promise<T>) =>
      request(sessao.token);
    rerender(<TelaGerenciarPartidas campeonatoId="campeonato-uuid" />);

    await waitFor(() => expect(sinalRefresh?.aborted).toBe(true));
    await waitFor(() => expect(api.listarAgenda).toHaveBeenCalledTimes(3));
    expect(
      screen.queryByText(
        'Agendamento salvo, mas não foi possível atualizar as partidas.',
      ),
    ).not.toBeInTheDocument();
    expect(await screen.findByText('Time A × Time B')).toBeVisible();
  });

  it('exige motivo no reagendamento e o envia com a versão esperada', async () => {
    api.consultarAdministracao.mockResolvedValue({
      ...detalhe,
      estado: 'AGENDADA',
      agendamento: {
        ...detalhe.agendamento,
        inicioEm: '2026-09-01T18:00:00.000Z',
        campoId: 'campo-uuid',
      },
      operacoesPermitidas: ['REAGENDAR'],
    });
    api.salvarAgendamento.mockResolvedValue({});
    render(<TelaGerenciarPartidas campeonatoId="campeonato-uuid" />);

    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Reagendar partida partida-uuid',
      }),
    );
    const confirmar = screen.getByRole('button', {
      name: 'Confirmar agendamento',
    });
    expect(confirmar).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Motivo da operação'), {
      target: { value: 'Mudança solicitada pela organização' },
    });
    fireEvent.click(
      screen.getByRole('checkbox', {
        name: 'Confirmo que o campo e o horário foram autorizados externamente',
      }),
    );
    fireEvent.click(confirmar);

    await waitFor(() =>
      expect(api.salvarAgendamento).toHaveBeenCalledWith(
        'partida-uuid',
        'token-administrativo',
        expect.objectContaining({
          motivo: 'Mudança solicitada pela organização',
          versaoEsperada: 7,
        }),
      ),
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      'Reagendamento salvo.',
    );
  });

  it('adia usando motivo, confirmação e versão administrativa', async () => {
    api.consultarAdministracao.mockResolvedValue({
      ...detalhe,
      operacoesPermitidas: ['ADIAR'],
    });
    api.adiarPartida.mockResolvedValue({});
    render(<TelaGerenciarPartidas campeonatoId="campeonato-uuid" />);

    fireEvent.click(
      await screen.findByRole('button', { name: 'Adiar partida partida-uuid' }),
    );
    fireEvent.change(screen.getByLabelText('Motivo da operação'), {
      target: { value: 'Chuva forte' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Confirmar adiamento' }),
    );

    await waitFor(() =>
      expect(api.adiarPartida).toHaveBeenCalledWith(
        'partida-uuid',
        'token-administrativo',
        {
          motivo: 'Chuva forte',
          confirmacao: true,
          versaoEsperada: 7,
        },
      ),
    );
    await waitFor(() => expect(api.listarAgenda).toHaveBeenCalledTimes(2));
    expect(screen.getByRole('status')).toHaveTextContent('Partida adiada.');
  });

  it('cancela com categoria pública, confirmação e versão administrativa', async () => {
    api.consultarAdministracao.mockResolvedValue({
      ...detalhe,
      operacoesPermitidas: ['CANCELAR'],
    });
    api.cancelarPartida.mockResolvedValue({});
    render(<TelaGerenciarPartidas campeonatoId="campeonato-uuid" />);

    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Cancelar partida partida-uuid',
      }),
    );
    fireEvent.change(screen.getByLabelText('Motivo da operação'), {
      target: { value: 'Interdição do campo' },
    });
    fireEvent.change(screen.getByLabelText('Categoria pública'), {
      target: { value: 'FORCA_MAIOR' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Confirmar cancelamento' }),
    );

    await waitFor(() =>
      expect(api.cancelarPartida).toHaveBeenCalledWith(
        'partida-uuid',
        'token-administrativo',
        {
          motivo: 'Interdição do campo',
          categoriaPublica: 'FORCA_MAIOR',
          confirmacao: true,
          versaoEsperada: 7,
        },
      ),
    );
    expect(screen.getByRole('status')).toHaveTextContent('Partida cancelada.');
  });

  it('carrega todas as páginas da agenda antes de consultar os detalhes administrativos', async () => {
    const itemPaginaDois: ItemAgendaPartida = {
      ...item,
      partidaId: 'partida-pagina-2',
      mandante: { ...item.mandante, nome: 'Time C' },
      visitante: { ...item.visitante, nome: 'Time D' },
    };
    api.listarAgenda.mockImplementation(({ pagina }: { pagina: number }) =>
      Promise.resolve({
        itens: pagina === 1 ? [item] : [itemPaginaDois],
        pagina,
        tamanho: 100,
        totalItens: 101,
        totalPaginas: 2,
      }),
    );
    api.consultarAdministracao.mockImplementation((partidaId: string) =>
      Promise.resolve({ ...detalhe, partidaId }),
    );

    render(<TelaGerenciarPartidas campeonatoId="campeonato-uuid" />);

    expect(await screen.findByText('Time C × Time D')).toBeVisible();
    expect(api.listarAgenda).toHaveBeenNthCalledWith(
      1,
      {
        campeonatoId: 'campeonato-uuid',
        pagina: 1,
        tamanho: 100,
      },
      { signal: expect.any(AbortSignal) },
    );
    expect(api.listarAgenda).toHaveBeenNthCalledWith(
      2,
      {
        campeonatoId: 'campeonato-uuid',
        pagina: 2,
        tamanho: 100,
      },
      { signal: expect.any(AbortSignal) },
    );
    expect(api.consultarAdministracao).toHaveBeenCalledTimes(2);
  });

  it('cancela a consulta pendente ao trocar a identidade administrativa', async () => {
    let sinalInicial: AbortSignal | undefined;
    api.listarAgenda.mockImplementationOnce(
      (_filtros: unknown, opcoes?: { signal?: AbortSignal }) => {
        sinalInicial = opcoes?.signal;
        return new Promise((_resolve, reject) => {
          opcoes?.signal?.addEventListener(
            'abort',
            () => reject(new DOMException('Consulta cancelada', 'AbortError')),
            { once: true },
          );
        });
      },
    );

    const { rerender } = render(
      <TelaGerenciarPartidas campeonatoId="campeonato-a" />,
    );
    await waitFor(() => expect(api.listarAgenda).toHaveBeenCalledTimes(1));
    expect(sinalInicial).toBeDefined();
    expect(sinalInicial?.aborted).toBe(false);

    rerender(<TelaGerenciarPartidas campeonatoId="campeonato-b" />);

    await waitFor(() => expect(sinalInicial?.aborted).toBe(true));
    await waitFor(() => expect(api.listarAgenda).toHaveBeenCalledTimes(2));
    expect(await screen.findByText('Time A × Time B')).toBeVisible();
    expect(
      screen.queryByText('Não foi possível carregar as partidas'),
    ).not.toBeInTheDocument();
  });

  it('mostra estado vazio quando a agenda publicada não tem partidas', async () => {
    api.listarAgenda.mockResolvedValue({
      itens: [],
      pagina: 1,
      tamanho: 100,
      totalItens: 0,
      totalPaginas: 0,
    });
    render(<TelaGerenciarPartidas campeonatoId="campeonato-uuid" />);

    expect(await screen.findByText('Nenhuma partida encontrada')).toBeVisible();
    expect(api.consultarAdministracao).not.toHaveBeenCalled();
  });

  it('mostra erro de carregamento e permite tentar novamente', async () => {
    api.listarAgenda.mockRejectedValueOnce(new Error('indisponível'));
    render(<TelaGerenciarPartidas campeonatoId="campeonato-uuid" />);

    expect(
      await screen.findByText('Não foi possível carregar as partidas'),
    ).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByText('Time A × Time B')).toBeVisible();
  });

  it('bloqueia retries concorrentes enquanto a tentativa atual está pendente', async () => {
    api.listarAgenda.mockRejectedValueOnce(new Error('indisponível'));
    render(<TelaGerenciarPartidas campeonatoId="campeonato-uuid" />);

    const botao = await screen.findByRole('button', {
      name: 'Tentar novamente',
    });
    let resolverRetry: ((value: unknown) => void) | undefined;
    api.listarAgenda.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolverRetry = resolve;
        }),
    );

    fireEvent.click(botao);
    expect(screen.getByRole('status')).toHaveTextContent('Carregando partidas');
    expect(
      screen.queryByRole('button', { name: 'Tentar novamente' }),
    ).not.toBeInTheDocument();
    expect(api.listarAgenda).toHaveBeenCalledTimes(2);

    await act(async () => {
      resolverRetry?.({
        itens: [item],
        pagina: 1,
        tamanho: 100,
        totalItens: 1,
        totalPaginas: 1,
      });
    });
    expect(await screen.findByText('Time A × Time B')).toBeVisible();
  });

  it('limpa dados e formulário imediatamente e usa a nova autenticação ao trocar de sessão', async () => {
    const { rerender } = render(
      <TelaGerenciarPartidas campeonatoId="campeonato-uuid" />,
    );
    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Agendar partida partida-uuid',
      }),
    );
    expect(screen.getByLabelText('Nova data')).toBeVisible();

    let resolverNovaAgenda: ((value: unknown) => void) | undefined;
    api.listarAgenda.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolverNovaAgenda = resolve;
        }),
    );
    sessao.sessionId = 'sessao-2';
    sessao.accountId = 'outro-organizador';
    sessao.token = 'token-novo';
    rerender(<TelaGerenciarPartidas campeonatoId="campeonato-uuid" />);

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(
        'Carregando partidas',
      ),
    );
    expect(screen.queryByText('Time A × Time B')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Nova data')).not.toBeInTheDocument();

    resolverNovaAgenda?.({
      itens: [item],
      pagina: 1,
      tamanho: 100,
      totalItens: 1,
      totalPaginas: 1,
    });
    expect(await screen.findByText('Time A × Time B')).toBeVisible();
    expect(api.consultarAdministracao).toHaveBeenLastCalledWith(
      'partida-uuid',
      'token-novo',
      { signal: expect.any(AbortSignal) },
    );
  });

  it('recarrega também quando apenas a conta autenticada muda', async () => {
    const { rerender } = render(
      <TelaGerenciarPartidas campeonatoId="campeonato-uuid" />,
    );
    expect(await screen.findByText('Time A × Time B')).toBeVisible();

    sessao.accountId = 'outra-conta';
    sessao.token = 'token-outra-conta';
    rerender(<TelaGerenciarPartidas campeonatoId="campeonato-uuid" />);

    await waitFor(() =>
      expect(api.consultarAdministracao).toHaveBeenLastCalledWith(
        'partida-uuid',
        'token-outra-conta',
        { signal: expect.any(AbortSignal) },
      ),
    );
  });

  it('ignora a conclusão tardia de uma operação iniciada pela sessão anterior', async () => {
    let concluirAgendamento: (() => void) | undefined;
    api.salvarAgendamento.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          concluirAgendamento = resolve;
        }),
    );
    const { rerender } = render(
      <TelaGerenciarPartidas campeonatoId="campeonato-uuid" />,
    );
    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Agendar partida partida-uuid',
      }),
    );
    fireEvent.change(screen.getByLabelText('Nova data'), {
      target: { value: '2026-09-01' },
    });
    fireEvent.change(screen.getByLabelText('Novo horário'), {
      target: { value: '18:00' },
    });
    fireEvent.change(screen.getByLabelText('Campo (UUID)'), {
      target: { value: 'campo-uuid' },
    });
    fireEvent.click(
      screen.getByRole('checkbox', {
        name: 'Confirmo que o campo e o horário foram autorizados externamente',
      }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Confirmar agendamento' }),
    );
    await waitFor(() => expect(api.salvarAgendamento).toHaveBeenCalledTimes(1));

    sessao.sessionId = 'sessao-2';
    sessao.accountId = 'organizador-2';
    sessao.token = 'token-novo';
    rerender(<TelaGerenciarPartidas campeonatoId="campeonato-uuid" />);
    await waitFor(() => expect(api.listarAgenda).toHaveBeenCalledTimes(2));
    concluirAgendamento?.();

    await waitFor(() =>
      expect(screen.getByText('Time A × Time B')).toBeVisible(),
    );
    expect(api.listarAgenda).toHaveBeenCalledTimes(2);
    expect(screen.queryByText('Agendamento salvo.')).not.toBeInTheDocument();
  });
});

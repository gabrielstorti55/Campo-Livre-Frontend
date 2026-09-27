import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TelaMeusEventos } from '@/screens/atleta/meus-eventos';

const mocks = vi.hoisted(() => ({
  listarMeusTimes: vi.fn(),
  listarAgenda: vi.fn(),
}));

vi.mock('@/contexts/times-api', () => ({
  useTimesApi: () => ({ listarMeusTimes: mocks.listarMeusTimes }),
}));

vi.mock('@/contexts/partidas-api', () => ({
  usePartidasApi: () => ({ listarAgenda: mocks.listarAgenda }),
}));

vi.mock('@/hooks/use-sessao', () => ({
  useSessao: () => ({
    executarAutenticado: <T,>(operacao: (token: string) => Promise<T>) =>
      operacao('access-token'),
  }),
}));

const partida = {
  partidaId: 'partida-1',
  campeonato: { id: 'campeonato-1', nome: 'Copa Municipal' },
  faseId: 'fase-1',
  rodada: 2,
  mandante: { timeId: 'time-1', nome: 'Vila Nova FC', sigla: 'VNF' },
  visitante: { timeId: 'time-2', nome: 'Leões FC', sigla: 'LEO' },
  inicioEm: '2026-10-03T18:00:00.000Z',
  campo: { id: 'campo-1', nome: 'Estádio Municipal' },
  estado: 'AGENDADA',
};

describe('Meus Eventos compartilhado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listarMeusTimes.mockResolvedValue({
      itens: [
        {
          membroId: 'membro-1',
          funcao: 'CAPITAO',
          entrouEm: '2026-01-01T00:00:00.000Z',
          time: {
            id: 'time-1',
            nome: 'Vila Nova FC',
            sigla: 'VNF',
            escudoUrl: null,
            status: 'ATIVO',
          },
        },
        {
          membroId: 'membro-2',
          funcao: 'ATLETA',
          entrouEm: '2026-01-01T00:00:00.000Z',
          time: {
            id: 'time-2',
            nome: 'Leões FC',
            sigla: 'LEO',
            escudoUrl: null,
            status: 'ATIVO',
          },
        },
      ],
      pagina: 1,
      tamanho: 100,
      totalItens: 2,
      totalPaginas: 1,
    });
    mocks.listarAgenda.mockResolvedValue({
      itens: [partida],
      pagina: 1,
      tamanho: 100,
      totalItens: 1,
      totalPaginas: 1,
    });
  });

  it('combina as agendas dos times da conta e remove partidas duplicadas', async () => {
    render(<TelaMeusEventos />);

    expect(await screen.findByText('Vila Nova FC × Leões FC')).toBeVisible();
    expect(screen.getAllByText('Vila Nova FC × Leões FC')).toHaveLength(1);
    expect(screen.getByText(/Copa Municipal · Rodada 2/i)).toBeVisible();
    expect(screen.getByText('Estádio Municipal')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Ver partida' })).toHaveAttribute(
      'href',
      '/partidas/partida-1',
    );

    expect(mocks.listarMeusTimes).toHaveBeenCalledWith('access-token', 1, 100);
    expect(mocks.listarAgenda).toHaveBeenCalledWith({
      timeId: 'time-1',
      pagina: 1,
      tamanho: 100,
    });
    expect(mocks.listarAgenda).toHaveBeenCalledWith({
      timeId: 'time-2',
      pagina: 1,
      tamanho: 100,
    });
  });

  it('mostra estado vazio quando a conta não possui time', async () => {
    mocks.listarMeusTimes.mockResolvedValue({
      itens: [],
      pagina: 1,
      tamanho: 100,
      totalItens: 0,
      totalPaginas: 0,
    });

    render(<TelaMeusEventos />);

    expect(
      await screen.findByRole('heading', { name: 'Nenhum evento encontrado' }),
    ).toBeVisible();
    expect(mocks.listarAgenda).not.toHaveBeenCalled();
  });

  it('mostra erro honesto sem recorrer a dados demonstrativos', async () => {
    mocks.listarMeusTimes.mockRejectedValue(new Error('indisponível'));

    render(<TelaMeusEventos />);

    await waitFor(() =>
      expect(
        screen.getByRole('heading', {
          name: 'Não foi possível carregar a agenda',
        }),
      ).toBeVisible(),
    );
    expect(
      screen.queryByText('Vila Nova FC × Leões FC'),
    ).not.toBeInTheDocument();
  });
});

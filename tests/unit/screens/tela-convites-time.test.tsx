import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TelaBuscarTimes } from '@/screens/atleta/buscar-times';

const listarMeusConvites = vi.fn();
const listarTimes = vi.fn();
const executarAutenticado = vi.fn(
  <T,>(request: (accessToken: string) => Promise<T>) =>
    request('access-em-memoria'),
);

vi.mock('@/contexts/times-api', () => ({
  useTimesApi: () => ({ listarMeusConvites, listarTimes }),
}));

vi.mock('@/hooks/use-sessao', () => ({
  useSessao: () => ({
    executarAutenticado,
    session: {
      account: { id: 'mock-person-unlinked-1' },
      links: { teamIds: [] },
    },
  }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('TelaBuscarTimes integrada ao service boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listarMeusConvites.mockResolvedValue({
      itens: [],
      pagina: 1,
      tamanho: 20,
      totalItens: 0,
      totalPaginas: 0,
    });
    listarTimes.mockResolvedValue({
      itens: [
        {
          id: 'time-1',
          nome: 'Leões FC',
          sigla: 'LEO',
          escudoUrl: null,
          municipio: { nome: 'Franca', uf: 'SP' },
        },
      ],
      pagina: 1,
      tamanho: 20,
      totalItens: 1,
      totalPaginas: 1,
    });
  });

  it('consulta os convites com a credencial mantida pela sessão', async () => {
    render(<TelaBuscarTimes />);

    expect(
      await screen.findByText('Você não possui convites pendentes.'),
    ).toBeVisible();
    expect(executarAutenticado).toHaveBeenCalledOnce();
    expect(listarMeusConvites).toHaveBeenCalledWith('access-em-memoria', 1, 20);
  });

  it('busca times ativos por nome sem usar a credencial privada', async () => {
    render(<TelaBuscarTimes />);

    fireEvent.change(screen.getByLabelText('Nome do time'), {
      target: { value: 'Leões' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar times' }));

    expect(
      await screen.findByRole('heading', { name: 'Leões FC' }),
    ).toBeVisible();
    expect(screen.getByText('LEO · Franca/SP')).toBeVisible();
    expect(listarTimes).toHaveBeenCalledWith({
      nome: 'Leões',
      pagina: 1,
      tamanho: 20,
    });
  });
});

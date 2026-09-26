import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TelaInicioAtleta } from '@/screens/atleta/inicio';

const listarMeusTimes = vi.fn();
const timesApi = { listarMeusTimes };
const executarAutenticado = <T,>(request: (token: string) => Promise<T>) =>
  request('access-token');
const sessao = {
  session: {
    minhaConta: { nome: 'Rafael Lima' },
  },
  executarAutenticado,
};

vi.mock('@/contexts/times-api', () => ({
  useTimesApi: () => timesApi,
}));

vi.mock('@/hooks/use-sessao', () => ({
  useSessao: () => sessao,
}));

describe('TelaInicioAtleta', () => {
  beforeEach(() => {
    listarMeusTimes.mockReset();
  });

  it('recupera e apresenta os próprios times como contextos esportivos', async () => {
    listarMeusTimes.mockResolvedValue({
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
        {
          membroId: 'membro-2',
          funcao: 'ATLETA',
          entrouEm: '2030-01-02T12:00:00.000Z',
          time: {
            id: 'time-2',
            nome: 'Tigres FC',
            sigla: 'TIG',
            escudoUrl: null,
            status: 'ATIVO',
          },
        },
      ],
      pagina: 1,
      tamanho: 20,
      totalItens: 1,
      totalPaginas: 1,
    });

    render(<TelaInicioAtleta />);

    expect(
      await screen.findByRole('heading', { name: 'Seus times' }),
    ).toBeVisible();
    expect(screen.getByRole('link', { name: /Leões FC/ })).toHaveAttribute(
      'href',
      '/atleta/time/time-1',
    );
    expect(screen.getByRole('link', { name: /Tigres FC/ })).toHaveAttribute(
      'href',
      '/times/time-2',
    );
    expect(listarMeusTimes).toHaveBeenCalledWith('access-token', 1, 100);
    expect(
      screen.queryByText(/backend ainda não publica os times/i),
    ).not.toBeInTheDocument();
  });
});

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ConteudoConvitesTime } from '@/screens/atleta/buscar-times';

describe('ConteudoConvitesTime', () => {
  it('consulta e exibe os convites pendentes da conta', async () => {
    const carregar = vi.fn().mockResolvedValue({
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
    });

    render(<ConteudoConvitesTime carregar={carregar} />);

    expect(
      await screen.findByRole('heading', { name: 'Leões FC' }),
    ).toBeVisible();
    expect(screen.getByText(/Convite enviado por Rafael Lima/)).toBeVisible();
    expect(carregar).toHaveBeenCalledOnce();
    expect(
      screen.queryByRole('button', { name: /Aceitar convite/ }),
    ).toBeNull();
    expect(
      screen.queryByRole('button', { name: /Recusar convite/ }),
    ).toBeNull();
  });

  it('exibe estado vazio quando não existem convites pendentes', async () => {
    const carregar = vi.fn().mockResolvedValue({
      itens: [],
      pagina: 1,
      tamanho: 20,
      totalItens: 0,
      totalPaginas: 0,
    });

    render(<ConteudoConvitesTime carregar={carregar} />);

    expect(
      await screen.findByText('Você não possui convites pendentes.'),
    ).toBeVisible();
  });

  it('exibe erro sem substituir a resposta por dados simulados', async () => {
    const carregar = vi.fn().mockRejectedValue(new Error('indisponível'));

    render(<ConteudoConvitesTime carregar={carregar} />);

    expect(
      await screen.findByText(
        'Não foi possível carregar seus convites. Tente novamente.',
      ),
    ).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'Leões FC' })).toBeNull();
  });

  it('remove imediatamente os dados anteriores durante uma nova consulta', async () => {
    const primeiraConsulta = vi.fn().mockResolvedValue({
      itens: [
        {
          id: 'convite-1',
          time: {
            id: 'time-1',
            nome: 'Leões FC',
            sigla: 'LEO',
            escudoUrl: null,
          },
          remetente: { nome: 'Rafael Lima', nomeUsuario: 'rafaellima' },
          expiraEm: '2030-01-07T12:00:00.000Z',
        },
      ],
      pagina: 1,
      tamanho: 20,
      totalItens: 1,
      totalPaginas: 1,
    });
    const segundaConsulta = vi.fn(() => new Promise<never>(() => undefined));
    const { rerender } = render(
      <ConteudoConvitesTime carregar={primeiraConsulta} />,
    );
    expect(
      await screen.findByRole('heading', { name: 'Leões FC' }),
    ).toBeVisible();

    rerender(<ConteudoConvitesTime carregar={segundaConsulta} />);

    expect(screen.queryByRole('heading', { name: 'Leões FC' })).toBeNull();
    expect(screen.getByText('Carregando convites...')).toBeVisible();
  });

  it('permite uma consulta bem-sucedida depois de uma falha', async () => {
    const falha = vi.fn().mockRejectedValue(new Error('indisponível'));
    const sucesso = vi.fn().mockResolvedValue({
      itens: [],
      pagina: 1,
      tamanho: 20,
      totalItens: 0,
      totalPaginas: 0,
    });
    const { rerender } = render(<ConteudoConvitesTime carregar={falha} />);
    expect(
      await screen.findByText(
        'Não foi possível carregar seus convites. Tente novamente.',
      ),
    ).toBeVisible();

    rerender(<ConteudoConvitesTime carregar={sucesso} />);

    expect(
      await screen.findByText('Você não possui convites pendentes.'),
    ).toBeVisible();
  });

  it('permite navegar por todas as páginas de convites', async () => {
    const carregar = vi.fn().mockImplementation((pagina: number) =>
      Promise.resolve({
        itens: [
          {
            id: `convite-${pagina}`,
            time: {
              id: `time-${pagina}`,
              nome: pagina === 1 ? 'Leões FC' : 'Tigres FC',
              sigla: pagina === 1 ? 'LEO' : 'TIG',
              escudoUrl: null,
            },
            remetente: { nome: 'Rafael Lima', nomeUsuario: 'rafaellima' },
            expiraEm: '2030-01-07T12:00:00.000Z',
          },
        ],
        pagina,
        tamanho: 20,
        totalItens: 21,
        totalPaginas: 2,
      }),
    );
    render(<ConteudoConvitesTime carregar={carregar} />);
    expect(
      await screen.findByRole('heading', { name: 'Leões FC' }),
    ).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Próxima página' }));

    expect(
      await screen.findByRole('heading', { name: 'Tigres FC' }),
    ).toBeVisible();
    expect(screen.getByText('Página 2 de 2')).toBeVisible();
    expect(carregar).toHaveBeenNthCalledWith(1, 1);
    expect(carregar).toHaveBeenNthCalledWith(2, 2);
  });
});

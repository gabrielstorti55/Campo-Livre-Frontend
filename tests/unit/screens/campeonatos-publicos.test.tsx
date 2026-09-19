import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TelaCampeonatos } from '@/screens/publico/campeonatos';

const listarCampeonatosPublicos = vi.fn();
const campeonatosApi = { listarCampeonatosPublicos };
const listarMunicipios = vi.fn();
const municipiosApi = { listarMunicipios };

vi.mock('@/contexts/campeonatos-api', () => ({
  useCampeonatosApi: () => campeonatosApi,
}));
vi.mock('@/contexts/municipios-api', () => ({
  useMunicipiosApi: () => municipiosApi,
}));

describe('TelaCampeonatos', () => {
  beforeEach(() => {
    listarCampeonatosPublicos.mockReset();
    listarMunicipios.mockReset();
    listarMunicipios.mockResolvedValue({
      itens: [
        { id: 'municipio-franca', nome: 'Franca', uf: 'SP' },
        { id: 'municipio-batatais', nome: 'Batatais', uf: 'SP' },
      ],
      pagina: 1,
      tamanho: 100,
      totalItens: 2,
      totalPaginas: 1,
    });
  });

  it('carrega a projeção pública pela porta sem exibir vazio durante loading', async () => {
    listarCampeonatosPublicos.mockResolvedValue({
      itens: [
        {
          id: 'campeonato-publico-1',
          nome: 'Copa do Contrato',
          status: 'EM_ANDAMENTO',
          municipio: { id: 'municipio-1', nome: 'Franca', uf: 'SP' },
        },
      ],
      pagina: 1,
      tamanho: 18,
      totalItens: 1,
      totalPaginas: 1,
    });

    render(<TelaCampeonatos />);

    expect(screen.getByRole('status')).toHaveTextContent(
      'Carregando campeonatos',
    );
    expect(
      screen.queryByText('Nenhum campeonato encontrado'),
    ).not.toBeInTheDocument();
    expect(await screen.findByText('Copa do Contrato')).toBeVisible();
    expect(listarCampeonatosPublicos).toHaveBeenCalledWith({
      pagina: 1,
      tamanho: 18,
    });
  });

  it('não usa catálogo local após erro e permite tentar novamente', async () => {
    listarCampeonatosPublicos
      .mockRejectedValueOnce(new Error('API indisponível'))
      .mockResolvedValueOnce({
        itens: [],
        pagina: 1,
        tamanho: 18,
        totalItens: 0,
        totalPaginas: 0,
      });

    render(<TelaCampeonatos />);

    expect(
      await screen.findByText('Não foi possível consultar os campeonatos'),
    ).toBeVisible();
    expect(screen.queryByText('Copa Franca 2026')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    await waitFor(() =>
      expect(listarCampeonatosPublicos).toHaveBeenCalledTimes(2),
    );
    expect(
      await screen.findByText('Nenhum campeonato encontrado'),
    ).toBeVisible();
  });

  it('filtra pelo identificador canônico do município selecionado', async () => {
    listarCampeonatosPublicos.mockResolvedValue({
      itens: [],
      pagina: 1,
      tamanho: 18,
      totalItens: 0,
      totalPaginas: 0,
    });

    render(<TelaCampeonatos />);

    const municipio = await screen.findByLabelText('Município');
    fireEvent.change(municipio, { target: { value: 'municipio-batatais' } });

    await waitFor(() =>
      expect(listarCampeonatosPublicos).toHaveBeenLastCalledWith({
        pagina: 1,
        tamanho: 18,
        municipioId: 'municipio-batatais',
      }),
    );
  });
});

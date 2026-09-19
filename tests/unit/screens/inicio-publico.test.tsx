import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TelaInicioPublico } from '@/screens/publico/inicio';

const listarCampeonatosPublicos = vi.fn().mockResolvedValue({
  itens: [
    {
      id: 'camp-1',
      nome: 'Copa do Contrato',
      status: 'EM_ANDAMENTO',
      municipio: { id: 'municipio-1', nome: 'Franca', uf: 'SP' },
    },
  ],
  pagina: 1,
  tamanho: 3,
  totalItens: 1,
  totalPaginas: 1,
});
const listarAgenda = vi.fn().mockResolvedValue({
  itens: [
    {
      partidaId: 'partida-1',
      campeonato: { id: 'camp-1', nome: 'Copa do Contrato' },
      faseId: 'fase-1',
      rodada: 1,
      mandante: { timeId: 'time-1', nome: 'Leões', sigla: 'LEO' },
      visitante: { timeId: 'time-2', nome: 'Tigres', sigla: 'TIG' },
      inicioEm: null,
      campo: null,
      estado: 'PENDENTE_AGENDAMENTO',
    },
  ],
  pagina: 1,
  tamanho: 3,
  totalItens: 1,
  totalPaginas: 1,
});
const campeonatosApi = { listarCampeonatosPublicos };
const partidasApi = { listarAgenda };

vi.mock('@/contexts/campeonatos-api', () => ({
  useCampeonatosApi: () => campeonatosApi,
}));
vi.mock('@/contexts/partidas-api', () => ({
  usePartidasApi: () => partidasApi,
}));

describe('TelaInicioPublico', () => {
  it('compõe campeonatos e agenda pelas portas públicas', async () => {
    render(<TelaInicioPublico />);

    expect(
      await screen.findByRole('link', {
        name: /Copa do Contrato.*Franca/i,
      }),
    ).toHaveAttribute('href', '/campeonatos/camp-1');
    expect(screen.getByRole('link', { name: /Leões × Tigres/ })).toBeVisible();
    expect(listarCampeonatosPublicos).toHaveBeenCalledWith({
      status: 'EM_ANDAMENTO',
      pagina: 1,
      tamanho: 3,
    });
    expect(listarAgenda).toHaveBeenCalledWith(
      { pagina: 1, tamanho: 3 },
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });
});

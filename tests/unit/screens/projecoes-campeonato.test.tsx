import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TelaDetalhesCampeonato } from '@/screens/publico/detalhes-campeonato';

const consultarCampeonato = vi.fn().mockResolvedValue({
  id: 'campeonato-1',
  nome: 'Copa Municipal',
  status: 'EM_ANDAMENTO',
  formato: 'PONTOS_CORRIDOS',
  municipio: { id: 'municipio-1', nome: 'Franca', uf: 'SP' },
});
const listarAgenda = vi.fn().mockResolvedValue({
  itens: [
    {
      partidaId: 'partida-1',
      campeonato: { id: 'campeonato-1', nome: 'Copa Municipal' },
      faseId: 'fase-1',
      rodada: 1,
      mandante: { timeId: 'time-1', nome: 'Leões', sigla: 'LEO' },
      visitante: { timeId: 'time-2', nome: 'Tigres', sigla: 'TIG' },
      inicioEm: '2030-01-01T18:00:00.000Z',
      campo: { id: 'campo-1', nome: 'Estádio Municipal' },
      estado: 'AGENDADA',
    },
  ],
  pagina: 1,
  tamanho: 20,
  totalItens: 1,
  totalPaginas: 1,
});
const campeonatosApi = { consultarCampeonato };
const partidasApi = { listarAgenda };

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'campeonato-1' }),
}));
vi.mock('@/contexts/campeonatos-api', () => ({
  useCampeonatosApi: () => campeonatosApi,
}));
vi.mock('@/contexts/partidas-api', () => ({
  usePartidasApi: () => partidasApi,
}));

describe('projeções esportivas do campeonato', () => {
  it('compõe detalhe, agenda e links públicos somente pelas portas publicadas', async () => {
    render(<TelaDetalhesCampeonato />);

    expect(screen.getByRole('status')).toHaveTextContent(
      'Carregando campeonato',
    );
    expect(
      await screen.findByRole('heading', { name: 'Copa Municipal' }),
    ).toBeVisible();
    expect(screen.getByText('Leões × Tigres')).toBeVisible();
    expect(
      screen.getByRole('link', { name: /Times participantes/ }),
    ).toHaveAttribute('href', '/campeonatos/campeonato-1/participantes');
    expect(screen.getByRole('link', { name: /Artilharia/ })).toHaveAttribute(
      'href',
      '/campeonatos/campeonato-1/artilharia',
    );
    expect(consultarCampeonato).toHaveBeenCalledWith('campeonato-1');
    expect(listarAgenda).toHaveBeenCalledWith(
      { campeonatoId: 'campeonato-1', pagina: 1, tamanho: 20 },
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });
});

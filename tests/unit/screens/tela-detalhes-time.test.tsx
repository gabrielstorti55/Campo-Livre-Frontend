import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TelaDetalhesTime } from '@/screens/publico/detalhes-time';

const consultarTime = vi.fn().mockResolvedValue({
  id: '2',
  nome: 'Leões FC',
  sigla: 'LEO',
  descricao: 'Time de futebol amador de Franca.',
  escudoUrl: null,
  municipio: { id: 'municipio-franca', nome: 'Franca', uf: 'SP' },
  status: 'ATIVO',
  capitao: { nome: 'Rafael Lima', nomeUsuario: 'rafaellima' },
  elencoResumo: [],
  historicoPartidas: [],
  estatisticasGerais: {
    partidas: 12,
    vitorias: 8,
    derrotas: 2,
    gols: 30,
    defesas: 0,
    penaltisDefendidos: 0,
    cartoesAmarelos: 4,
    cartoesVermelhos: 0,
  },
  estatisticasPorCampeonato: [],
  posicoesLeaderboards: [],
  titulosEColocacoes: [],
});
const listarElenco = vi.fn().mockResolvedValue({
  itens: [
    {
      membroId: 'membro-1',
      nome: 'Rafael Lima',
      nomeUsuario: 'rafaellima',
      fotoUrl: null,
      funcao: 'CAPITAO',
      entrouEm: '2025-01-10T12:00:00.000Z',
      estatisticas: {
        partidas: 12,
        vitorias: 8,
        derrotas: 2,
        gols: 3,
        defesas: 0,
        penaltisDefendidos: 0,
        cartoesAmarelos: 1,
        cartoesVermelhos: 0,
      },
    },
  ],
  pagina: 1,
  tamanho: 20,
  totalItens: 1,
  totalPaginas: 1,
});

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: '2' }),
}));
vi.mock('@/contexts/times-api', () => ({
  useTimesApi: () => ({ consultarTime, listarElenco }),
}));

describe('TelaDetalhesTime', () => {
  it('consulta e apresenta o detalhe e o elenco públicos pelo id da rota', async () => {
    render(<TelaDetalhesTime />);

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Leões FC' }),
    ).toBeVisible();
    expect(
      screen.getByRole('heading', { level: 3, name: 'Rafael Lima' }),
    ).toBeVisible();
    expect(screen.getAllByText(/12 partidas/).length).toBeGreaterThan(0);
    expect(consultarTime).toHaveBeenCalledWith('2');
    expect(listarElenco).toHaveBeenCalledWith('2', 1, 20);
  });
});

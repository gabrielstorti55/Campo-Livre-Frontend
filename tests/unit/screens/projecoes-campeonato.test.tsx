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
const consultarFases = vi.fn().mockResolvedValue({
  campeonatoId: 'campeonato-1',
  versaoConfiguracao: 3,
  fases: [
    {
      faseId: 'fase-1',
      nome: 'Fase classificatória',
      ordem: 1,
      tipo: 'PONTOS_CORRIDOS',
      quantidadeTurnos: 1,
      classificadosPorGrupo: null,
      grupos: [],
      statusMaterializacao: 'GERADA',
    },
  ],
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
const consultarClassificacao = vi.fn().mockResolvedValue({
  campeonatoId: 'campeonato-1',
  faseId: 'fase-1',
  grupoId: null,
  tipoProjecao: 'CLASSIFICACAO',
  estadoProjecao: 'PARCIAL',
  criteriosAplicados: ['PONTOS', 'VITORIAS', 'SALDO_GOLS', 'ORDEM_INSCRICAO'],
  linhas: [
    {
      posicao: 1,
      timeId: 'time-1',
      nome: 'Leões',
      jogos: 4,
      vitorias: 3,
      empates: 1,
      derrotas: 0,
      golsPro: 10,
      golsContra: 3,
      saldoGols: 7,
      pontos: 10,
      classificado: true,
    },
  ],
  confrontos: [],
  atualizadoEm: '2026-09-24T12:00:00.000Z',
});
const campeonatosApi = { consultarCampeonato, consultarFases };
const partidasApi = { listarAgenda, consultarClassificacao };

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
  it('compõe classificação, estrutura, partidas e links somente pelas portas publicadas', async () => {
    render(<TelaDetalhesCampeonato />);

    expect(screen.getByRole('status')).toHaveTextContent(
      'Carregando campeonato',
    );
    expect(
      await screen.findByRole('heading', { name: 'Copa Municipal' }),
    ).toBeVisible();
    expect(screen.getByText('Leões × Tigres')).toBeVisible();
    expect(
      screen.getByRole('heading', { name: 'Classificação' }),
    ).toBeVisible();
    expect(
      screen.getByRole('heading', { name: 'Estrutura da competição' }),
    ).toBeVisible();
    expect(
      screen.getByRole('heading', { name: 'Partidas e resultados' }),
    ).toBeVisible();
    expect(screen.getByRole('columnheader', { name: 'Pts' })).toBeVisible();
    expect(screen.getByText('Fase classificatória')).toBeVisible();
    expect(
      screen.getByRole('link', { name: /Times participantes/ }),
    ).toHaveAttribute('href', '/campeonatos/campeonato-1/participantes');
    expect(screen.getByRole('link', { name: /Artilharia/ })).toHaveAttribute(
      'href',
      '/campeonatos/campeonato-1/artilharia',
    );
    expect(consultarCampeonato).toHaveBeenCalledWith('campeonato-1');
    expect(consultarFases).toHaveBeenCalledWith('campeonato-1');
    expect(consultarClassificacao).toHaveBeenCalledWith(
      'campeonato-1',
      'fase-1',
    );
    expect(listarAgenda).toHaveBeenCalledWith(
      { campeonatoId: 'campeonato-1', pagina: 1, tamanho: 20 },
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });
});

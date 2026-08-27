import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TelaGerenciarTime } from '@/screens/atleta/gerenciar-time';

const consultarTime = vi.fn().mockResolvedValue({
  id: '2',
  nome: 'Leões FC',
  sigla: 'LEO',
  descricao: 'Time amador de Franca.',
  escudoUrl: null,
  municipio: { id: 'municipio-franca', nome: 'Franca', uf: 'SP' },
  status: 'ATIVO',
  capitao: { nome: 'Rafael Lima', nomeUsuario: 'rafaellima' },
  elencoResumo: [],
  historicoPartidas: [],
  estatisticasGerais: {
    partidas: 0,
    vitorias: 0,
    derrotas: 0,
    gols: 0,
    defesas: 0,
    penaltisDefendidos: 0,
    cartoesAmarelos: 0,
    cartoesVermelhos: 0,
  },
  estatisticasPorCampeonato: [],
  posicoesLeaderboards: [],
  titulosEColocacoes: [],
});
const atualizarTime = vi.fn().mockResolvedValue({
  id: '2',
  nome: 'Leões do Norte',
  sigla: 'LDN',
  descricao: 'Nova descrição',
  atualizadoEm: '2030-01-01T12:00:00.000Z',
});
const executarAutenticado = vi.fn(
  <T,>(operacao: (accessToken: string) => Promise<T>) =>
    operacao('access-capitao'),
);

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: '2' }),
}));
vi.mock('@/contexts/times-api', () => ({
  useTimesApi: () => ({ consultarTime, atualizarTime }),
}));
vi.mock('@/hooks/use-sessao', () => ({
  useSessao: () => ({ executarAutenticado }),
}));

describe('TelaGerenciarTime', () => {
  it('atualiza somente os dados públicos usando a sessão do capitão', async () => {
    render(<TelaGerenciarTime />);

    fireEvent.change(await screen.findByLabelText('Nome do time'), {
      target: { value: 'Leões do Norte' },
    });
    fireEvent.change(screen.getByLabelText('Sigla'), {
      target: { value: 'LDN' },
    });
    fireEvent.change(screen.getByLabelText('Descrição pública'), {
      target: { value: 'Nova descrição' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    expect(
      await screen.findByText('Dados públicos atualizados.'),
    ).toBeVisible();
    expect(atualizarTime).toHaveBeenCalledWith('2', 'access-capitao', {
      nome: 'Leões do Norte',
      sigla: 'LDN',
      descricao: 'Nova descrição',
    });
  });
});

import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TelaMinhaArea } from '@/screens/conta/minha-area';

const mocks = vi.hoisted(() => ({
  listarMeusTimes: vi.fn(),
  reconciliarVinculosTimes: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/contexts/times-api', () => ({
  useTimesApi: () => ({ listarMeusTimes: mocks.listarMeusTimes }),
}));

vi.mock('@/hooks/use-sessao', () => ({
  useSessao: () => ({
    hydrated: true,
    enableOrganizer: vi.fn(),
    switchContext: vi.fn(),
    executarAutenticado: <T,>(operacao: (token: string) => Promise<T>) =>
      operacao('access-token'),
    reconciliarVinculosTimes: mocks.reconciliarVinculosTimes,
    session: {
      sessionId: 'conta-integrada',
      prototipo: false,
      account: {
        id: 'conta-integrada',
        name: 'Atleta Integrado',
        email: 'atleta@example.test',
        type: 'pessoa',
      },
      minhaConta: {
        id: 'conta-integrada',
        nome: 'Atleta Integrado',
        email: 'atleta@example.test',
        administrador: false,
        organizadorHabilitado: false,
      },
      capabilities: [],
      activeContext: null,
      links: {
        teamIds: [],
        captainTeamIds: [],
        createdTeams: [],
        organizedChampionshipIds: [],
        institutionalOrganizationIds: [],
      },
    },
  }),
}));

describe('Minha área integrada com vínculos de time', () => {
  it('consulta a projeção privada e reconcilia atleta/capitão por ID estável', async () => {
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
      ],
      pagina: 1,
      tamanho: 100,
      totalItens: 1,
      totalPaginas: 1,
    });

    render(<TelaMinhaArea />);

    expect(screen.getByRole('status')).toHaveTextContent(
      'Carregando sua conta e seus vínculos',
    );
    await waitFor(() =>
      expect(mocks.reconciliarVinculosTimes).toHaveBeenCalledWith([
        { timeId: 'time-1', funcao: 'CAPITAO' },
      ]),
    );
    expect(mocks.listarMeusTimes).toHaveBeenCalledWith('access-token', 1, 100);
  });
});

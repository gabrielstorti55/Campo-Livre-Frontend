import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TelaMinhaArea } from '@/screens/conta/minha-area';

const push = vi.fn();
const enableOrganizer = vi.fn().mockResolvedValue(undefined);
const switchContext = vi.fn();

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  useRouter: () => ({ push }),
}));

vi.mock('@/hooks/use-sessao', () => ({
  useSessao: () => ({
    hydrated: true,
    enableOrganizer,
    switchContext,
    session: {
      sessionId: 'conta-prefeitura',
      prototipo: true,
      account: {
        id: 'conta-prefeitura',
        name: 'Gestora Municipal',
        email: 'prefeitura@campolivre.test',
        city: 'Franca, SP',
        type: 'pessoa',
      },
      minhaConta: {
        id: 'conta-prefeitura',
        nome: 'Gestora Municipal',
        email: 'prefeitura@campolivre.test',
        administrador: false,
        organizadorHabilitado: false,
      },
      capabilities: ['prefeitura'],
      activeContext: 'prefeitura',
      links: {
        teamIds: [],
        captainTeamIds: [],
        createdTeams: [],
        organizedChampionshipIds: [],
        institutionalOrganizationIds: ['prefeitura-franca'],
      },
    },
  }),
}));

describe('TelaMinhaArea da Prefeitura', () => {
  it('não oferece contexto nem entrada para a área de atleta', () => {
    render(<TelaMinhaArea />);

    expect(
      screen.queryByRole('article', { name: 'Contexto de atleta' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Entrar em um time' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Criar um time' }),
    ).not.toBeInTheDocument();
  });

  it('permite ativar o contexto de organizador sem remover o contexto municipal', async () => {
    render(<TelaMinhaArea />);

    expect(
      screen.getByRole('article', { name: 'Contexto de Prefeitura' }),
    ).toBeVisible();

    fireEvent.click(
      screen.getByRole('button', { name: 'Ativar painel de organizador' }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Confirmar ativação do painel' }),
    );

    await waitFor(() => expect(enableOrganizer).toHaveBeenCalledOnce());
    expect(switchContext).toHaveBeenCalledWith('organizador');
    expect(push).toHaveBeenCalledWith('/organizador/campeonatos');
  });
});

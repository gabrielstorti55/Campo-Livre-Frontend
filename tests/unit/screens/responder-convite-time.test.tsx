import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TelaResponderConviteTime } from '@/screens/atleta/responder-convite-time';

const consultarConvitePorToken = vi.fn();
const aceitarConvitePorToken = vi.fn();
const recusarConvitePorToken = vi.fn();
const api = {
  consultarConvitePorToken,
  aceitarConvitePorToken,
  recusarConvitePorToken,
};
const executarAutenticado = <T,>(operacao: (token: string) => Promise<T>) =>
  operacao('access-token');

vi.mock('next/navigation', () => ({
  useParams: () => ({ token: 'token-opaco' }),
}));
vi.mock('@/contexts/times-api', () => ({ useTimesApi: () => api }));
vi.mock('@/hooks/use-sessao', () => ({
  useSessao: () => ({
    session: { sessionId: 'sessao-1', account: { id: 'conta-1' } },
    executarAutenticado,
  }),
}));

describe('TelaResponderConviteTime', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consultarConvitePorToken.mockResolvedValue({
      conviteId: 'convite-1',
      time: { id: 'time-1', nome: 'Leões FC', sigla: 'LEO', escudoUrl: null },
      destinatario: { emailMascarado: 'a***@exemplo.com' },
      status: 'PENDENTE',
      expiraEm: '2030-01-07T12:00:00.000Z',
      acoesPermitidas: ['ACEITAR', 'RECUSAR'],
    });
    aceitarConvitePorToken.mockResolvedValue({
      conviteId: 'convite-1',
      status: 'ACEITO',
      timeId: 'time-1',
      membroTimeId: 'membro-1',
      entrouEm: '2030-01-01T12:00:00.000Z',
    });
  });

  it('consulta o convite autenticado e confirma antes de aceitar', async () => {
    render(<TelaResponderConviteTime />);

    expect(screen.getByRole('status')).toHaveTextContent('Carregando convite');
    expect(
      await screen.findByRole('heading', { name: 'Leões FC' }),
    ).toBeVisible();
    expect(screen.getByText('a***@exemplo.com')).toBeVisible();
    expect(screen.queryByText('token-opaco')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Aceitar convite' }));
    expect(aceitarConvitePorToken).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar aceite' }));

    await waitFor(() =>
      expect(aceitarConvitePorToken).toHaveBeenCalledWith(
        'token-opaco',
        'access-token',
      ),
    );
    expect(await screen.findByText('Convite aceito.')).toBeVisible();
  });

  it('renderiza apenas ações permitidas pela projeção', async () => {
    consultarConvitePorToken.mockResolvedValueOnce({
      conviteId: 'convite-1',
      time: { id: 'time-1', nome: 'Leões FC', sigla: 'LEO', escudoUrl: null },
      destinatario: { emailMascarado: 'a***@exemplo.com' },
      status: 'PENDENTE',
      expiraEm: '2030-01-07T12:00:00.000Z',
      acoesPermitidas: ['RECUSAR'],
    });

    render(<TelaResponderConviteTime />);
    await screen.findByRole('heading', { name: 'Leões FC' });

    expect(
      screen.queryByRole('button', { name: 'Aceitar convite' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Recusar convite' }),
    ).toBeVisible();
  });
});

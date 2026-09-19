import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TelaConvitePrefeituraPorToken } from '@/screens/publico/convite-prefeitura';

const consultarConvitePorToken = vi.fn().mockResolvedValue({
  prefeituraId: 'prefeitura-1',
  prefeituraNome: 'Prefeitura Municipal de Franca',
  papelDestino: 'MEMBRO',
  status: 'PENDENTE',
  expiraEm: '2030-01-01T00:00:00.000Z',
});
const aceitarConvitePorToken = vi
  .fn()
  .mockResolvedValue({ vinculoAtivo: true });
const recusarConvitePorToken = vi.fn().mockResolvedValue(undefined);
const recarregarMinhaConta = vi.fn().mockResolvedValue({});

vi.mock('next/navigation', () => ({ useParams: () => ({ token: 'token-1' }) }));
vi.mock('@/contexts/gestao-prefeituras-api', () => ({
  useGestaoPrefeiturasApi: () => ({
    consultarConvitePorToken,
    aceitarConvitePorToken,
    recusarConvitePorToken,
  }),
}));
vi.mock('@/hooks/use-sessao', () => ({
  useSessao: () => ({
    session: { account: { id: 'user-1' } },
    hydrated: true,
    executarAutenticado: <T,>(operacao: (token: string) => Promise<T>) =>
      operacao('access-token'),
    recarregarMinhaConta,
  }),
}));

describe('TelaConvitePrefeituraPorToken', () => {
  it('consulta o token e aceita somente após confirmação', async () => {
    render(<TelaConvitePrefeituraPorToken />);
    expect(
      await screen.findByText('Prefeitura Municipal de Franca'),
    ).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Aceitar convite' }));
    expect(aceitarConvitePorToken).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar aceite' }));
    await waitFor(() =>
      expect(aceitarConvitePorToken).toHaveBeenCalledWith(
        'token-1',
        'access-token',
      ),
    );
    expect(recarregarMinhaConta).toHaveBeenCalled();
  });
});

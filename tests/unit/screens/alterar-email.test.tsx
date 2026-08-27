import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { FormularioAlteracaoEmail } from '@/screens/conta/alterar-email';

describe('FormularioAlteracaoEmail', () => {
  it('mantém o e-mail atual e informa a confirmação pendente', async () => {
    const onSubmit = vi.fn().mockResolvedValue({
      confirmacaoPendente: true,
      novoEmailMascarado: 'n***@exemplo.com',
      expiraEm: '2030-01-01T00:30:00.000Z',
    });
    render(<FormularioAlteracaoEmail modo="integrado" onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText('Novo e-mail'), {
      target: { value: ' NOVO@EXEMPLO.COM ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar confirmação' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith('novo@exemplo.com'),
    );
    expect(screen.getByText(/e-mail atual continua válido/i)).toBeVisible();
    expect(screen.getByText('n***@exemplo.com')).toBeVisible();
    expect(screen.queryByText('Abrir confirmação simulada')).toBeNull();
  });

  it('expõe o link somente no protótipo explicitamente identificado', async () => {
    const onSubmit = vi.fn().mockResolvedValue({
      confirmacaoPendente: true,
      novoEmailMascarado: 'n***@exemplo.com',
      expiraEm: '2030-01-01T00:30:00.000Z',
    });
    render(<FormularioAlteracaoEmail modo="prototipo" onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText('Novo e-mail'), {
      target: { value: 'novo@exemplo.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar confirmação' }));

    expect(
      await screen.findByRole('link', { name: 'Abrir confirmação simulada' }),
    ).toHaveAttribute(
      'href',
      '/confirmar-alteracao-email?token=alteracao-email-token-novo%2540exemplo.com',
    );
  });
});

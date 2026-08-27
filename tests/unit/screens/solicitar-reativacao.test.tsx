import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { FormularioSolicitacaoReativacao } from '@/screens/publico/solicitar-reativacao';

describe('solicitação de reativação por e-mail', () => {
  it('exibe resposta neutra e oferece o link somente no protótipo', async () => {
    const onSubmit = vi.fn().mockResolvedValue({ solicitacaoAceita: true });
    render(
      <FormularioSolicitacaoReativacao modo="prototipo" onSubmit={onSubmit} />,
    );

    fireEvent.change(screen.getByLabelText('E-mail'), {
      target: { value: ' INATIVA@CAMPOLIVRE.TEST ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar link' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith('inativa@campolivre.test'),
    );
    expect(
      screen.getByText(/se a conta puder ser reativada/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Abrir reativação simulada' }),
    ).toHaveAttribute(
      'href',
      '/confirmar-reativacao?token=reativacao-token-inativa%40campolivre.test',
    );
  });
});

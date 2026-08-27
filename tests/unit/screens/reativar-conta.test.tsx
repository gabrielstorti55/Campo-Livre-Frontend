import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { FormularioReativacaoConta } from '@/screens/publico/reativar-conta';

it('reativa com confirmação explícita e exige novo login', async () => {
  const onSubmit = vi.fn().mockResolvedValue({
    contaReativada: true,
    eliminacaoCancelada: true,
    novoLoginNecessario: true,
  });
  render(<FormularioReativacaoConta onSubmit={onSubmit} />);

  fireEvent.change(screen.getByLabelText('E-mail'), {
    target: { value: ' PESSOA@EXEMPLO.COM ' },
  });
  fireEvent.change(screen.getByLabelText('Senha'), {
    target: { value: 'senha' },
  });
  fireEvent.click(
    screen.getByLabelText(
      'Confirmo que desejo cancelar a eliminação e reativar minha conta',
    ),
  );
  fireEvent.click(screen.getByRole('button', { name: 'Reativar conta' }));

  await waitFor(() =>
    expect(onSubmit).toHaveBeenCalledWith({
      email: 'pessoa@exemplo.com',
      senha: 'senha',
      confirmacao: true,
    }),
  );
  expect(
    screen.getByRole('heading', { name: 'Conta reativada' }),
  ).toBeVisible();
  expect(
    screen.getByRole('link', { name: 'Entrar novamente' }),
  ).toHaveAttribute('href', '/login');
});

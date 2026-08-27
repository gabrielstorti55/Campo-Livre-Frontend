import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { FormularioAlteracaoSenha } from '@/screens/conta/alterar-senha';

describe('FormularioAlteracaoSenha', () => {
  it('envia a senha atual e a nova senha somente quando coincidem', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<FormularioAlteracaoSenha onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText('Senha atual'), {
      target: { value: 'senha-atual' },
    });
    fireEvent.change(screen.getByLabelText('Nova senha'), {
      target: { value: 'nova-senha' },
    });
    fireEvent.change(screen.getByLabelText('Confirmar nova senha'), {
      target: { value: 'nova-senha' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Alterar senha' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        senhaAtual: 'senha-atual',
        novaSenha: 'nova-senha',
      }),
    );
  });

  it('bloqueia senhas divergentes', async () => {
    const onSubmit = vi.fn();
    render(<FormularioAlteracaoSenha onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText('Senha atual'), {
      target: { value: 'senha-atual' },
    });
    fireEvent.change(screen.getByLabelText('Nova senha'), {
      target: { value: 'nova-senha' },
    });
    fireEvent.change(screen.getByLabelText('Confirmar nova senha'), {
      target: { value: 'outra-senha' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Alterar senha' }));

    expect(
      await screen.findByText('As senhas informadas não coincidem.'),
    ).toBeVisible();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

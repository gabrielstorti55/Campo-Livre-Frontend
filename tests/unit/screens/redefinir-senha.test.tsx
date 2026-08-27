import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ProvedorAutenticacaoApi } from '@/contexts/autenticacao-api';
import { TelaRedefinirSenha } from '@/screens/publico/redefinir-senha';
import type { AutenticacaoApi } from '@/services/autenticacao/autenticacao-api';

function renderizar(api: AutenticacaoApi) {
  render(
    <ProvedorAutenticacaoApi api={api}>
      <TelaRedefinirSenha />
    </ProvedorAutenticacaoApi>,
  );
}

describe('TelaRedefinirSenha', () => {
  it('remove o token da URL e redefine a senha pelo adapter', async () => {
    window.history.replaceState(
      {},
      '',
      '/redefinir-senha?token=token-recuperacao',
    );
    const redefinirSenha = vi.fn().mockResolvedValue({
      senhaAlterada: true,
      sessoesRevogadas: true,
      novoLoginNecessario: true,
    });
    renderizar({ redefinirSenha } as unknown as AutenticacaoApi);

    fireEvent.change(screen.getByLabelText('Nova senha'), {
      target: { value: 'nova-senha-segura' },
    });
    fireEvent.change(screen.getByLabelText('Confirmar nova senha'), {
      target: { value: 'nova-senha-segura' },
    });
    fireEvent.submit(screen.getByRole('button', { name: 'Redefinir senha' }));

    await waitFor(() =>
      expect(redefinirSenha).toHaveBeenCalledWith({
        token: 'token-recuperacao',
        novaSenha: 'nova-senha-segura',
      }),
    );
    expect(window.location.pathname + window.location.search).toBe(
      '/redefinir-senha',
    );
    expect(
      await screen.findByRole('heading', { name: 'Senha redefinida' }),
    ).toBeVisible();
  });

  it('bloqueia senhas divergentes sem consumir o token', async () => {
    window.history.replaceState(
      {},
      '',
      '/redefinir-senha?token=token-recuperacao',
    );
    const redefinirSenha = vi.fn();
    renderizar({ redefinirSenha } as unknown as AutenticacaoApi);

    fireEvent.change(screen.getByLabelText('Nova senha'), {
      target: { value: 'senha-a' },
    });
    fireEvent.change(screen.getByLabelText('Confirmar nova senha'), {
      target: { value: 'senha-b' },
    });
    fireEvent.submit(screen.getByRole('button', { name: 'Redefinir senha' }));

    expect(
      await screen.findByText('As senhas informadas não coincidem.'),
    ).toBeVisible();
    expect(redefinirSenha).not.toHaveBeenCalled();
  });
});

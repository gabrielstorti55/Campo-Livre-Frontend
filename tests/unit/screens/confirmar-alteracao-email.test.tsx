import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ProvedorAutenticacaoApi } from '@/contexts/autenticacao-api';
import { TelaConfirmarAlteracaoEmail } from '@/screens/publico/confirmar-alteracao-email';
import type { AutenticacaoApi } from '@/services/autenticacao/autenticacao-api';

it('remove o token da URL antes de confirmar a alteração de e-mail', async () => {
  window.history.replaceState(
    {},
    '',
    '/confirmar-alteracao-email?token=token-opaco',
  );
  const confirmarAlteracaoEmail = vi.fn().mockResolvedValue({
    emailAlterado: true,
    emailConfirmado: true,
  });

  render(
    <ProvedorAutenticacaoApi
      api={{ confirmarAlteracaoEmail } as unknown as AutenticacaoApi}
    >
      <TelaConfirmarAlteracaoEmail />
    </ProvedorAutenticacaoApi>,
  );

  await waitFor(() =>
    expect(confirmarAlteracaoEmail).toHaveBeenCalledWith('token-opaco'),
  );
  expect(window.location.pathname + window.location.search).toBe(
    '/confirmar-alteracao-email',
  );
  expect(
    await screen.findByRole('heading', { name: 'E-mail alterado' }),
  ).toBeVisible();
});

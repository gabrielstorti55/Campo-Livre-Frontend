import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ProvedorAutenticacaoApi } from '@/contexts/autenticacao-api';
import { TelaConfirmarReativacao } from '@/screens/publico/confirmar-reativacao';
import type { AutenticacaoApi } from '@/services/autenticacao/autenticacao-api';

it('remove o token da URL e confirma a reativação sem criar sessão', async () => {
  window.history.replaceState(
    {},
    '',
    '/confirmar-reativacao?token=token-opaco',
  );
  const confirmarReativacaoConta = vi.fn().mockResolvedValue({
    contaReativada: true,
    eliminacaoCancelada: true,
    novoLoginNecessario: true,
  });

  render(
    <ProvedorAutenticacaoApi
      api={{ confirmarReativacaoConta } as unknown as AutenticacaoApi}
    >
      <TelaConfirmarReativacao />
    </ProvedorAutenticacaoApi>,
  );

  await waitFor(() =>
    expect(confirmarReativacaoConta).toHaveBeenCalledWith('token-opaco'),
  );
  expect(window.location.search).toBe('');
  expect(
    screen.getByRole('heading', { name: 'Conta reativada' }),
  ).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Entrar' })).toHaveAttribute(
    'href',
    '/login',
  );
});

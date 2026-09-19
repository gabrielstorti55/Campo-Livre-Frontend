import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ProvedorAutenticacaoApi } from '@/contexts/autenticacao-api';
import { TelaConfirmarEmail } from '@/screens/publico/confirmar-email';
import type { AutenticacaoApi } from '@/services/autenticacao/autenticacao-api';

function renderizar(api: AutenticacaoApi) {
  render(
    <ProvedorAutenticacaoApi api={api}>
      <TelaConfirmarEmail />
    </ProvedorAutenticacaoApi>,
  );
}

describe('TelaConfirmarEmail', () => {
  it('remove o token da URL antes de confirmar o e-mail', async () => {
    window.history.replaceState({}, '', '/confirmar-email?token=token-opaco');
    const confirmarEmail = vi.fn().mockResolvedValue({
      emailConfirmado: true,
      statusConta: 'ATIVA',
      consentimentoResponsavelNecessario: false,
    });
    renderizar({ confirmarEmail } as unknown as AutenticacaoApi);

    await waitFor(() =>
      expect(confirmarEmail).toHaveBeenCalledWith('token-opaco'),
    );
    expect(window.location.pathname + window.location.search).toBe(
      '/confirmar-email',
    );
    expect(
      await screen.findByRole('heading', { name: 'E-mail confirmado' }),
    ).toBeVisible();
  });

  it('não chama a API quando o link não contém token', async () => {
    window.history.replaceState({}, '', '/confirmar-email');
    const confirmarEmail = vi.fn();
    renderizar({ confirmarEmail } as unknown as AutenticacaoApi);

    expect(
      await screen.findByText('O link de confirmação é inválido.'),
    ).toBeVisible();
    expect(confirmarEmail).not.toHaveBeenCalled();
  });

  it('não oferece login enquanto a conta aguarda consentimento do responsável', async () => {
    window.history.replaceState({}, '', '/confirmar-email?token=token-menor');
    const confirmarEmail = vi.fn().mockResolvedValue({
      emailConfirmado: true,
      statusConta: 'AGUARDANDO_CONSENTIMENTO',
      consentimentoResponsavelNecessario: true,
    });
    renderizar({ confirmarEmail } as unknown as AutenticacaoApi);

    expect(
      await screen.findByText(/ainda aguarda o consentimento do responsável/i),
    ).toBeVisible();
    expect(
      screen.queryByRole('link', { name: 'Ir para o acesso' }),
    ).not.toBeInTheDocument();
  });
});

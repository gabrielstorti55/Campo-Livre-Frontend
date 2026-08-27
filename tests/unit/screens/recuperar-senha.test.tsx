import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ProvedorAutenticacaoApi } from '@/contexts/autenticacao-api';
import { TelaRecuperarSenha } from '@/screens/publico/recuperar-senha';
import type { AutenticacaoApi } from '@/services/autenticacao/autenticacao-api';

function renderizar(api: AutenticacaoApi) {
  render(
    <ProvedorAutenticacaoApi api={api}>
      <TelaRecuperarSenha />
    </ProvedorAutenticacaoApi>,
  );
}

describe('TelaRecuperarSenha', () => {
  it('solicita recuperação pelo adapter e mantém resposta pública neutra', async () => {
    const solicitarRecuperacao = vi
      .fn()
      .mockResolvedValue({ solicitacaoAceita: true });
    renderizar({ solicitarRecuperacao } as unknown as AutenticacaoApi);

    fireEvent.change(screen.getByLabelText('E-mail'), {
      target: { value: ' Pessoa@Exemplo.com ' },
    });
    fireEvent.submit(screen.getByRole('button', { name: 'Enviar instruções' }));

    await waitFor(() =>
      expect(solicitarRecuperacao).toHaveBeenCalledWith('Pessoa@Exemplo.com'),
    );
    expect(
      screen.getByRole('heading', { name: 'Confira seu e-mail' }),
    ).toBeVisible();
    expect(screen.getByText(/se existir uma conta elegível/i)).toBeVisible();
  });

  it('não apresenta sucesso quando o serviço está indisponível', async () => {
    const solicitarRecuperacao = vi
      .fn()
      .mockRejectedValue(new Error('offline'));
    renderizar({ solicitarRecuperacao } as unknown as AutenticacaoApi);

    fireEvent.change(screen.getByLabelText('E-mail'), {
      target: { value: 'pessoa@exemplo.com' },
    });
    fireEvent.submit(screen.getByRole('button', { name: 'Enviar instruções' }));

    expect(
      await screen.findByText(
        'Não foi possível solicitar a recuperação agora. Tente novamente.',
      ),
    ).toBeVisible();
    expect(screen.queryByText('Confira seu e-mail')).toBeNull();
  });

  it('expõe o link de recuperação apenas como simulação explícita', async () => {
    const solicitarRecuperacao = vi.fn().mockResolvedValue({
      solicitacaoAceita: true,
    });
    render(
      <ProvedorAutenticacaoApi
        api={{ solicitarRecuperacao } as unknown as AutenticacaoApi}
      >
        <TelaRecuperarSenha modo="prototipo" />
      </ProvedorAutenticacaoApi>,
    );

    fireEvent.change(screen.getByLabelText('E-mail'), {
      target: { value: 'pessoa@campolivre.test' },
    });
    fireEvent.submit(screen.getByRole('button', { name: 'Enviar instruções' }));

    expect(
      await screen.findByRole('link', { name: 'Abrir recuperação simulada' }),
    ).toHaveAttribute(
      'href',
      '/redefinir-senha?token=recuperacao-token-pessoa%2540campolivre.test',
    );
  });
});

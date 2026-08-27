import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TelaLogin } from '@/screens/publico/login';
import { ErroApi } from '@/services/api/problem-details';

const useSessaoMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/hooks/use-sessao', () => ({
  useSessao: () => useSessaoMock(),
}));

describe('TelaLogin', () => {
  beforeEach(() => {
    useSessaoMock.mockReturnValue({
      hydrated: true,
      status: 'visitante',
      signIn: vi.fn(),
      erroSessao: 'Sua conta não está disponível para acesso.',
    });
  });

  it('informa o motivo seguro do encerramento da sessão', () => {
    render(<TelaLogin />);

    expect(screen.getByRole('status')).toHaveTextContent(
      'Sua conta não está disponível para acesso.',
    );
  });

  it('associa erros de validação aos campos conhecidos do login', async () => {
    useSessaoMock.mockReturnValue({
      hydrated: true,
      status: 'visitante',
      signIn: vi.fn().mockRejectedValue(
        new ErroApi({
          type: 'about:blank',
          title: 'Dados inválidos',
          status: 400,
          codigo: 'DADOS_INVALIDOS',
          erros: [
            { campo: 'email', mensagem: 'Informe um e-mail válido.' },
            { campo: 'senha', mensagem: 'A senha é obrigatória.' },
          ],
        }),
      ),
      erroSessao: null,
    });
    render(<TelaLogin />);

    fireEvent.change(screen.getByLabelText('E-mail'), {
      target: { value: 'teste@campo.com' },
    });
    fireEvent.change(screen.getByLabelText('Senha'), {
      target: { value: 'senha' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('Informe um e-mail válido.')).toBeVisible();
    expect(screen.getByText('A senha é obrigatória.')).toBeVisible();
    expect(screen.getByLabelText('E-mail')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(screen.getByLabelText('Senha')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });
});

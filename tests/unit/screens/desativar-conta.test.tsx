import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TelaDesativarConta } from '@/screens/conta/desativar-conta';

const replace = vi.fn();
const desativarConta = vi.fn().mockResolvedValue({
  contaInativada: true,
  sessoesRevogadas: true,
  eliminacaoPrevistaEm: '2030-04-01T12:00:00.000Z',
  prazoDias: 90,
});

vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }));
vi.mock('@/hooks/use-sessao', () => ({
  useSessao: () => ({ desativarConta }),
}));

describe('TelaDesativarConta', () => {
  it('explica os efeitos e exige confirmação antes de desativar', async () => {
    render(<TelaDesativarConta />);

    expect(
      screen.getByText(/todas as sessões serão encerradas/i),
    ).toBeVisible();
    expect(screen.getByText(/90 dias/i)).toBeVisible();
    expect(screen.getByText(/Usuário não encontrado/i)).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Desativar minha conta' }),
    ).toBeDisabled();

    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(
      screen.getByRole('button', { name: 'Desativar minha conta' }),
    );
    expect(desativarConta).not.toHaveBeenCalled();
    fireEvent.click(
      screen.getByRole('button', { name: 'Confirmar desativação' }),
    );

    await waitFor(() => expect(desativarConta).toHaveBeenCalledTimes(1));
    expect(replace).toHaveBeenCalledWith(
      '/conta-desativada?eliminacaoPrevistaEm=2030-04-01T12%3A00%3A00.000Z&prazoDias=90',
    );
  });
});

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { EntradaSumulaSemPartida } from '@/screens/organizador/entrada-sumula-sem-partida';

vi.mock('@/screens/organizador/sumula', () => ({
  TelaSumula: ({ campeonatoId }: { campeonatoId: string }) => (
    <p>{`Seletor protótipo ${campeonatoId}`}</p>
  ),
}));

describe('entrada da Súmula sem partida selecionada', () => {
  it('orienta a seleção de uma partida no integrado sem montar a tela de mocks', () => {
    render(<EntradaSumulaSemPartida modo="integrado" campeonatoId="camp-1" />);

    expect(
      screen.getByRole('heading', { name: 'Selecione uma partida' }),
    ).toBeVisible();
    expect(screen.queryByText(/Seletor protótipo/)).not.toBeInTheDocument();
  });

  it('preserva o seletor demonstrativo no protótipo', () => {
    render(<EntradaSumulaSemPartida modo="prototipo" campeonatoId="camp-1" />);

    expect(screen.getByText('Seletor protótipo camp-1')).toBeVisible();
  });
});

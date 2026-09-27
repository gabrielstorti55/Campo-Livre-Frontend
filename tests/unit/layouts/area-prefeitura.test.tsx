import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { LayoutPrefeitura } from '@/layouts/areas-personas';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => '/prefeitura/painel',
}));
vi.mock('@/hooks/use-sessao', () => ({
  useSessao: () => ({
    session: { account: { name: 'Responsável municipal' } },
    signOut: vi.fn(),
  }),
}));

describe('LayoutPrefeitura', () => {
  it('não oferece jornadas de reservas retiradas do MVP', () => {
    render(
      <LayoutPrefeitura>
        <p>Painel</p>
      </LayoutPrefeitura>,
    );

    const menu = screen.queryByRole('button', { name: /menu/i });
    if (menu) fireEvent.click(menu);

    const cadastrarCampo = screen.getAllByRole('link', {
      name: 'Cadastrar campo',
    });
    expect(cadastrarCampo.length).toBeGreaterThan(0);
    expect(cadastrarCampo[0]).toHaveAttribute(
      'href',
      '/prefeitura/campos/novo',
    );
    const organizadores = screen.getAllByRole('link', {
      name: 'Organizadores',
    });
    expect(organizadores.length).toBeGreaterThan(0);
    expect(organizadores[0]).toHaveAttribute(
      'href',
      '/prefeitura/organizadores',
    );
    expect(
      screen
        .getAllByRole('link', { name: 'Campos' })
        .some((link) => link.getAttribute('href') === '/prefeitura/campos'),
    ).toBe(true);
    expect(screen.queryByText('Calendário')).toBeNull();
    expect(screen.queryByText('Aprovações')).toBeNull();
  });
});

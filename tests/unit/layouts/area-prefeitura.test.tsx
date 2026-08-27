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

    expect(screen.getAllByText('Campos').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Organizadores').length).toBeGreaterThan(0);
    expect(screen.queryByText('Calendário')).toBeNull();
    expect(screen.queryByText('Aprovações')).toBeNull();
  });
});

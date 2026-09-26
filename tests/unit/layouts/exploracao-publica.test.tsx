import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { LayoutExploracao } from '@/layouts/exploracao-publica';

vi.mock('next/navigation', () => ({
  usePathname: () => '/campos',
  useRouter: () => ({ replace: vi.fn() }),
}));
let sessao: { activeContext: 'organizador'; account: { name: string } } | null =
  null;
const switchContext = vi.fn();
vi.mock('@/hooks/use-sessao', () => ({
  useSessao: () => ({
    session: sessao,
    signOut: vi.fn(),
    switchContext,
  }),
}));

describe('LayoutExploracao', () => {
  it('oferece a consulta pública de campos sem oferecer reservas', () => {
    sessao = null;
    render(
      <LayoutExploracao>
        <p>Conteúdo</p>
      </LayoutExploracao>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu público' }));
    expect(screen.getByRole('link', { name: 'Campos' })).toBeVisible();
    expect(screen.queryByRole('link', { name: /reservas/i })).toBeNull();
  });

  it('mantém o shell do contexto escolhido ao consultar conteúdo público sem trocar o contexto', () => {
    sessao = {
      activeContext: 'organizador',
      account: { name: 'Lucas Ferreira' },
    };

    render(
      <LayoutExploracao>
        <p>Conteúdo público autenticado</p>
      </LayoutExploracao>,
    );

    expect(screen.getByText('Conteúdo público autenticado')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }));
    const menu = screen.getByRole('dialog', { name: 'Menu principal' });
    expect(
      within(menu).getByRole('link', { name: 'Meus Campeonatos' }),
    ).toHaveAttribute('href', '/organizador/campeonatos');
    expect(within(menu).getAllByRole('link', { name: 'Início' })).toHaveLength(1);
    expect(within(menu).getByRole('heading', { name: 'Explorar' })).toBeVisible();
    expect(switchContext).not.toHaveBeenCalled();
  });
});

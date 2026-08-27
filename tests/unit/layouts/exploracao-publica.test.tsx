import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { LayoutExploracao } from '@/layouts/exploracao-publica';

vi.mock('next/navigation', () => ({ usePathname: () => '/campos' }));
vi.mock('@/hooks/use-sessao', () => ({
  useSessao: () => ({ session: null }),
}));

describe('LayoutExploracao', () => {
  it('oferece a consulta pública de campos sem oferecer reservas', () => {
    render(
      <LayoutExploracao>
        <p>Conteúdo</p>
      </LayoutExploracao>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu público' }));
    expect(screen.getByRole('link', { name: 'Campos' })).toBeVisible();
    expect(screen.queryByRole('link', { name: /reservas/i })).toBeNull();
  });
});

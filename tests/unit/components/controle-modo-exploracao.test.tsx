import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ControleModoExploracao } from '@/components/prototipo/controle-modo-exploracao';

let pathname = '/campos';
vi.mock('next/navigation', () => ({ usePathname: () => pathname }));

describe('ControleModoExploracao', () => {
  beforeEach(() => {
    pathname = '/campos';
  });

  it('libera campos e times integrados', () => {
    const { rerender } = render(
      <ControleModoExploracao modo="integrado">
        <p>Consulta pública</p>
      </ControleModoExploracao>,
    );
    expect(screen.getByText('Consulta pública')).toBeVisible();

    pathname = '/times/time-1';
    rerender(
      <ControleModoExploracao modo="integrado">
        <p>Detalhe público</p>
      </ControleModoExploracao>,
    );
    expect(screen.getByText('Detalhe público')).toBeVisible();
  });

  it('mantém campeonato e partidas simulados bloqueados', () => {
    pathname = '/campeonatos';
    render(
      <ControleModoExploracao modo="integrado">
        <p>Catálogo simulado</p>
      </ControleModoExploracao>,
    );
    expect(
      screen.getByRole('heading', {
        name: 'Funcionalidade ainda não integrada',
      }),
    ).toBeVisible();
    expect(screen.queryByText('Catálogo simulado')).toBeNull();
  });
});

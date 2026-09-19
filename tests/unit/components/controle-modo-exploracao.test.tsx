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

  it('libera os catálogos migrados e mantém subrota sem contrato bloqueada', () => {
    pathname = '/campeonatos';
    const { rerender } = render(
      <ControleModoExploracao modo="integrado">
        <p>Catálogo integrado</p>
      </ControleModoExploracao>,
    );
    expect(screen.getByText('Catálogo integrado')).toBeVisible();

    pathname = '/partidas/partida-1';
    rerender(
      <ControleModoExploracao modo="integrado">
        <p>Partida integrada</p>
      </ControleModoExploracao>,
    );
    expect(screen.getByText('Partida integrada')).toBeVisible();

    pathname = '/campeonatos/camp-1/estrutura';
    rerender(
      <ControleModoExploracao modo="integrado">
        <p>Estrutura sem contrato</p>
      </ControleModoExploracao>,
    );
    expect(
      screen.getByRole('heading', {
        name: 'Funcionalidade ainda não integrada',
      }),
    ).toBeVisible();
    expect(screen.queryByText('Estrutura sem contrato')).toBeNull();
  });
});

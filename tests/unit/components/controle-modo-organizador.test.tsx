import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ControleModoOrganizador } from '@/components/prototipo/controle-modo-organizador';

let pathname = '/organizador/inicio';
vi.mock('next/navigation', () => ({ usePathname: () => pathname }));

describe('ControleModoOrganizador', () => {
  beforeEach(() => {
    pathname = '/organizador/inicio';
  });

  it('libera jornadas ligadas às portas HTTP no modo integrado', () => {
    const { rerender } = render(
      <ControleModoOrganizador modo="integrado">
        <p>Workspace integrado</p>
      </ControleModoOrganizador>,
    );
    expect(screen.getByText('Workspace integrado')).toBeVisible();

    pathname = '/organizador/campeonato/camp-1/partidas';
    rerender(
      <ControleModoOrganizador modo="integrado">
        <p>Partidas integradas</p>
      </ControleModoOrganizador>,
    );
    expect(screen.getByText('Partidas integradas')).toBeVisible();
  });

  it.each(['reservas', 'sumula'])(
    'mantém %s bloqueada no modo integrado por ainda usar estado local',
    (segmento) => {
      pathname = `/organizador/campeonato/camp-1/${segmento}`;
      render(
        <ControleModoOrganizador modo="integrado">
          <p>Operação simulada</p>
        </ControleModoOrganizador>,
      );

      expect(screen.queryByText('Operação simulada')).not.toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          name: 'Funcionalidade ainda não integrada',
        }),
      ).toBeVisible();
    },
  );

  it('libera todas as rotas no protótipo explícito', () => {
    pathname = '/organizador/campeonato/camp-1/sumula';
    render(
      <ControleModoOrganizador modo="prototipo">
        <p>Súmula simulada</p>
      </ControleModoOrganizador>,
    );
    expect(screen.getByText('Súmula simulada')).toBeVisible();
  });
});

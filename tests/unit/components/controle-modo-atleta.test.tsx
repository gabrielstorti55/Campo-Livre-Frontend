import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ControleModoAtleta } from '@/components/prototipo/controle-modo-atleta';

let pathname = '/atleta/inicio';
vi.mock('next/navigation', () => ({
  usePathname: () => pathname,
}));

describe('ControleModoAtleta', () => {
  beforeEach(() => {
    pathname = '/atleta/inicio';
  });

  it('libera a consulta integrada de convites', () => {
    pathname = '/atleta/time/buscar';

    render(
      <ControleModoAtleta modo="integrado">
        <p>Consulta de convites</p>
      </ControleModoAtleta>,
    );

    expect(screen.getByText('Consulta de convites')).toBeVisible();
    expect(
      screen.queryByRole('heading', {
        name: 'Funcionalidade ainda não integrada',
      }),
    ).toBeNull();
  });

  it('libera a atualização integrada por id sem liberar a criação simulada', () => {
    pathname = '/atleta/time/2';
    const { rerender } = render(
      <ControleModoAtleta modo="integrado">
        <p>Dados públicos do time</p>
      </ControleModoAtleta>,
    );
    expect(screen.getByText('Dados públicos do time')).toBeVisible();

    pathname = '/atleta/time/criar';
    rerender(
      <ControleModoAtleta modo="integrado">
        <p>Criação simulada</p>
      </ControleModoAtleta>,
    );
    expect(
      screen.getByRole('heading', {
        name: 'Funcionalidade ainda não integrada',
      }),
    ).toBeVisible();
  });

  it('mantém as demais rotas simuladas bloqueadas no modo integrado', () => {
    pathname = '/atleta/rota-simulada';
    render(
      <ControleModoAtleta modo="integrado">
        <p>Área simulada</p>
      </ControleModoAtleta>,
    );

    expect(
      screen.getByRole('heading', {
        name: 'Funcionalidade ainda não integrada',
      }),
    ).toBeVisible();
    expect(screen.queryByText('Área simulada')).toBeNull();
  });
});

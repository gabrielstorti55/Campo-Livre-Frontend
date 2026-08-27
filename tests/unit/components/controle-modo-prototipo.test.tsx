import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ControleModoPrototipo } from '@/components/prototipo/controle-modo-prototipo';

describe('ControleModoPrototipo', () => {
  it('impede que dados simulados sejam renderizados no modo integrado', () => {
    render(
      <ControleModoPrototipo modo="integrado">
        <p>Dado simulado</p>
      </ControleModoPrototipo>,
    );

    expect(screen.queryByText('Dado simulado')).toBeNull();
    expect(
      screen.getByRole('heading', {
        name: 'Funcionalidade ainda não integrada',
      }),
    ).toBeVisible();
  });

  it('libera a experiência simulada somente no modo protótipo explícito', () => {
    render(
      <ControleModoPrototipo modo="prototipo">
        <p>Dado simulado</p>
      </ControleModoPrototipo>,
    );

    expect(screen.getByText('Dado simulado')).toBeVisible();
  });
});

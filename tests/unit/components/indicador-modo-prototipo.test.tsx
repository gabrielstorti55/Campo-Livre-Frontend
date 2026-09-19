import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { IndicadorModoPrototipo } from '@/components/layout/indicador-modo-prototipo';

describe('IndicadorModoPrototipo', () => {
  it('não aparece no modo integrado', () => {
    render(<IndicadorModoPrototipo modo="integrado" />);

    expect(screen.queryByText(/modo de demonstração/i)).not.toBeInTheDocument();
  });

  it('identifica dados simulados e não persistidos no modo protótipo', () => {
    render(<IndicadorModoPrototipo modo="prototipo" />);

    expect(screen.getByRole('status')).toHaveTextContent(
      'Modo de demonstração',
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      'Dados simulados e não persistidos',
    );
    expect(screen.getByRole('status')).toHaveClass('pointer-events-none');
  });
});

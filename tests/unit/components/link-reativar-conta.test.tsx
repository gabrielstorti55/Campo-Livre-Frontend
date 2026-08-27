import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

import { LinkReativarConta } from '@/components/autenticacao/link-reativar-conta';

it('torna a reativação de conta encontrável a partir do acesso', () => {
  render(<LinkReativarConta />);

  expect(
    screen.getByRole('link', { name: 'Reativar minha conta' }),
  ).toHaveAttribute('href', '/reativar-conta');
});

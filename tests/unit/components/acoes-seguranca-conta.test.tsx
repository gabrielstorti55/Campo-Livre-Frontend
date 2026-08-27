import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

import { AcoesSegurancaConta } from '@/components/autenticacao/acoes-seguranca-conta';

it('expõe as jornadas autenticadas restantes na conta pessoal', () => {
  render(<AcoesSegurancaConta />);

  expect(screen.getByRole('link', { name: 'Alterar e-mail' })).toHaveAttribute(
    'href',
    '/minha-conta/alterar-email',
  );
  expect(screen.getByRole('link', { name: 'Alterar senha' })).toHaveAttribute(
    'href',
    '/minha-conta/seguranca',
  );
});

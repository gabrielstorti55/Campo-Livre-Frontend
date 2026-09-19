import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ControleModoPrefeitura } from '@/components/prototipo/controle-modo-prefeitura';

let pathname = '/prefeitura/painel';
vi.mock('next/navigation', () => ({ usePathname: () => pathname }));

describe('ControleModoPrefeitura', () => {
  beforeEach(() => {
    pathname = '/prefeitura/painel';
  });

  it('libera somente o painel e o cadastro de Campo no modo integrado', () => {
    const { rerender } = render(
      <ControleModoPrefeitura modo="integrado">
        <p>Painel institucional</p>
      </ControleModoPrefeitura>,
    );
    expect(screen.getByText('Painel institucional')).toBeVisible();

    pathname = '/prefeitura/campos/novo';
    rerender(
      <ControleModoPrefeitura modo="integrado">
        <p>Cadastro persistido</p>
      </ControleModoPrefeitura>,
    );
    expect(screen.getByText('Cadastro persistido')).toBeVisible();

    pathname = '/prefeitura/organizadores';
    rerender(
      <ControleModoPrefeitura modo="integrado">
        <p>Funcionários persistidos</p>
      </ControleModoPrefeitura>,
    );
    expect(screen.getByText('Funcionários persistidos')).toBeVisible();

    pathname = '/prefeitura/calendario';
    rerender(
      <ControleModoPrefeitura modo="integrado">
        <p>Calendário simulado</p>
      </ControleModoPrefeitura>,
    );
    expect(screen.queryByText('Calendário simulado')).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: 'Funcionalidade ainda não integrada',
      }),
    ).toBeVisible();
  });

  it('preserva as rotas demonstrativas no protótipo explícito', () => {
    pathname = '/prefeitura/calendario';
    render(
      <ControleModoPrefeitura modo="prototipo">
        <p>Calendário simulado</p>
      </ControleModoPrefeitura>,
    );
    expect(screen.getByText('Calendário simulado')).toBeVisible();
  });
});

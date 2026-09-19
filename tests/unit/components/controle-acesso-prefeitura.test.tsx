import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ControleAcessoPrefeitura } from '@/components/layout/controle-acesso-prefeitura';

const sessao = {
  session: {
    prototipo: false,
    links: { institutionalOrganizationIds: [] as string[] },
  },
};

vi.mock('@/hooks/use-sessao', () => ({ useSessao: () => sessao }));
vi.mock('@/components/autenticacao/guarda-sessao', () => ({
  GuardaSessao: ({
    autorizado,
    children,
  }: {
    autorizado?: boolean;
    children: React.ReactNode;
  }) => (autorizado ? children : <p>Acesso negado</p>),
}));

describe('ControleAcessoPrefeitura', () => {
  beforeEach(() => {
    sessao.session.prototipo = false;
    sessao.session.links.institutionalOrganizationIds = [];
  });

  it('permite que a sessão real consulte seus vínculos no backend', () => {
    render(
      <ControleAcessoPrefeitura>
        <p>Painel real</p>
      </ControleAcessoPrefeitura>,
    );
    expect(screen.getByText('Painel real')).toBeVisible();
  });

  it('preserva a restrição institucional no protótipo', () => {
    sessao.session.prototipo = true;
    render(
      <ControleAcessoPrefeitura>
        <p>Painel simulado</p>
      </ControleAcessoPrefeitura>,
    );
    expect(screen.queryByText('Painel simulado')).not.toBeInTheDocument();
    expect(screen.getByText('Acesso negado')).toBeVisible();
  });
});

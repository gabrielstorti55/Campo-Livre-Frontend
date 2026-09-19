import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ControleAcessoAdministracao } from '@/components/layout/controle-acesso-administracao';

const sessao = {
  session: null as null | { minhaConta: { administrador: boolean } },
};

vi.mock('@/hooks/use-sessao', () => ({ useSessao: () => sessao }));
vi.mock('@/components/autenticacao/guarda-sessao', () => ({
  GuardaSessao: ({
    autorizado,
    destinoSemPermissao,
    children,
  }: {
    autorizado?: boolean;
    destinoSemPermissao?: string;
    children: React.ReactNode;
  }) =>
    autorizado ? children : <p>Acesso negado para {destinoSemPermissao}</p>,
}));

describe('ControleAcessoAdministracao', () => {
  beforeEach(() => {
    sessao.session = null;
  });

  it('permite somente conta com autoridade administrativa global', () => {
    sessao.session = { minhaConta: { administrador: true } };
    render(
      <ControleAcessoAdministracao>
        <p>Área administrativa</p>
      </ControleAcessoAdministracao>,
    );

    expect(screen.getByText('Área administrativa')).toBeVisible();
  });

  it('nega deep link a uma conta comum', () => {
    sessao.session = { minhaConta: { administrador: false } };
    render(
      <ControleAcessoAdministracao>
        <p>Área administrativa</p>
      </ControleAcessoAdministracao>,
    );

    expect(screen.queryByText('Área administrativa')).not.toBeInTheDocument();
    expect(screen.getByText('Acesso negado para /minha-area')).toBeVisible();
  });
});

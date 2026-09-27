import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import LayoutOrganizadorRota from '@/app/organizador/layout';
import LayoutPrefeituraRota from '@/app/prefeitura/layout';

const navegacao = vi.hoisted(() => ({
  pathname: '/organizador/campeonato/campeonato-1/reservas',
}));

vi.mock('next/navigation', () => ({
  usePathname: () => navegacao.pathname,
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock('@/config/modo-aplicacao', () => ({
  obterModoAplicacao: () => 'hibrido',
}));

vi.mock('@/components/layout/controle-acesso-organizador', () => ({
  ControleAcessoOrganizador: ({ children }: { children: ReactNode }) =>
    children,
}));

vi.mock('@/components/layout/controle-acesso-prefeitura', () => ({
  ControleAcessoPrefeitura: ({ children }: { children: ReactNode }) => children,
}));

vi.mock('@/hooks/use-sessao', () => ({
  useSessao: () => ({
    session: {
      account: { name: 'Conta de teste' },
      prototipo: false,
      links: { institutionalOrganizationIds: [] },
    },
    signOut: vi.fn(),
  }),
}));

describe('paridade visual dos shells entre protótipo e integrado', () => {
  beforeEach(() => {
    navegacao.pathname = '/organizador/campeonato/campeonato-1/reservas';
  });

  it('mantém o visual do protótipo e a navegação do organizador no modo híbrido', () => {
    render(
      <LayoutOrganizadorRota>
        <p>Reservas demonstrativas</p>
      </LayoutOrganizadorRota>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }));
    expect(
      screen.getAllByRole('link', { name: 'Meus Campeonatos' }).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText('Reservas demonstrativas')).toBeVisible();
    expect(
      screen.queryByRole('heading', {
        name: 'Funcionalidade ainda não integrada',
      }),
    ).toBeNull();
  });

  it('mantém o visual do protótipo e a navegação municipal no modo híbrido', () => {
    navegacao.pathname = '/prefeitura/calendario';

    render(
      <LayoutPrefeituraRota>
        <p>Calendário demonstrativo</p>
      </LayoutPrefeituraRota>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }));
    expect(
      screen.getAllByRole('link', { name: 'Início' }).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText('Calendário demonstrativo')).toBeVisible();
    expect(
      screen.queryByRole('heading', {
        name: 'Funcionalidade ainda não integrada',
      }),
    ).toBeNull();
  });
});

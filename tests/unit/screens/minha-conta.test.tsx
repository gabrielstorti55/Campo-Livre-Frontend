import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { expect, it, vi } from 'vitest';

import type { MinhaConta } from '@/types/api/autenticacao';

const { useSessaoMock } = vi.hoisted(() => ({ useSessaoMock: vi.fn() }));

vi.mock('@/hooks/use-sessao', () => ({
  useSessao: () => useSessaoMock(),
}));
vi.mock('@/components/autenticacao/guarda-sessao', () => ({
  GuardaSessao: ({ children }: { children: ReactNode }) => children,
}));
vi.mock('@/components/autenticacao/acoes-seguranca-conta', () => ({
  AcoesSegurancaConta: () => null,
}));

import { TelaMinhaConta } from '@/screens/conta/minha-conta';

it('apresenta campos privados nullable sem quebrar a tela', () => {
  const minhaConta: MinhaConta = {
    id: 'conta-1',
    nome: 'Pessoa Teste',
    nomeUsuario: 'pessoa.teste',
    email: 'pessoa@campolivre.test',
    emailPendente: null,
    emailConfirmado: true,
    telefone: null,
    cpf: null,
    rg: { numero: null, orgaoExpedidor: null, uf: null },
    dataNascimento: null,
    idade: null,
    municipio: null,
    fotoUrl: null,
    biografia: null,
    posicaoPrincipal: null,
    status: 'ATIVA',
    organizadorHabilitado: false,
    administrador: false,
    criadoEm: '2026-01-01T00:00:00.000Z',
    atualizadoEm: '2026-01-01T00:00:00.000Z',
  };
  useSessaoMock.mockReturnValue({
    session: {
      minhaConta,
    },
  });

  render(<TelaMinhaConta />);

  expect(screen.getByRole('heading', { name: 'Minha conta' })).toBeVisible();
  expect(screen.getAllByText('Não informado')).toHaveLength(3);
});

import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TelaCampeonatosOrganizador } from '@/screens/organizador/campeonatos';

const listarCampeonatosAdministrados = vi.fn().mockResolvedValue({
  itens: [
    {
      campeonatoId: 'camp-uuid',
      nome: 'Copa Recuperável',
      status: 'EM_INSCRICOES',
      contexto: 'PESSOAL',
      prefeitura: null,
      vinculo: { funcao: 'RESPONSAVEL', status: 'ATIVO' },
      permissoes: ['EDITAR'],
      atualizadoEm: '2026-08-28T20:00:00.000Z',
    },
  ],
  pagina: 1,
  tamanho: 20,
  totalItens: 1,
  totalPaginas: 1,
});
const sessao = vi.hoisted(() => ({ accountId: 'conta-1' }));

vi.mock('@/hooks/use-sessao', () => ({
  useSessao: () => ({
    hydrated: true,
    session: {
      sessionId: sessao.accountId,
      account: { id: sessao.accountId },
    },
    executarAutenticado: (acao: (token: string) => unknown) => acao('token'),
  }),
}));
vi.mock('@/contexts/campeonatos-api', () => ({
  useCampeonatosApi: () => ({ listarCampeonatosAdministrados }),
}));

describe('Campeonatos administrados', () => {
  beforeEach(() => {
    sessao.accountId = 'conta-1';
    listarCampeonatosAdministrados.mockClear();
  });

  it('recupera os vínculos ativos pela projeção autenticada', async () => {
    render(<TelaCampeonatosOrganizador />);

    expect(screen.getByRole('status')).toHaveTextContent('Carregando');
    expect(await screen.findByText('Copa Recuperável')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Administrar' })).toHaveAttribute(
      'href',
      '/organizador/campeonato/camp-uuid',
    );
    expect(listarCampeonatosAdministrados).toHaveBeenCalledWith('token', 1, 20);
  });

  it('limpa a projeção e recarrega quando a identidade autenticada muda', async () => {
    const { rerender } = render(<TelaCampeonatosOrganizador />);
    expect(await screen.findByText('Copa Recuperável')).toBeVisible();

    listarCampeonatosAdministrados.mockImplementation(
      () => new Promise(() => undefined),
    );
    sessao.accountId = 'conta-2';
    rerender(<TelaCampeonatosOrganizador key={sessao.accountId} />);

    await waitFor(() =>
      expect(screen.queryByText('Copa Recuperável')).not.toBeInTheDocument(),
    );
    expect(screen.getByRole('status')).toHaveTextContent('Carregando');
    expect(listarCampeonatosAdministrados.mock.calls.length).toBeGreaterThan(1);
  });
});

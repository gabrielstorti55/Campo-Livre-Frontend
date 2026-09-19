import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ErroApi } from '@/services/api/problem-details';
import { TelaAdministradores } from '@/screens/administracao/administradores';
import { TelaContasAdministracao } from '@/screens/administracao/contas';

const listarAdministradores = vi.fn();
const buscarUsuarioPorEmail = vi.fn();
const bloquearUsuario = vi.fn();
const desbloquearUsuario = vi.fn();
const concederAdministrador = vi.fn();
const revogarAdministrador = vi.fn();
const recarregarMinhaConta = vi.fn();
const replace = vi.fn();
const api = {
  listarAdministradores,
  buscarUsuarioPorEmail,
  bloquearUsuario,
  desbloquearUsuario,
  concederAdministrador,
  revogarAdministrador,
};
const executarAutenticado = <T,>(operacao: (token: string) => Promise<T>) =>
  operacao('access-token');
const sessao = {
  session: {
    account: { id: 'usuario-admin' },
    minhaConta: { administrador: true },
  },
  executarAutenticado,
  recarregarMinhaConta,
};

vi.mock('@/contexts/administracao-global-api', () => ({
  useAdministracaoGlobalApi: () => api,
}));
vi.mock('@/hooks/use-sessao', () => ({ useSessao: () => sessao }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }));

const pagina = {
  itens: [
    {
      usuarioId: 'usuario-admin',
      nome: 'Administrador Atual',
      email: 'atual@example.test',
      status: 'ATIVA',
      concedidoEm: '2026-01-01T00:00:00.000Z',
      concedidoPorUsuarioId: null,
    },
    {
      usuarioId: 'usuario-2',
      nome: 'Gestora Bloqueada',
      email: 'gestora@example.test',
      status: 'BLOQUEADA',
      concedidoEm: '2026-02-01T00:00:00.000Z',
      concedidoPorUsuarioId: 'usuario-admin',
    },
  ],
  pagina: 1,
  tamanho: 20,
  totalItens: 2,
  totalPaginas: 2,
};

describe('Administração Global integrada', () => {
  beforeEach(() => {
    listarAdministradores.mockReset().mockResolvedValue(pagina);
    buscarUsuarioPorEmail.mockReset().mockResolvedValue({
      itens: [
        {
          usuarioId: 'usuario-3',
          nome: 'Nova Gestora',
          nomeUsuario: 'nova.gestora',
        },
      ],
      pagina: 1,
      tamanho: 1,
      totalItens: 1,
      totalPaginas: 1,
    });
    bloquearUsuario.mockReset().mockResolvedValue({ status: 'BLOQUEADA' });
    desbloquearUsuario.mockReset().mockResolvedValue({
      status: 'ATIVA',
      novoLoginNecessario: true,
    });
    concederAdministrador
      .mockReset()
      .mockResolvedValue({ administrador: true });
    revogarAdministrador
      .mockReset()
      .mockResolvedValue({ administrador: false });
    recarregarMinhaConta.mockReset().mockResolvedValue({ administrador: true });
    replace.mockReset();
  });

  it('lista, filtra e pagina administradores recuperados do backend', async () => {
    render(<TelaAdministradores />);

    expect(await screen.findByText('Administrador Atual')).toBeVisible();
    expect(screen.getByText('Gestora Bloqueada')).toBeVisible();
    expect(screen.getByText('Bloqueada')).toBeVisible();

    fireEvent.change(screen.getByLabelText('Nome do administrador'), {
      target: { value: 'Maria' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar filtros' }));
    await waitFor(() =>
      expect(listarAdministradores).toHaveBeenLastCalledWith('access-token', {
        pagina: 1,
        tamanho: 20,
        nome: 'Maria',
        email: undefined,
      }),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Próxima página' }));
    await waitFor(() =>
      expect(listarAdministradores).toHaveBeenLastCalledWith(
        'access-token',
        expect.objectContaining({ pagina: 2 }),
      ),
    );
  });

  it('busca uma conta e concede autoridade somente após confirmação', async () => {
    render(<TelaAdministradores />);
    await screen.findByText('Administrador Atual');

    fireEvent.change(screen.getByLabelText('E-mail da conta elegível'), {
      target: { value: 'nova@example.test' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar conta' }));
    expect(await screen.findByText('Nova Gestora')).toBeVisible();

    fireEvent.click(
      screen.getByRole('button', { name: 'Conceder administração' }),
    );
    expect(concederAdministrador).not.toHaveBeenCalled();
    fireEvent.click(
      screen.getByRole('button', { name: 'Confirmar concessão' }),
    );

    await waitFor(() =>
      expect(concederAdministrador).toHaveBeenCalledWith(
        'usuario-3',
        'access-token',
      ),
    );
    expect(
      await screen.findByText('Autoridade administrativa concedida.'),
    ).toBeVisible();
  });

  it('desbloqueia administrador recuperável e informa a necessidade de novo login', async () => {
    render(<TelaAdministradores />);
    await screen.findByText('Gestora Bloqueada');

    fireEvent.click(
      screen.getByRole('button', { name: 'Desbloquear Gestora Bloqueada' }),
    );
    fireEvent.change(screen.getByLabelText('Justificativa do desbloqueio'), {
      target: { value: 'Revisão concluída' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Confirmar desbloqueio' }),
    );

    await waitFor(() =>
      expect(desbloquearUsuario).toHaveBeenCalledWith(
        'usuario-2',
        'Revisão concluída',
        'access-token',
      ),
    );
    expect(
      await screen.findByText(/novo login será necessário/i),
    ).toBeVisible();
  });

  it('busca conta ativa e bloqueia somente após categoria, motivo e confirmação', async () => {
    render(<TelaContasAdministracao />);

    fireEvent.change(screen.getByLabelText('E-mail exato da conta'), {
      target: { value: 'nova@example.test' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar conta' }));
    expect(await screen.findByText('Nova Gestora')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Bloquear conta' }));
    fireEvent.change(screen.getByLabelText('Categoria do bloqueio'), {
      target: { value: 'SEGURANCA' },
    });
    fireEvent.change(screen.getByLabelText('Motivo do bloqueio'), {
      target: { value: 'Atividade suspeita confirmada' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar bloqueio' }));

    await waitFor(() =>
      expect(bloquearUsuario).toHaveBeenCalledWith(
        'usuario-3',
        { categoria: 'SEGURANCA', motivo: 'Atividade suspeita confirmada' },
        'access-token',
      ),
    );
    expect(
      await screen.findByText('Conta bloqueada e sessões revogadas.'),
    ).toBeVisible();
  });

  it('fecha a área e reavalia a conta quando o backend revoga a autoridade', async () => {
    listarAdministradores.mockRejectedValueOnce(
      new ErroApi({
        type: 'about:blank',
        title: 'Negado',
        status: 403,
        codigo: 'NAO_AUTORIZADO',
      }),
    );
    recarregarMinhaConta.mockResolvedValueOnce({ administrador: false });

    render(<TelaAdministradores />);

    await waitFor(() => expect(recarregarMinhaConta).toHaveBeenCalled());
    expect(replace).toHaveBeenCalledWith('/minha-area');
    expect(screen.queryByText('Administrador Atual')).not.toBeInTheDocument();
  });
});

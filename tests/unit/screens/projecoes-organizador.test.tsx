import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TelaInicioOrganizador } from '@/screens/organizador/inicio';
import { TelaPerfilOrganizador } from '@/screens/organizador/perfil';

const listarCampeonatosAdministrados = vi.fn().mockResolvedValue({
  itens: [
    {
      campeonatoId: 'camp-1',
      nome: 'Copa da Conta',
      status: 'EM_ANDAMENTO',
      contexto: 'PESSOAL',
      prefeitura: null,
      vinculo: { funcao: 'ORGANIZADOR', status: 'ATIVO' },
      permissoes: ['CONSULTAR'],
      atualizadoEm: '2026-08-28T20:00:00Z',
    },
  ],
  pagina: 1,
  tamanho: 20,
  totalItens: 1,
  totalPaginas: 1,
});

vi.mock('@/contexts/campeonatos-api', () => ({
  useCampeonatosApi: () => ({ listarCampeonatosAdministrados }),
}));
vi.mock('@/hooks/use-sessao', () => ({
  useSessao: () => ({
    hydrated: true,
    session: { account: { name: 'Gabriel' } },
    executarAutenticado: (acao: (token: string) => unknown) => acao('token'),
  }),
}));

describe('projeções do organizador', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listarCampeonatosAdministrados.mockResolvedValue({
      itens: [
        {
          campeonatoId: 'camp-1',
          nome: 'Copa da Conta',
          status: 'EM_ANDAMENTO',
          contexto: 'PESSOAL',
          prefeitura: null,
          vinculo: { funcao: 'ORGANIZADOR', status: 'ATIVO' },
          permissoes: ['CONSULTAR'],
          atualizadoEm: '2026-08-28T20:00:00Z',
        },
      ],
      pagina: 1,
      tamanho: 20,
      totalItens: 1,
      totalPaginas: 1,
    });
  });

  it.each([
    ['início', <TelaInicioOrganizador />],
    ['perfil', <TelaPerfilOrganizador />],
  ])('recupera Campeonatos administrados no %s', async (_, tela) => {
    render(tela);
    expect(await screen.findByText('Copa da Conta')).toBeVisible();
    expect(listarCampeonatosAdministrados).toHaveBeenCalledWith('token', 1, 20);
  });

  it('recupera todas as páginas de Campeonatos administrados', async () => {
    listarCampeonatosAdministrados
      .mockResolvedValueOnce({
        itens: [
          {
            campeonatoId: 'camp-1',
            nome: 'Copa da Conta',
            status: 'EM_ANDAMENTO',
            contexto: 'PESSOAL',
            prefeitura: null,
            vinculo: { funcao: 'ORGANIZADOR', status: 'ATIVO' },
            permissoes: ['CONSULTAR'],
            atualizadoEm: '2026-08-28T20:00:00Z',
          },
        ],
        pagina: 1,
        tamanho: 20,
        totalItens: 2,
        totalPaginas: 2,
      })
      .mockResolvedValueOnce({
        itens: [
          {
            campeonatoId: 'camp-2',
            nome: 'Copa da Segunda Página',
            status: 'EM_INSCRICOES',
            contexto: 'PESSOAL',
            prefeitura: null,
            vinculo: { funcao: 'RESPONSAVEL', status: 'ATIVO' },
            permissoes: ['CONSULTAR'],
            atualizadoEm: '2026-08-29T20:00:00Z',
          },
        ],
        pagina: 2,
        tamanho: 20,
        totalItens: 2,
        totalPaginas: 2,
      });

    render(<TelaInicioOrganizador />);

    expect(await screen.findByText('Copa da Segunda Página')).toBeVisible();
    await waitFor(() =>
      expect(listarCampeonatosAdministrados).toHaveBeenNthCalledWith(
        2,
        'token',
        2,
        20,
      ),
    );
  });
});

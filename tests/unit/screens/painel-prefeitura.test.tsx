import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TelaPainelPrefeitura } from '@/screens/prefeitura/painel';

const listarMinhasPrefeituras = vi.fn();
const executarAutenticado = <T,>(operacao: (token: string) => Promise<T>) =>
  operacao('access-token');

vi.mock('@/contexts/prefeituras-api', () => ({
  usePrefeiturasApi: () => ({ listarMinhasPrefeituras }),
}));
vi.mock('@/hooks/use-sessao', () => ({
  useSessao: () => ({
    session: { account: { id: 'conta-1', name: 'Gestora Municipal' } },
    executarAutenticado,
  }),
}));

describe('TelaPainelPrefeitura', () => {
  beforeEach(() => {
    listarMinhasPrefeituras.mockReset();
    listarMinhasPrefeituras.mockResolvedValue({
      itens: [
        {
          membroId: 'membro-1',
          papel: 'RESPONSAVEL',
          iniciadoEm: '2026-01-10T12:00:00.000Z',
          prefeitura: {
            id: 'prefeitura-1',
            nomeOficial: 'Prefeitura Municipal de Franca',
            status: 'ATIVA',
            municipio: { id: 'municipio-1', nome: 'Franca', uf: 'SP' },
            emailContatoPublico: 'esporte@example.test',
            telefoneContatoPublico: null,
          },
        },
      ],
      pagina: 1,
      tamanho: 100,
      totalItens: 1,
      totalPaginas: 1,
    });
  });

  it('renderiza os vínculos institucionais reais sem métricas simuladas', async () => {
    render(<TelaPainelPrefeitura />);

    expect(
      await screen.findByRole('heading', {
        name: 'Prefeitura Municipal de Franca',
      }),
    ).toBeVisible();
    expect(screen.getByText('Responsável institucional')).toBeVisible();
    expect(screen.getByText('Franca/SP')).toBeVisible();
    expect(listarMinhasPrefeituras).toHaveBeenCalledWith(
      'access-token',
      1,
      100,
    );
    expect(screen.queryByText('Pendentes')).not.toBeInTheDocument();
    expect(screen.queryByText('Agenda de reservas')).not.toBeInTheDocument();
  });
});

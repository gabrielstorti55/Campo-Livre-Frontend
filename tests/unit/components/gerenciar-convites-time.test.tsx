import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { GerenciarConvitesTime } from '@/components/times/gerenciar-convites-time';

const listarConvitesEnviados = vi.fn().mockResolvedValue({
  itens: [
    {
      conviteId: 'convite-1',
      destinatario: {
        usuarioId: 'usuario-1',
        nome: 'Marina Souza',
        nomeUsuario: 'marina',
        fotoUrl: null,
        emailMascarado: 'm***@example.test',
      },
      status: 'PENDENTE',
      enviadoEm: '2030-01-01T12:00:00.000Z',
      reenviadoEm: null,
      expiraEm: '2030-01-08T12:00:00.000Z',
      acoesPermitidas: ['REENVIAR', 'CANCELAR'],
    },
  ],
  pagina: 1,
  tamanho: 20,
  totalItens: 1,
  totalPaginas: 1,
});

const api = { listarConvitesEnviados };

vi.mock('@/contexts/times-api', () => ({
  useTimesApi: () => api,
}));
const executarAutenticado = <T,>(
  operacao: (token: string) => Promise<T>,
): Promise<T> => operacao('access-token');

vi.mock('@/hooks/use-sessao', () => ({
  useSessao: () => ({ executarAutenticado }),
}));

describe('GerenciarConvitesTime', () => {
  it('recupera e exibe convites pendentes após montar', async () => {
    render(<GerenciarConvitesTime timeId="time-1" />);

    expect(await screen.findByText('Marina Souza')).toBeVisible();
    expect(screen.getByText('m***@example.test')).toBeVisible();
    expect(listarConvitesEnviados).toHaveBeenCalledWith(
      'time-1',
      'access-token',
      1,
      20,
    );
  });
});

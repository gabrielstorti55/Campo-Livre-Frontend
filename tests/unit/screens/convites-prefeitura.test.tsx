import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TelaConvitesPrefeitura } from '@/screens/conta/convites-prefeitura';

const listarConvitesRecebidos = vi.fn();
const aceitarConviteRecebido = vi.fn();
const recusarConviteRecebido = vi.fn();
const recarregarMinhaConta = vi.fn();
const gestaoApi = {
  listarConvitesRecebidos,
  aceitarConviteRecebido,
  recusarConviteRecebido,
};
const executarAutenticado = <T,>(operacao: (token: string) => Promise<T>) =>
  operacao('access-token');

vi.mock('@/contexts/gestao-prefeituras-api', () => ({
  useGestaoPrefeiturasApi: () => gestaoApi,
}));
vi.mock('@/hooks/use-sessao', () => ({
  useSessao: () => ({ executarAutenticado, recarregarMinhaConta }),
}));

const paginaComConvites = {
  itens: [
    {
      conviteId: 'convite-responsavel',
      prefeitura: {
        id: 'prefeitura-1',
        nomeOficial: 'Prefeitura Municipal de Franca',
        municipio: { nome: 'Franca', uf: 'SP' },
      },
      papelDestino: 'RESPONSAVEL',
      convidadoEm: '2026-09-17T10:00:00.000Z',
      expiraEm: '2026-09-24T10:00:00.000Z',
      acoesPermitidas: ['ACEITAR', 'RECUSAR'],
    },
    {
      conviteId: 'convite-membro',
      prefeitura: {
        id: 'prefeitura-2',
        nomeOficial: 'Prefeitura Municipal de Restinga',
        municipio: { nome: 'Restinga', uf: 'SP' },
      },
      papelDestino: 'MEMBRO',
      convidadoEm: '2026-09-17T11:00:00.000Z',
      expiraEm: '2026-09-24T11:00:00.000Z',
      acoesPermitidas: ['ACEITAR', 'RECUSAR'],
    },
  ],
  pagina: 1,
  tamanho: 100,
  totalItens: 2,
  totalPaginas: 1,
};

describe('TelaConvitesPrefeitura', () => {
  beforeEach(() => {
    listarConvitesRecebidos.mockReset().mockResolvedValue(paginaComConvites);
    aceitarConviteRecebido.mockReset().mockResolvedValue({
      prefeituraId: 'prefeitura-1',
      papel: 'RESPONSAVEL',
      vinculoAtivo: true,
    });
    recusarConviteRecebido.mockReset().mockResolvedValue(undefined);
    recarregarMinhaConta.mockReset().mockResolvedValue({});
  });

  it('lista os convites recebidos e aceita somente após confirmação', async () => {
    render(<TelaConvitesPrefeitura />);

    expect(
      await screen.findByText('Prefeitura Municipal de Franca'),
    ).toBeVisible();
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Aceitar convite da Prefeitura Municipal de Franca',
      }),
    );
    expect(aceitarConviteRecebido).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar aceite' }));

    await waitFor(() => expect(aceitarConviteRecebido).toHaveBeenCalled());
    expect(aceitarConviteRecebido).toHaveBeenCalledWith(
      'convite-responsavel',
      'access-token',
    );
    expect(recarregarMinhaConta).toHaveBeenCalled();
    expect(listarConvitesRecebidos).toHaveBeenCalledTimes(2);
  });

  it('recusa sem inventar motivo e recarrega a caixa', async () => {
    render(<TelaConvitesPrefeitura />);
    await screen.findByText('Prefeitura Municipal de Restinga');

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Recusar convite da Prefeitura Municipal de Restinga',
      }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar recusa' }));

    await waitFor(() => expect(recusarConviteRecebido).toHaveBeenCalled());
    expect(recusarConviteRecebido).toHaveBeenCalledWith(
      'convite-membro',
      'access-token',
    );
    expect(listarConvitesRecebidos).toHaveBeenCalledTimes(2);
  });
});

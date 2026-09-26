import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TelaBuscarTimes } from '@/screens/atleta/buscar-times';

const listarMeusConvites = vi.fn();
const listarMeusTimes = vi.fn();
const listarTimes = vi.fn();
const listarConvitesRecebidosComoCapitao = vi.fn();
const responderConviteCampeonato = vi.fn();
const timesApi = { listarMeusConvites, listarMeusTimes, listarTimes };
const campeonatosApi = {
  listarConvitesRecebidosComoCapitao,
  responderConviteCampeonato,
};
const executarAutenticado = vi.fn(
  <T,>(request: (accessToken: string) => Promise<T>) =>
    request('access-em-memoria'),
);
const sessao = {
  executarAutenticado,
  session: {
    prototipo: true,
    account: { id: 'mock-person-unlinked-1' },
    links: { teamIds: [] },
  },
};

vi.mock('@/contexts/times-api', () => ({
  useTimesApi: () => timesApi,
}));

vi.mock('@/contexts/campeonatos-api', () => ({
  useCampeonatosApi: () => campeonatosApi,
}));

vi.mock('@/hooks/use-sessao', () => ({
  useSessao: () => sessao,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('TelaBuscarTimes integrada ao service boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listarMeusConvites.mockResolvedValue({
      itens: [],
      pagina: 1,
      tamanho: 20,
      totalItens: 0,
      totalPaginas: 0,
    });
    listarMeusTimes.mockResolvedValue({
      itens: [
        {
          membroId: 'membro-vila-nova',
          funcao: 'ATLETA',
          statusMembro: 'ATIVO',
          entrouEm: '2026-01-01T00:00:00.000Z',
          time: {
            id: '1',
            nome: 'Vila Nova FC',
            sigla: 'VNF',
            escudoUrl: null,
            status: 'ATIVO',
          },
        },
      ],
      pagina: 1,
      tamanho: 100,
      totalItens: 1,
      totalPaginas: 1,
    });
    listarTimes.mockResolvedValue({
      itens: [
        {
          id: 'time-1',
          nome: 'Leões FC',
          sigla: 'LEO',
          escudoUrl: null,
          municipio: { nome: 'Franca', uf: 'SP' },
        },
      ],
      pagina: 1,
      tamanho: 20,
      totalItens: 1,
      totalPaginas: 1,
    });
    listarConvitesRecebidosComoCapitao.mockResolvedValue({
      itens: [],
      pagina: 1,
      tamanho: 20,
      totalItens: 0,
      totalPaginas: 0,
    });
    responderConviteCampeonato.mockResolvedValue({
      conviteId: 'convite-9-1-1',
      status: 'ACEITO',
      encerradoEm: '2026-09-25T20:00:00.000Z',
    });
  });

  it('consulta os convites com a credencial mantida pela sessão', async () => {
    render(<TelaBuscarTimes />);

    expect(
      await screen.findByText('Você não possui convites pendentes.'),
    ).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Seus times' })).toBeVisible();
    expect(screen.getByRole('link', { name: /Vila Nova FC/ })).toBeVisible();
    expect(executarAutenticado).toHaveBeenCalledTimes(3);
    expect(listarMeusTimes).toHaveBeenCalledWith('access-em-memoria', 1, 100);
    expect(listarMeusConvites).toHaveBeenCalledWith('access-em-memoria', 1, 20);
    expect(listarConvitesRecebidosComoCapitao).toHaveBeenCalledWith(
      'access-em-memoria',
      1,
      20,
    );
  });

  it('permite ao capitão aceitar um convite para campeonato no protótipo', async () => {
    listarConvitesRecebidosComoCapitao.mockResolvedValue({
      itens: [
        {
          conviteId: 'convite-9-1-1',
          campeonato: { id: '9', nome: 'Copa Municipal' },
          time: { id: '1', nome: 'Vila Nova FC', sigla: 'VNF' },
          status: 'PENDENTE',
          enviadoEm: '2026-09-25T19:00:00.000Z',
          expiraEm: '2026-10-02T19:00:00.000Z',
          encerradoEm: null,
          acoesPermitidas: ['ACEITAR', 'RECUSAR'],
        },
      ],
      pagina: 1,
      tamanho: 20,
      totalItens: 1,
      totalPaginas: 1,
    });

    render(<TelaBuscarTimes />);

    expect(
      await screen.findByRole('heading', {
        name: 'Convites para campeonatos',
      }),
    ).toBeVisible();
    expect(screen.getByText('Copa Municipal')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Aceitar convite' }));

    expect(
      await screen.findByText('Participação confirmada no campeonato.'),
    ).toBeVisible();
    expect(responderConviteCampeonato).toHaveBeenCalledWith(
      'convite-9-1-1',
      'ACEITAR',
      'access-em-memoria',
    );
  });

  it('busca times ativos por nome sem usar a credencial privada', async () => {
    render(<TelaBuscarTimes />);

    fireEvent.change(screen.getByLabelText('Nome do time'), {
      target: { value: 'Leões' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar times' }));

    expect(
      await screen.findByRole('heading', { name: 'Leões FC' }),
    ).toBeVisible();
    expect(screen.getByText('LEO · Franca/SP')).toBeVisible();
    expect(listarTimes).toHaveBeenCalledWith({
      nome: 'Leões',
      pagina: 1,
      tamanho: 20,
    });
  });
});

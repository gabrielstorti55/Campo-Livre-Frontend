import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TelaGerenciarTimes } from '@/screens/organizador/gerenciar-times';

const convidarTime = vi.fn().mockResolvedValue({
  conviteId: 'convite-1',
  timeId: '3',
  status: 'PENDENTE',
  expiraEm: '2026-09-04T00:00:00.000Z',
});
const listarTimesParticipantes = vi.fn().mockResolvedValue({
  itens: [
    {
      timeId: 'time-inscrito-1',
      nome: 'Leões da Vila',
      sigla: 'LEV',
      escudoUrl: null,
      statusParticipacao: 'ATIVO',
      ordemInscricao: 1,
    },
  ],
  pagina: 1,
  tamanho: 100,
  totalItens: 1,
  totalPaginas: 1,
});
const listarConvitesEnviados = vi.fn();
const consultarElencoContextual = vi.fn();
const cancelarConviteTime = vi.fn();
const detalheAdministrativo = {
  campeonatoId: '1',
  nome: 'Copa Teste',
  status: 'EM_INSCRICOES',
  formato: 'PONTOS_CORRIDOS',
  contexto: 'PESSOAL',
  prefeituraId: null,
  municipioId: 'municipio-1',
  inicioPrevistoEm: '2026-09-01',
  fimPrevistoEm: null,
  descricao: null,
  situacaoComercial: 'AUTORIZADO',
  configuracao: {
    limiteTimes: 16,
    limiteAtletasPorTime: 20,
    quantidadeTurnos: 1,
    versao: 3,
    valida: false,
    pendencias: [],
  },
  autoridade: { funcao: 'RESPONSAVEL', permissoes: ['GERENCIAR_CONVITES'] },
  operacoesPermitidas: ['CONVIDAR_TIME'],
};
const consultarAdministracao = vi.fn().mockResolvedValue(detalheAdministrativo);
const campeonatosApiMock = {
  convidarTime,
  listarTimesParticipantes,
  listarConvitesEnviados,
  consultarElencoContextual,
  cancelarConviteTime,
  consultarAdministracao,
};
const executarAutenticado = <T,>(request: (token: string) => Promise<T>) =>
  request('token');
const sessao = vi.hoisted(() => ({ hydrated: true }));
const elencoLeoes = {
  campeonatoId: '1',
  time: {
    id: 'time-inscrito-1',
    nome: 'Leões da Vila',
    sigla: 'LEV',
    statusParticipacao: 'ATIVO',
  },
  limiteAtletasPorTime: 18,
  minimoAtletas: 7,
  atletas: [
    {
      atletaCampeonatoId: 'atleta-camp-1',
      membroTimeId: 'membro-1',
      nomeUsuario: 'goleiro.leao',
      nomeExibicao: 'João Goleiro',
      status: 'ATIVO',
      inscritoEm: '2026-08-20T10:00:00.000Z',
    },
  ],
  quantidadeAtivos: 1,
  pendencias: ['Elenco abaixo do mínimo'],
  atualizadoEm: '2026-08-28T10:00:00.000Z',
};
const timesApiMock = {
  listarTimes: vi.fn().mockResolvedValue({
    itens: [
      { id: '1', nome: 'Time A', sigla: 'TMA', escudoUrl: null },
      { id: '2', nome: 'Time B', sigla: 'TMB', escudoUrl: null },
      { id: '3', nome: 'Time C', sigla: 'TMC', escudoUrl: null },
    ],
    pagina: 1,
    tamanho: 100,
    totalItens: 3,
    totalPaginas: 1,
  }),
};

vi.mock('@/contexts/campeonatos-api', () => ({
  useCampeonatosApi: () => campeonatosApiMock,
}));

vi.mock('@/contexts/times-api', () => ({
  useTimesApi: () => timesApiMock,
}));

vi.mock('@/hooks/use-sessao', () => ({
  useSessao: () => ({
    hydrated: sessao.hydrated,
    session: {
      account: { id: 'responsavel-1' },
      links: { organizedChampionshipIds: ['1'] },
    },
    executarAutenticado,
  }),
}));

vi.mock('@/services/organizador/catalogo-organizador.mock', () => ({
  catalogoOrganizadorMock: {
    obterCampeonato: () => ({
      id: 1,
      nome: 'Copa Teste',
      contexto: { tipo: 'PESSOAL', nome: 'Conta pessoal' },
      estado: 'EM_INSCRICOES',
      papelDaConta: 'RESPONSAVEL',
      timeIds: [1, 2],
    }),
  },
}));

vi.mock('@/stores/estado-operacional-organizador', () => ({
  useEstadoOperacionalOrganizador: () => ({
    estado: {
      estado: 'EM_INSCRICOES',
      timeIds: [1, 2],
      convitesTimePendentes: [],
      pendencias: [],
    },
    convidarTime: vi.fn(),
    cancelarConviteTime: vi.fn(),
    removerTime: vi.fn(),
  }),
}));

vi.mock('@/services/publico/catalogo-publico.mock', () => ({
  catalogoPublicoMock: {
    listarTimes: () => [
      { id: 1, nome: 'Time A' },
      { id: 2, nome: 'Time B' },
      { id: 3, nome: 'Time C' },
    ],
    obterTime: (id: number) => ({
      time: { id, nome: `Time ${id}` },
      elenco: [],
    }),
  },
  obterNomeTimePublico: (id: number) => `Time ${id}`,
}));

describe('participantes do campeonato', () => {
  beforeEach(() => {
    sessao.hydrated = true;
    vi.clearAllMocks();
    listarConvitesEnviados.mockResolvedValue({
      itens: [
        {
          conviteId: 'convite-1',
          time: { id: '3', nome: 'Time C', sigla: 'TMC' },
          destinatario: { usuarioId: 'capitao-3', nome: 'Capitão C' },
          status: 'PENDENTE',
          enviadoEm: '2026-08-28T10:00:00.000Z',
          expiraEm: '2026-09-04T10:00:00.000Z',
          encerradoEm: null,
          podeCancelar: true,
        },
      ],
      pagina: 1,
      tamanho: 100,
      totalItens: 1,
      totalPaginas: 1,
    });
    consultarElencoContextual.mockResolvedValue(elencoLeoes);
    cancelarConviteTime.mockResolvedValue({
      conviteId: 'convite-1',
      status: 'CANCELADO',
      canceladoEm: '2026-08-28T12:00:00.000Z',
    });
  });

  it('não inicia efeitos autenticados antes da hidratação', () => {
    sessao.hydrated = false;
    render(<TelaGerenciarTimes campeonatoId="1" incorporada />);

    expect(consultarAdministracao).not.toHaveBeenCalled();
    expect(listarConvitesEnviados).not.toHaveBeenCalled();
    expect(consultarElencoContextual).not.toHaveBeenCalled();
  });

  it('oculta o convite sem operação e permissão publicadas', async () => {
    consultarAdministracao.mockResolvedValueOnce({
      ...detalheAdministrativo,
      autoridade: { funcao: 'RESPONSAVEL', permissoes: [] },
      operacoesPermitidas: [],
    });
    render(<TelaGerenciarTimes campeonatoId="1" incorporada />);

    await screen.findByText('Leões da Vila');
    expect(
      screen.queryByRole('button', { name: 'Enviar convite' }),
    ).not.toBeInTheDocument();
  });

  it('carrega convites enviados e elencos contextuais com autenticação', async () => {
    render(<TelaGerenciarTimes campeonatoId="1" incorporada />);

    expect(await screen.findByText(/Capitão C/)).toBeVisible();
    expect(screen.getByText('Pendente')).toBeVisible();
    expect(await screen.findByText('João Goleiro')).toBeVisible();
    expect(screen.getByText('Elenco abaixo do mínimo')).toBeVisible();
    expect(listarConvitesEnviados).toHaveBeenCalledWith('1', 'token', 1, 100);
    expect(consultarElencoContextual).toHaveBeenCalledWith(
      '1',
      'time-inscrito-1',
      'token',
    );
  });

  it('mantém o convite e permite tentar novamente quando o cancelamento falha', async () => {
    cancelarConviteTime.mockRejectedValueOnce(new Error('indisponível'));
    render(<TelaGerenciarTimes campeonatoId="1" incorporada />);

    const botaoCancelar = await screen.findByRole('button', {
      name: 'Cancelar convite de Time C',
    });
    fireEvent.click(botaoCancelar);

    expect(
      await screen.findByText(
        'Não foi possível cancelar o convite. Tente novamente.',
      ),
    ).toBeVisible();
    expect(screen.getByText(/Capitão C/)).toBeVisible();
    expect(botaoCancelar).toBeEnabled();

    fireEvent.click(botaoCancelar);

    expect(await screen.findByText('Cancelado')).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Cancelar convite de Time C' }),
    ).not.toBeInTheDocument();
    expect(cancelarConviteTime).toHaveBeenCalledTimes(2);
    expect(cancelarConviteTime).toHaveBeenLastCalledWith(
      '1',
      'convite-1',
      'token',
    );
  });

  it('exibe estados vazios de convites e elenco contextual', async () => {
    listarConvitesEnviados.mockResolvedValueOnce({
      itens: [],
      pagina: 1,
      tamanho: 100,
      totalItens: 0,
      totalPaginas: 0,
    });
    consultarElencoContextual.mockResolvedValueOnce({
      ...elencoLeoes,
      atletas: [],
      quantidadeAtivos: 0,
      pendencias: [],
    });
    render(<TelaGerenciarTimes campeonatoId="1" incorporada />);

    expect(await screen.findByText('Nenhum convite enviado.')).toBeVisible();
    expect(
      await screen.findByText('Nenhum atleta no elenco contextual.'),
    ).toBeVisible();
  });

  it('exibe o carregamento de cada elenco enquanto a projeção resolve', async () => {
    consultarElencoContextual.mockImplementationOnce(
      () => new Promise(() => undefined),
    );
    render(<TelaGerenciarTimes campeonatoId="1" incorporada />);

    expect(
      await screen.findByText('Carregando elenco contextual...'),
    ).toBeVisible();
  });

  it('exibe erros independentes de convites e elenco contextual', async () => {
    listarConvitesEnviados.mockRejectedValueOnce(new Error('convites'));
    consultarElencoContextual.mockRejectedValueOnce(new Error('elenco'));
    render(<TelaGerenciarTimes campeonatoId="1" incorporada />);

    expect(
      await screen.findByText(
        'Não foi possível carregar os convites enviados.',
      ),
    ).toBeVisible();
    expect(
      await screen.findByText(
        'Não foi possível carregar o elenco contextual deste time.',
      ),
    ).toBeVisible();
  });

  it('carrega participantes confirmados pela projeção da API', async () => {
    render(<TelaGerenciarTimes campeonatoId="1" incorporada />);

    expect(await screen.findByText('Leões da Vila')).toBeVisible();
    expect(listarTimesParticipantes).toHaveBeenCalledWith(
      '1',
      undefined,
      1,
      100,
    );
  });

  it('carrega o elenco contextual dos participantes das páginas seguintes', async () => {
    listarTimesParticipantes
      .mockResolvedValueOnce({
        itens: [
          {
            timeId: 'time-inscrito-1',
            nome: 'Leões da Vila',
            sigla: 'LEV',
            escudoUrl: null,
            statusParticipacao: 'ATIVO',
            ordemInscricao: 1,
          },
        ],
        pagina: 1,
        tamanho: 100,
        totalItens: 2,
        totalPaginas: 2,
      })
      .mockResolvedValueOnce({
        itens: [
          {
            timeId: 'time-inscrito-2',
            nome: 'Tigres do Bairro',
            sigla: 'TIG',
            escudoUrl: null,
            statusParticipacao: 'ATIVO',
            ordemInscricao: 2,
          },
        ],
        pagina: 2,
        tamanho: 100,
        totalItens: 2,
        totalPaginas: 2,
      });
    consultarElencoContextual
      .mockResolvedValueOnce(elencoLeoes)
      .mockResolvedValueOnce({
        ...elencoLeoes,
        time: {
          id: 'time-inscrito-2',
          nome: 'Tigres do Bairro',
          sigla: 'TIG',
          statusParticipacao: 'ATIVO',
        },
        atletas: [
          {
            atletaCampeonatoId: 'atleta-camp-2',
            membroTimeId: 'membro-2',
            nomeUsuario: 'tigre.ataque',
            nomeExibicao: 'Maria Atacante',
            status: 'ATIVO',
            inscritoEm: '2026-08-21T10:00:00.000Z',
          },
        ],
      });
    render(<TelaGerenciarTimes campeonatoId="1" incorporada />);

    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Carregar mais participantes',
      }),
    );

    expect(await screen.findByText('Tigres do Bairro')).toBeVisible();
    expect(await screen.findByText('Maria Atacante')).toBeVisible();
    expect(consultarElencoContextual).toHaveBeenLastCalledWith(
      '1',
      'time-inscrito-2',
      'token',
    );
  });

  it('bloqueia novo convite para um time que já tem convite pendente', async () => {
    render(<TelaGerenciarTimes campeonatoId="1" incorporada />);

    await screen.findByRole('option', { name: 'Time C' });
    fireEvent.change(screen.getByLabelText('Time para convidar'), {
      target: { value: '3' },
    });

    expect(
      screen.getByRole('button', { name: 'Enviar convite' }),
    ).toBeDisabled();
    expect(convidarTime).not.toHaveBeenCalled();
  });

  it('carrega todas as páginas de times disponíveis e convites enviados', async () => {
    timesApiMock.listarTimes
      .mockResolvedValueOnce({
        itens: [{ id: '1', nome: 'Time A', sigla: 'TMA', escudoUrl: null }],
        pagina: 1,
        tamanho: 100,
        totalItens: 2,
        totalPaginas: 2,
      })
      .mockResolvedValueOnce({
        itens: [
          {
            id: '9',
            nome: 'Time da Segunda Página',
            sigla: 'TSP',
            escudoUrl: null,
          },
        ],
        pagina: 2,
        tamanho: 100,
        totalItens: 2,
        totalPaginas: 2,
      });
    listarConvitesEnviados
      .mockResolvedValueOnce({
        itens: [],
        pagina: 1,
        tamanho: 100,
        totalItens: 1,
        totalPaginas: 2,
      })
      .mockResolvedValueOnce({
        itens: [
          {
            conviteId: 'convite-2',
            time: {
              id: '9',
              nome: 'Convidado da Segunda Página',
              sigla: 'CSP',
            },
            destinatario: { usuarioId: 'capitao-9', nome: 'Capitão Nove' },
            status: 'PENDENTE',
            enviadoEm: '2026-08-28T10:00:00Z',
            expiraEm: '2026-09-04T10:00:00Z',
            encerradoEm: null,
            podeCancelar: true,
          },
        ],
        pagina: 2,
        tamanho: 100,
        totalItens: 1,
        totalPaginas: 2,
      });

    render(<TelaGerenciarTimes campeonatoId="1" incorporada />);

    expect(
      await screen.findByRole('option', { name: 'Time da Segunda Página' }),
    ).toBeVisible();
    expect(
      await screen.findByText('Convidado da Segunda Página · CSP'),
    ).toBeVisible();
    expect(timesApiMock.listarTimes).toHaveBeenNthCalledWith(2, {
      pagina: 2,
      tamanho: 100,
    });
    expect(listarConvitesEnviados).toHaveBeenNthCalledWith(
      2,
      '1',
      'token',
      2,
      100,
    );
  });
});

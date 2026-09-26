import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  criarConfrontosManuais,
  TelaChaveamento,
} from '@/screens/organizador/chaveamento';

const controle = vi.hoisted(() => ({
  estado: 'EM_INSCRICOES',
  hydrated: true,
  accountId: 'responsavel-1',
  operacoes: ['CONFIGURAR_ESTRUTURA'],
  prototipo: false,
}));
const selecionarEstruturaFases = vi.fn().mockResolvedValue({
  campeonatoId: '4',
  versaoConfiguracao: 3,
  fasesCriadas: 2,
});
const listarTimesParticipantes = vi.fn().mockResolvedValue({
  itens: Array.from({ length: 8 }, (_, indice) => ({
    timeId: String(indice + 1),
    nome: `Time ${indice + 1}`,
    sigla: `T${indice + 1}`,
    escudoUrl: null,
    statusParticipacao: 'ATIVO',
    ordemInscricao: indice + 1,
  })),
  pagina: 1,
  tamanho: 100,
  totalItens: 8,
  totalPaginas: 1,
});
const distribuirTimes = vi.fn().mockResolvedValue({});
const materializarPontosCorridos = vi.fn().mockResolvedValue({});
const materializarMataMata = vi.fn().mockResolvedValue({});
const consultarAdministracao = vi.fn().mockImplementation(async () => ({
  campeonatoId: '4',
  nome: 'Copa Estrutura',
  status: controle.estado,
  formato: 'GRUPOS_E_MATA_MATA',
  autoridade: { funcao: 'RESPONSAVEL', permissoes: ['CONFIGURAR_ESTRUTURA'] },
  operacoesPermitidas: controle.operacoes,
  configuracao: { versao: 3, pendencias: [] },
}));
const consultarFases = vi.fn().mockImplementation(async () => ({
  campeonatoId: '4',
  versaoConfiguracao: 3,
  fases:
    controle.estado === 'EM_INSCRICOES'
      ? []
      : [
          {
            faseId: 'fase-1',
            nome: 'Grupos',
            ordem: 1,
            tipo: 'GRUPOS',
            quantidadeTurnos: 1,
            classificadosPorGrupo: 2,
            grupos: [{ grupoId: 'grupo-a', nome: 'Grupo A', ordem: 1 }],
            statusMaterializacao: 'GERADA',
          },
        ],
}));
const consultarDistribuicao = vi.fn().mockResolvedValue({
  campeonatoId: '4',
  estado: 'NAO_EXECUTADA',
  modo: null,
  semente: null,
  versaoAlgoritmo: null,
  executadaEm: null,
  posicoes: [],
});
const consultarEstrutura = vi.fn().mockResolvedValue({
  campeonatoId: '4',
  estado: 'NAO_GERADA',
  modo: null,
  geradaEm: null,
  pontosCorridos: [],
  mataMata: [],
});
const gerarProgramacao = vi.fn();

vi.mock('@/contexts/campeonatos-api', () => ({
  useCampeonatosApi: () => ({
    selecionarEstruturaFases,
    listarTimesParticipantes,
    distribuirTimes,
    materializarPontosCorridos,
    materializarMataMata,
    consultarAdministracao,
    consultarFases,
    consultarDistribuicao,
    consultarEstrutura,
  }),
}));

vi.mock('@/hooks/use-sessao', () => ({
  useSessao: () => ({
    hydrated: controle.hydrated,
    session: {
      sessionId: controle.accountId,
      prototipo: controle.prototipo,
      account: { id: controle.accountId },
      links: { organizedChampionshipIds: ['4'] },
    },
    executarAutenticado: <T,>(request: (token: string) => Promise<T>) =>
      request('token'),
  }),
}));

vi.mock('@/services/organizador/catalogo-organizador.mock', () => ({
  catalogoOrganizadorMock: {
    obterCampeonato: () => ({
      id: 4,
      nome: 'Copa Estrutura',
      formato: 'GRUPOS_MATA_MATA',
      estado: 'EM_INSCRICOES',
      papelDaConta: 'RESPONSAVEL',
      timeIds: [],
    }),
  },
}));

vi.mock('@/stores/estado-operacional-organizador', () => ({
  useEstadoOperacionalOrganizador: () => ({
    estado: { estado: controle.estado, programacaoGerada: false },
    gerarProgramacao,
  }),
}));

vi.mock('@/services/publico/catalogo-publico.mock', () => ({
  catalogoPublicoMock: { obterTime: () => null },
}));

describe('estrutura do campeonato', () => {
  it('monta confrontos manuais seguindo a ordem das sementes', () => {
    const confrontos = criarConfrontosManuais(['1', '2', '3', '4'], 'fase-1');

    expect(confrontos).toHaveLength(3);
    expect(confrontos.slice(0, 2)).toMatchObject([
      { rodada: 1, timeAId: '1', timeBId: '4' },
      { rodada: 1, timeAId: '2', timeBId: '3' },
    ]);
    expect(confrontos[2]).toMatchObject({
      rodada: 2,
      timeAId: null,
      timeBId: null,
    });
  });

  beforeEach(() => {
    controle.estado = 'EM_INSCRICOES';
    controle.hydrated = true;
    controle.accountId = 'responsavel-1';
    controle.operacoes = ['CONFIGURAR_ESTRUTURA'];
    controle.prototipo = false;
    vi.clearAllMocks();
    listarTimesParticipantes.mockResolvedValue({
      itens: Array.from({ length: 8 }, (_, indice) => ({
        timeId: String(indice + 1),
        nome: `Time ${indice + 1}`,
        sigla: `T${indice + 1}`,
        escudoUrl: null,
        statusParticipacao: 'ATIVO',
        ordemInscricao: indice + 1,
      })),
      pagina: 1,
      tamanho: 100,
      totalItens: 8,
      totalPaginas: 1,
    });
    consultarFases.mockImplementation(async () => ({
      campeonatoId: '4',
      versaoConfiguracao: 3,
      fases:
        controle.estado === 'EM_INSCRICOES'
          ? []
          : [
              {
                faseId: 'fase-1',
                nome: 'Grupos',
                ordem: 1,
                tipo: 'GRUPOS',
                quantidadeTurnos: 1,
                classificadosPorGrupo: 2,
                grupos: [{ grupoId: 'grupo-a', nome: 'Grupo A', ordem: 1 }],
                statusMaterializacao: 'GERADA',
              },
            ],
    }));
    consultarDistribuicao.mockResolvedValue({
      campeonatoId: '4',
      estado: 'NAO_EXECUTADA',
      modo: null,
      semente: null,
      versaoAlgoritmo: null,
      executadaEm: null,
      posicoes: [],
    });
    consultarEstrutura.mockResolvedValue({
      campeonatoId: '4',
      estado: 'NAO_GERADA',
      modo: null,
      geradaEm: null,
      pontosCorridos: [],
      mataMata: [],
    });
    materializarPontosCorridos.mockResolvedValue({});
    materializarMataMata.mockResolvedValue({});
  });

  it('configura grupos e mata-mata durante as inscrições usando os participantes confirmados', async () => {
    consultarFases
      .mockResolvedValueOnce({
        campeonatoId: '4',
        versaoConfiguracao: 3,
        fases: [],
      })
      .mockResolvedValueOnce({
        campeonatoId: '4',
        versaoConfiguracao: 4,
        fases: [
          {
            faseId: 'fase-1',
            nome: 'Grupos',
            ordem: 1,
            tipo: 'GRUPOS',
            quantidadeTurnos: 1,
            classificadosPorGrupo: 2,
            grupos: [{ grupoId: 'grupo-a', nome: 'Grupo A', ordem: 1 }],
            statusMaterializacao: 'NAO_GERADA',
          },
        ],
      });
    render(<TelaChaveamento campeonatoId="4" incorporada />);

    expect(await screen.findByText('8 Times confirmados')).toBeVisible();
    expect(screen.getByLabelText('Formato da competição')).toHaveValue(
      'GRUPOS_E_MATA_MATA',
    );
    expect(screen.getByLabelText('Quantidade de grupos')).toBeVisible();
    expect(screen.getByLabelText('Classificados por grupo')).toBeVisible();

    fireEvent.click(
      screen.getByRole('button', { name: 'Salvar estrutura de fases' }),
    );

    await waitFor(() =>
      expect(selecionarEstruturaFases).toHaveBeenCalledWith(
        '4',
        'token',
        expect.objectContaining({
          formato: 'GRUPOS_E_MATA_MATA',
          fases: [
            expect.objectContaining({ tipo: 'GRUPOS', ordem: 1 }),
            expect.objectContaining({ tipo: 'MATA_MATA', ordem: 2 }),
          ],
        }),
      ),
    );
    await waitFor(() => expect(consultarFases).toHaveBeenCalledTimes(2));
    expect(
      screen.queryByLabelText('Formato da competição'),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Estrutura persistida')).toBeVisible();
  });

  it('carrega todas as páginas de participantes usados na estrutura', async () => {
    listarTimesParticipantes
      .mockResolvedValueOnce({
        itens: [
          {
            timeId: 'time-1',
            nome: 'Primeiro FC',
            sigla: 'PRI',
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
            timeId: 'time-2',
            nome: 'Segundo FC',
            sigla: 'SEG',
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

    render(<TelaChaveamento campeonatoId="4" incorporada />);

    expect(await screen.findByText('2 Times confirmados')).toBeVisible();
    expect(screen.getByText('Segundo FC')).toBeVisible();
    expect(listarTimesParticipantes).toHaveBeenNthCalledWith(
      2,
      '4',
      undefined,
      2,
      100,
    );
  });

  it('distribui e materializa grupos e mata-mata somente após finalizar inscrições', async () => {
    controle.estado = 'AGUARDANDO_SORTEIO';
    controle.operacoes = ['GERAR_ESTRUTURA'];
    render(<TelaChaveamento campeonatoId="4" incorporada />);

    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Gerar confrontos automaticamente',
      }),
    );

    await waitFor(() => expect(distribuirTimes).toHaveBeenCalled());
    expect(materializarPontosCorridos).toHaveBeenCalled();
    expect(materializarMataMata).toHaveBeenCalled();
    expect(gerarProgramacao).not.toHaveBeenCalled();
  });

  it('recupera fases, distribuição e confrontos persistidos após reload', async () => {
    controle.estado = 'AGUARDANDO_SORTEIO';
    consultarDistribuicao.mockResolvedValueOnce({
      campeonatoId: '4',
      estado: 'EXECUTADA',
      modo: 'AUTOMATICA',
      semente: 'abc',
      versaoAlgoritmo: '1',
      executadaEm: '2026-08-28T20:00:00Z',
      posicoes: [],
    });
    consultarEstrutura.mockResolvedValueOnce({
      campeonatoId: '4',
      estado: 'GERADA',
      modo: 'AUTOMATICA',
      geradaEm: '2026-08-28T20:01:00Z',
      pontosCorridos: [],
      mataMata: [
        {
          confrontoId: 'c-1',
          faseId: 'fase-1',
          rodada: 1,
          ordem: 1,
          tipo: 'BYE',
          timeAId: 'time-1',
          timeBId: null,
          partidaId: null,
          confrontoDestinoId: null,
          posicaoDestino: null,
          criterioByeAplicado: 'ORDEM_INSCRICAO',
        },
      ],
    });
    render(<TelaChaveamento campeonatoId="4" incorporada />);

    expect(await screen.findByText('Grupo A')).toBeVisible();
    expect(screen.getByText(/Distribuição automática/i)).toBeVisible();
    expect(screen.getByText(/BYE/i)).toBeVisible();
    expect(consultarFases).toHaveBeenCalledWith('4', 'token');
    expect(consultarDistribuicao).toHaveBeenCalledWith('4', 'token');
    expect(consultarEstrutura).toHaveBeenCalledWith('4', 'token');
  });

  it('não executa consultas autenticadas antes da hidratação', () => {
    controle.hydrated = false;
    render(<TelaChaveamento campeonatoId="4" incorporada />);

    expect(consultarAdministracao).not.toHaveBeenCalled();
    expect(consultarFases).not.toHaveBeenCalled();
    expect(consultarDistribuicao).not.toHaveBeenCalled();
    expect(consultarEstrutura).not.toHaveBeenCalled();
  });

  it('bloqueia fail-closed a substituição quando a estrutura persistida não hidrata todos os parâmetros', async () => {
    consultarFases.mockResolvedValueOnce({
      campeonatoId: '4',
      versaoConfiguracao: 3,
      fases: [
        {
          faseId: 'fase-1',
          nome: 'Liga',
          ordem: 1,
          tipo: 'PONTOS_CORRIDOS',
          quantidadeTurnos: 1,
          classificadosPorGrupo: null,
          grupos: [],
          statusMaterializacao: 'NAO_GERADA',
        },
      ],
    });
    render(<TelaChaveamento campeonatoId="4" incorporada />);

    expect(await screen.findByText(/substituição bloqueada/i)).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Salvar estrutura de fases' }),
    ).not.toBeInTheDocument();
  });

  it('permite revisar e substituir fases persistidas no protótipo', async () => {
    controle.prototipo = true;
    consultarFases.mockResolvedValueOnce({
      campeonatoId: '4',
      versaoConfiguracao: 3,
      fases: [
        {
          faseId: 'fase-1',
          nome: 'Fase eliminatória',
          ordem: 1,
          tipo: 'MATA_MATA',
          quantidadeTurnos: null,
          classificadosPorGrupo: null,
          grupos: [],
          statusMaterializacao: 'NAO_GERADA',
        },
      ],
    });
    render(<TelaChaveamento campeonatoId="4" incorporada />);

    expect(
      await screen.findByRole('button', { name: 'Salvar estrutura de fases' }),
    ).toBeVisible();
  });

  it('retoma pela etapa persistida e reutiliza a chave da etapa que falhou', async () => {
    controle.estado = 'AGUARDANDO_SORTEIO';
    controle.operacoes = ['GERAR_ESTRUTURA'];
    consultarDistribuicao.mockResolvedValue({
      campeonatoId: '4',
      estado: 'EXECUTADA',
      modo: 'AUTOMATICA',
      semente: 'abc',
      versaoAlgoritmo: '1',
      executadaEm: '2026-08-28T20:00:00Z',
      posicoes: [],
    });
    consultarEstrutura.mockResolvedValue({
      campeonatoId: '4',
      estado: 'NAO_GERADA',
      modo: 'AUTOMATICA',
      geradaEm: null,
      pontosCorridos: [],
      mataMata: [],
    });
    materializarPontosCorridos
      .mockRejectedValueOnce(new Error('indisponível'))
      .mockResolvedValueOnce({});
    render(<TelaChaveamento campeonatoId="4" incorporada />);

    const botao = await screen.findByRole('button', {
      name: 'Gerar confrontos automaticamente',
    });
    fireEvent.click(botao);
    await screen.findByText('Não foi possível gerar a estrutura.');
    fireEvent.click(botao);

    await waitFor(() =>
      expect(materializarPontosCorridos).toHaveBeenCalledTimes(2),
    );
    expect(distribuirTimes).not.toHaveBeenCalled();
    expect(materializarPontosCorridos.mock.calls[0]?.[4]).toBe(
      materializarPontosCorridos.mock.calls[1]?.[4],
    );
  });

  it('materializa a coleção ausente do formato misto mesmo quando o estado agregado é GERADA', async () => {
    controle.estado = 'AGUARDANDO_SORTEIO';
    controle.operacoes = ['GERAR_ESTRUTURA'];
    consultarDistribuicao.mockResolvedValue({
      campeonatoId: '4',
      estado: 'EXECUTADA',
      modo: 'AUTOMATICA',
      semente: 'abc',
      versaoAlgoritmo: '1',
      executadaEm: '2026-08-28T20:00:00Z',
      posicoes: [],
    });
    consultarEstrutura.mockResolvedValue({
      campeonatoId: '4',
      estado: 'GERADA',
      modo: 'AUTOMATICA',
      geradaEm: '2026-08-28T20:01:00Z',
      pontosCorridos: [{ faseId: 'fase-1', grupoId: 'grupo-a', rodadas: [] }],
      mataMata: [],
    });
    render(<TelaChaveamento campeonatoId="4" incorporada />);

    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Gerar confrontos automaticamente',
      }),
    );

    await waitFor(() => expect(materializarMataMata).toHaveBeenCalledTimes(1));
    expect(materializarPontosCorridos).not.toHaveBeenCalled();
  });
});

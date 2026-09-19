import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TelaVisaoGeralCampeonato } from '@/screens/organizador/visao-geral-campeonato';

const api = vi.hoisted(() => ({
  consultarAdministracao: vi.fn().mockResolvedValue({
    campeonatoId: '1',
    nome: 'Copa Recuperável',
    descricao: null,
    status: 'EM_INSCRICOES',
    formato: 'PONTOS_CORRIDOS',
    contexto: 'PESSOAL',
    prefeituraId: null,
    municipioId: 'municipio-1',
    inicioPrevistoEm: '2026-09-01',
    fimPrevistoEm: null,
    situacaoComercial: 'AUTORIZADO',
    configuracao: {
      limiteTimes: 16,
      limiteAtletasPorTime: 20,
      quantidadeTurnos: 1,
      versao: 3,
      valida: false,
      pendencias: ['REGULAMENTO_NAO_PUBLICADO'],
    },
    autoridade: {
      funcao: 'RESPONSAVEL',
      permissoes: ['EDITAR_DADOS', 'GERENCIAR_EQUIPE'],
    },
    operacoesPermitidas: ['ATUALIZAR', 'VALIDAR_CONFIGURACAO', 'CANCELAR'],
  }),
  listarOrganizadores: vi.fn().mockResolvedValue({
    itens: [],
    pagina: 1,
    tamanho: 100,
    totalItens: 0,
    totalPaginas: 0,
  }),
  buscarOrganizadorElegivel: vi.fn().mockResolvedValue({
    itens: [
      {
        usuarioId: 'usuario-2',
        nome: 'Nova Pessoa',
        nomeUsuario: 'nova',
        elegivel: true,
      },
    ],
    pagina: 1,
    tamanho: 1,
    totalItens: 1,
    totalPaginas: 1,
  }),
  adicionarOrganizador: vi.fn().mockResolvedValue({
    organizadorId: 'organizador-2',
    usuarioId: 'usuario-2',
    funcao: 'ORGANIZADOR',
    status: 'ATIVO',
  }),
  atualizarCampeonato: vi.fn().mockResolvedValue({}),
  validarConfiguracao: vi
    .fn()
    .mockResolvedValue({ valido: true, erros: [], versaoConfiguracao: 3 }),
  cancelarCampeonato: vi.fn().mockResolvedValue({ status: 'CANCELADO' }),
  finalizarInscricoes: vi
    .fn()
    .mockResolvedValue({ status: 'AGUARDANDO_SORTEIO' }),
  removerOrganizador: vi.fn().mockResolvedValue({ status: 'ENCERRADO' }),
}));

vi.mock('@/contexts/campeonatos-api', () => ({ useCampeonatosApi: () => api }));
vi.mock('@/hooks/use-sessao', () => ({
  useSessao: () => ({
    hydrated: true,
    executarAutenticado: <T,>(request: (token: string) => Promise<T>) =>
      request('token'),
  }),
}));
vi.mock('@/screens/organizador/gerenciar-times', () => ({
  TelaGerenciarTimes: ({ incorporada }: { incorporada?: boolean }) => (
    <h2>
      {incorporada ? 'Participantes incorporados' : 'Participantes isolados'}
    </h2>
  ),
}));
vi.mock('@/screens/organizador/chaveamento', () => ({
  TelaChaveamento: ({ incorporada }: { incorporada?: boolean }) => (
    <h2>{incorporada ? 'Estrutura incorporada' : 'Estrutura isolada'}</h2>
  ),
}));
vi.mock('@/screens/organizador/gerenciar-partidas', () => ({
  TelaGerenciarPartidas: ({ incorporada }: { incorporada?: boolean }) => (
    <h2>{incorporada ? 'Partidas incorporadas' : 'Partidas isoladas'}</h2>
  ),
}));

describe('workspace administrativo recuperável', () => {
  beforeEach(() => vi.clearAllMocks());

  it('carrega detalhe, autoridade e as seis áreas pela projeção administrativa', async () => {
    render(<TelaVisaoGeralCampeonato campeonatoId="1" secaoAtiva="equipe" />);

    expect(screen.getByRole('status')).toHaveTextContent('Carregando');
    expect(
      await screen.findByRole('heading', { name: 'Equipe organizadora' }),
    ).toBeVisible();
    expect(screen.getAllByRole('tab')).toHaveLength(6);
    expect(screen.getByText('Você é o responsável')).toBeVisible();
    expect(api.consultarAdministracao).toHaveBeenCalledWith('1', 'token');
    expect(api.listarOrganizadores).toHaveBeenCalledWith(
      '1',
      'token',
      1,
      100,
      'ATIVO',
    );
  });

  it.each([
    ['participantes', 'Participantes incorporados'],
    ['estrutura', 'Estrutura incorporada'],
    ['partidas', 'Partidas incorporadas'],
  ] as const)('incorpora %s no workspace', async (secao, titulo) => {
    render(<TelaVisaoGeralCampeonato campeonatoId="1" secaoAtiva={secao} />);
    expect(await screen.findByRole('heading', { name: titulo })).toBeVisible();
  });

  it('busca por e-mail e adiciona o organizador elegível', async () => {
    render(<TelaVisaoGeralCampeonato campeonatoId="1" secaoAtiva="equipe" />);
    fireEvent.change(await screen.findByLabelText('E-mail do organizador'), {
      target: { value: 'nova@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar organizador' }));
    expect(await screen.findByText('Nova Pessoa')).toBeVisible();
    fireEvent.click(
      screen.getByRole('button', { name: 'Adicionar organizador' }),
    );
    await waitFor(() =>
      expect(api.adicionarOrganizador).toHaveBeenCalledWith(
        '1',
        'usuario-2',
        'token',
      ),
    );
  });

  it('mantém o Regulamento fail-closed sem projeção integral de leitura', async () => {
    render(
      <TelaVisaoGeralCampeonato campeonatoId="1" secaoAtiva="regulamento" />,
    );
    expect(
      await screen.findByRole('heading', { name: 'Regulamento' }),
    ).toBeVisible();
    expect(screen.getByLabelText('Texto do regulamento')).toBeDisabled();
    expect(screen.getByLabelText('Critérios de desempate')).toBeDisabled();
    expect(
      screen.getByText(/evitar sobrescrever regras existentes/i),
    ).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Salvar regulamento' }),
    ).toBeNull();
  });

  it('persiste dados gerais, valida e cancela pelas operações administrativas', async () => {
    render(<TelaVisaoGeralCampeonato campeonatoId="1" secaoAtiva="geral" />);
    fireEvent.change(await screen.findByLabelText('Nome do campeonato'), {
      target: { value: 'Copa Atualizada' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    await waitFor(() =>
      expect(api.atualizarCampeonato).toHaveBeenCalledWith(
        '1',
        'token',
        expect.objectContaining({ nome: 'Copa Atualizada' }),
      ),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Validar campeonato' }));
    await waitFor(() =>
      expect(api.validarConfiguracao).toHaveBeenCalledWith('1', 'token'),
    );
    fireEvent.click(screen.getByText('Outras ações do campeonato'));
    fireEvent.change(screen.getByLabelText('Motivo do cancelamento'), {
      target: { value: 'Impossibilidade de continuidade' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Confirmar cancelamento' }),
    );
    await waitFor(() =>
      expect(api.cancelarCampeonato).toHaveBeenCalledWith(
        '1',
        'token',
        'Impossibilidade de continuidade',
      ),
    );
  });

  it('oculta ações ausentes das operações e permissões publicadas', async () => {
    api.consultarAdministracao.mockResolvedValueOnce({
      campeonatoId: '1',
      nome: 'Copa Restrita',
      descricao: null,
      status: 'EM_INSCRICOES',
      formato: 'PONTOS_CORRIDOS',
      contexto: 'PESSOAL',
      prefeituraId: null,
      municipioId: 'municipio-1',
      inicioPrevistoEm: '2026-09-01',
      fimPrevistoEm: null,
      situacaoComercial: 'AUTORIZADO',
      configuracao: { versao: 3, valida: false, pendencias: [] },
      autoridade: { funcao: 'RESPONSAVEL', permissoes: [] },
      operacoesPermitidas: [],
    });
    render(<TelaVisaoGeralCampeonato campeonatoId="1" secaoAtiva="geral" />);

    await screen.findByLabelText('Nome do campeonato');
    expect(
      screen.queryByRole('button', { name: 'Salvar alterações' }),
    ).toBeNull();
    expect(
      screen.queryByRole('button', { name: 'Validar campeonato' }),
    ).toBeNull();
    expect(screen.queryByText('Outras ações do campeonato')).toBeNull();
  });

  it('exige simultaneamente a operação e a permissão correspondente nas ações gerais', async () => {
    api.consultarAdministracao.mockResolvedValueOnce({
      ...(await api.consultarAdministracao()),
      autoridade: { funcao: 'RESPONSAVEL', permissoes: [] },
      operacoesPermitidas: [
        'ATUALIZAR',
        'VALIDAR_CONFIGURACAO',
        'FINALIZAR_INSCRICOES',
        'CANCELAR',
      ],
    });
    render(<TelaVisaoGeralCampeonato campeonatoId="1" secaoAtiva="geral" />);

    await screen.findByLabelText('Nome do campeonato');
    expect(
      screen.queryByRole('button', { name: 'Salvar alterações' }),
    ).toBeNull();
    expect(
      screen.queryByRole('button', { name: 'Validar campeonato' }),
    ).toBeNull();
    expect(
      screen.queryByRole('button', { name: 'Finalizar inscrições' }),
    ).toBeNull();
    expect(screen.queryByText('Outras ações do campeonato')).toBeNull();
  });

  it.each([
    [
      'validarConfiguracao',
      'Validar campeonato',
      'Não foi possível validar a configuração.',
    ],
    [
      'finalizarInscricoes',
      'Finalizar inscrições',
      'Não foi possível finalizar as inscrições.',
    ],
  ] as const)(
    'exibe feedback quando %s falha',
    async (metodo, botao, mensagem) => {
      api.consultarAdministracao.mockResolvedValueOnce({
        ...(await api.consultarAdministracao()),
        autoridade: {
          funcao: 'RESPONSAVEL',
          permissoes: ['EDITAR_DADOS'],
        },
        operacoesPermitidas: ['VALIDAR_CONFIGURACAO', 'FINALIZAR_INSCRICOES'],
      });
      api[metodo].mockRejectedValueOnce(new Error('indisponível'));
      render(<TelaVisaoGeralCampeonato campeonatoId="1" secaoAtiva="geral" />);

      fireEvent.click(await screen.findByRole('button', { name: botao }));
      expect(await screen.findByText(mensagem)).toBeVisible();
    },
  );

  it('exibe feedback quando o cancelamento do Campeonato falha', async () => {
    api.cancelarCampeonato.mockRejectedValueOnce(new Error('indisponível'));
    render(<TelaVisaoGeralCampeonato campeonatoId="1" secaoAtiva="geral" />);

    fireEvent.click(await screen.findByText('Outras ações do campeonato'));
    fireEvent.change(screen.getByLabelText('Motivo do cancelamento'), {
      target: { value: 'Motivo válido' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Confirmar cancelamento' }),
    );

    expect(
      await screen.findByText('Não foi possível cancelar o Campeonato.'),
    ).toBeVisible();
  });

  it('exibe feedback quando a busca ou adição de organizador falha', async () => {
    api.buscarOrganizadorElegivel.mockRejectedValueOnce(
      new Error('indisponível'),
    );
    render(<TelaVisaoGeralCampeonato campeonatoId="1" secaoAtiva="equipe" />);

    fireEvent.change(await screen.findByLabelText('E-mail do organizador'), {
      target: { value: 'nova@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar organizador' }));
    expect(
      await screen.findByText('Não foi possível buscar o organizador.'),
    ).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Buscar organizador' }));
    expect(await screen.findByText('Nova Pessoa')).toBeVisible();
    api.adicionarOrganizador.mockRejectedValueOnce(new Error('indisponível'));
    fireEvent.click(
      screen.getByRole('button', { name: 'Adicionar organizador' }),
    );
    expect(
      await screen.findByText('Não foi possível adicionar o organizador.'),
    ).toBeVisible();
  });

  it('mantém a equipe e exibe feedback quando a remoção falha', async () => {
    api.listarOrganizadores.mockResolvedValueOnce({
      itens: [
        {
          organizadorId: 'org-removivel',
          usuario: {
            id: 'u-2',
            nome: 'Pessoa Removível',
            nomeUsuario: 'removivel',
          },
          funcao: 'ORGANIZADOR',
          status: 'ATIVO',
          adicionadoEm: '2026-08-01',
          encerradoEm: null,
          podeSerRemovido: true,
        },
      ],
      pagina: 1,
      tamanho: 100,
      totalItens: 1,
      totalPaginas: 1,
    });
    api.removerOrganizador.mockRejectedValueOnce(new Error('indisponível'));
    render(<TelaVisaoGeralCampeonato campeonatoId="1" secaoAtiva="equipe" />);

    fireEvent.click(await screen.findByRole('button', { name: 'Remover' }));

    expect(
      await screen.findByText('Não foi possível remover o organizador.'),
    ).toBeVisible();
    expect(screen.getByText('Pessoa Removível')).toBeVisible();
  });

  it('carrega todas as páginas da equipe organizadora', async () => {
    api.listarOrganizadores
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
            organizadorId: 'org-2',
            usuario: {
              id: 'u-2',
              nome: 'Organizadora da Segunda Página',
              nomeUsuario: 'org2',
            },
            funcao: 'ORGANIZADOR',
            status: 'ATIVO',
            adicionadoEm: '2026-08-01',
            encerradoEm: null,
            podeSerRemovido: false,
          },
        ],
        pagina: 2,
        tamanho: 100,
        totalItens: 1,
        totalPaginas: 2,
      });
    render(<TelaVisaoGeralCampeonato campeonatoId="1" secaoAtiva="equipe" />);

    expect(
      await screen.findByText('Organizadora da Segunda Página'),
    ).toBeVisible();
    expect(api.listarOrganizadores).toHaveBeenNthCalledWith(
      2,
      '1',
      'token',
      2,
      100,
      'ATIVO',
    );
  });
});

import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TelaSumulaIntegrada } from '@/screens/organizador/sumula-integrada';

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  consultarPartida: vi.fn(),
  consultarAdministracao: vi.fn(),
  consultarEscalacao: vi.fn(),
  publicarSumula: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push }),
}));

vi.mock('@/contexts/partidas-api', () => {
  const api = {
    consultarPartida: mocks.consultarPartida,
    consultarAdministracao: mocks.consultarAdministracao,
    consultarEscalacao: mocks.consultarEscalacao,
    publicarSumula: mocks.publicarSumula,
  };
  return { usePartidasApi: () => api };
});

vi.mock('@/hooks/use-sessao', () => {
  const sessao = {
    executarAutenticado: <T,>(requisicao: (token: string) => Promise<T>) =>
      requisicao('token-integrado'),
  };
  return { useSessao: () => sessao };
});

const detalhe = {
  partidaId: 'partida-1',
  campeonatoId: 'campeonato-1',
  faseId: 'fase-1',
  grupoId: null,
  confrontoId: null,
  rodada: 1,
  mandante: {
    timeCampeonatoId: 'time-campeonato-1',
    timeId: 'time-1',
    nome: 'Vila Nova FC',
  },
  visitante: {
    timeCampeonatoId: 'time-campeonato-2',
    timeId: 'time-2',
    nome: 'Leões FC',
  },
  estado: 'AGENDADA',
  agendamento: {
    inicioEm: '2026-09-20T18:00:00.000Z',
    campoId: 'campo-1',
    versao: 1,
    autorizacaoExternaConfirmada: true,
  },
  motivoAdministrativo: null,
  operacoesPermitidas: ['PUBLICAR_SUMULA'],
  pdfOficial: { status: 'INEXISTENTE' },
  atualizadoEm: '2026-09-20T20:00:00.000Z',
};

const detalhePublico = {
  partidaId: 'partida-1',
  campeonato: { id: 'campeonato-1', nome: 'Copa Municipal' },
  fase: { id: 'fase-1', nome: 'Fase única', tipo: 'PONTOS_CORRIDOS' },
  grupo: null,
  rodada: 1,
  confrontoId: null,
  mandante: {
    timeId: 'time-1',
    nome: 'Vila Nova FC',
    sigla: 'VNF',
    escudoUrl: null,
  },
  visitante: {
    timeId: 'time-2',
    nome: 'Leões FC',
    sigla: 'LEO',
    escudoUrl: null,
  },
  agendamento: {
    inicioEm: '2026-09-20T18:00:00.000Z',
    campo: { id: 'campo-1', nome: 'Estádio Municipal' },
  },
  estado: 'AGENDADA',
  motivoPublico: null,
  resultado: null,
  sumulaPublica: null,
};

function escalacao(timeCampeonatoId: string, nome: string) {
  return {
    partidaId: 'partida-1',
    timeCampeonatoId,
    visibilidade: 'PRIVADA',
    bloqueada: false,
    atletas: [
      {
        atletaCampeonatoId: `${timeCampeonatoId}-atleta-1`,
        nomeUsuario: nome.toLowerCase().replaceAll(' ', ''),
        nomeExibicao: nome,
        situacao: 'TITULAR',
        posicaoUsada: 'GOLEIRO',
        numeroCamisa: 1,
        ordem: 1,
      },
    ],
    versao: 1,
    atualizadaEm: '2026-09-20T20:00:00.000Z',
  };
}

describe('Súmula integrada do organizador', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.consultarPartida.mockResolvedValue(detalhePublico);
    mocks.consultarAdministracao.mockResolvedValue(detalhe);
    mocks.consultarEscalacao.mockImplementation(
      (_partidaId: string, timeCampeonatoId: string) =>
        Promise.resolve(
          timeCampeonatoId === 'time-campeonato-1'
            ? escalacao('time-campeonato-1', 'Marcos Oliveira')
            : escalacao('time-campeonato-2', 'Henrique Alves'),
        ),
    );
    mocks.publicarSumula.mockResolvedValue({
      sumulaId: 'sumula-1',
      partidaId: 'partida-1',
      estadoPartida: 'ENCERRADA_SUMULA',
      placar: {
        regulamentar: { mandante: 0, visitante: 0 },
        prorrogacao: null,
        penaltis: null,
      },
      publicadaEm: '2026-09-20T21:00:00.000Z',
      pdf: { status: 'PENDENTE' },
    });
  });

  it('mantém a composição da Súmula e trata as escalações dos capitães como leitura', async () => {
    render(
      <TelaSumulaIntegrada campeonatoId="campeonato-1" partidaId="partida-1" />,
    );

    expect(
      await screen.findByRole('heading', { name: 'Súmula da partida' }),
    ).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Escalações' })).toBeVisible();
    expect(
      screen.getByRole('heading', { name: 'Equipe de arbitragem' }),
    ).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Gols' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Cartões' })).toBeVisible();
    expect(
      screen.getByRole('heading', { name: 'Substituições' }),
    ).toBeVisible();

    const mandante = screen.getByRole('region', {
      name: 'Escalação de Vila Nova FC',
    });
    expect(within(mandante).getByText('Marcos Oliveira')).toBeVisible();
    expect(
      screen.queryByRole('combobox', { name: /situação de/i }),
    ).not.toBeInTheDocument();
  });

  it('publica uma partida sem ocorrências após revisão definitiva', async () => {
    render(
      <TelaSumulaIntegrada campeonatoId="campeonato-1" partidaId="partida-1" />,
    );

    await screen.findByRole('heading', { name: 'Súmula da partida' });
    fireEvent.change(screen.getByLabelText('Árbitro'), {
      target: { value: 'Carlos Silva' },
    });
    fireEvent.click(
      screen.getByRole('checkbox', { name: /confirmo que revisei/i }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Revisar Súmula' }));
    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Publicar Súmula definitivamente',
      }),
    );

    await waitFor(() => expect(mocks.publicarSumula).toHaveBeenCalledTimes(1));
    expect(mocks.publicarSumula).toHaveBeenCalledWith(
      'partida-1',
      'token-integrado',
      expect.objectContaining({
        confirmacaoDefinitiva: true,
        placar: {
          regulamentar: { mandante: 0, visitante: 0 },
          prorrogacao: null,
          penaltis: null,
        },
        eventos: [],
      }),
      expect.any(String),
    );
    expect(mocks.push).toHaveBeenCalledWith(
      '/organizador/campeonato/campeonato-1/partidas?sumula=confirmada',
    );
  });

  it('bloqueia o encerramento empatado de mata-mata enquanto o editor de desempate não está disponível', async () => {
    mocks.consultarPartida.mockResolvedValue({
      ...detalhePublico,
      fase: { ...detalhePublico.fase, tipo: 'MATA_MATA' },
    });

    render(
      <TelaSumulaIntegrada campeonatoId="campeonato-1" partidaId="partida-1" />,
    );

    expect(
      await screen.findByText(/mata-mata exige um vencedor/i),
    ).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Revisar Súmula' }),
    ).toBeDisabled();
  });
});

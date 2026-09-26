import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TelaDetalhesPartida } from '@/screens/publico/detalhes-partida';
import { TelaPartidas } from '@/screens/publico/partidas';

const listarAgenda = vi.fn();
const consultarPartida = vi.fn();
const partidasApi = { listarAgenda, consultarPartida };

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'partida-publica-1' }),
}));
vi.mock('@/contexts/partidas-api', () => ({
  usePartidasApi: () => partidasApi,
}));

describe('Partidas públicas', () => {
  beforeEach(() => {
    listarAgenda.mockReset();
    consultarPartida.mockReset();
  });

  it('carrega a agenda pela porta pública sem catálogo local', async () => {
    listarAgenda.mockResolvedValue({
      itens: [
        {
          partidaId: 'partida-publica-1',
          campeonato: { id: 'camp-1', nome: 'Copa do Contrato' },
          faseId: 'fase-1',
          rodada: 3,
          mandante: { timeId: 'time-1', nome: 'Leões', sigla: 'LEO' },
          visitante: { timeId: 'time-2', nome: 'Tigres', sigla: 'TIG' },
          inicioEm: '2030-09-01T18:00:00.000Z',
          campo: { id: 'campo-1', nome: 'Estádio Municipal' },
          estado: 'AGENDADA',
        },
      ],
      pagina: 1,
      tamanho: 20,
      totalItens: 1,
      totalPaginas: 1,
    });

    render(<TelaPartidas />);

    expect(screen.getByRole('status')).toHaveTextContent('Carregando partidas');
    expect(await screen.findByText('Copa do Contrato')).toBeVisible();
    expect(screen.getByText('Leões')).toBeVisible();
    expect(screen.queryByText('Copa Franca 2026')).not.toBeInTheDocument();
    expect(listarAgenda).toHaveBeenCalledWith(
      { pagina: 1, tamanho: 20 },
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it('carrega o detalhe e o resultado definitivo pela porta pública', async () => {
    consultarPartida.mockResolvedValue({
      partidaId: 'partida-publica-1',
      campeonato: { id: 'camp-1', nome: 'Copa do Contrato' },
      fase: { id: 'fase-1', nome: 'Final', tipo: 'MATA_MATA' },
      grupo: null,
      rodada: 1,
      confrontoId: 'confronto-1',
      mandante: {
        timeId: 'time-1',
        nome: 'Leões',
        sigla: 'LEO',
        escudoUrl: null,
      },
      visitante: {
        timeId: 'time-2',
        nome: 'Tigres',
        sigla: 'TIG',
        escudoUrl: null,
      },
      agendamento: {
        inicioEm: '2030-09-01T18:00:00.000Z',
        campo: { id: 'campo-1', nome: 'Estádio Municipal' },
      },
      estado: 'ENCERRADA_WO',
      motivoPublico: 'DESISTENCIA',
      resultado: {
        tipo: 'WO',
        placarRegulamentar: { mandante: 3, visitante: 0 },
        placarProrrogacao: null,
        placarPenaltis: null,
      },
    });

    render(<TelaDetalhesPartida />);

    expect(screen.getByRole('status')).toHaveTextContent('Carregando partida');
    expect(
      await screen.findByText('Copa do Contrato · Final · Rodada 1'),
    ).toBeVisible();
    expect(screen.getByText('3 × 0')).toBeVisible();
    expect(screen.getByText('Encerrada por WO')).toBeVisible();
    await waitFor(() =>
      expect(consultarPartida).toHaveBeenCalledWith(
        'partida-publica-1',
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      ),
    );
  });

  it('exibe eventos apenas quando a súmula pública está disponível', async () => {
    consultarPartida.mockResolvedValue({
      partidaId: 'partida-publica-1',
      campeonato: { id: 'camp-1', nome: 'Copa do Contrato' },
      fase: { id: 'fase-1', nome: 'Final', tipo: 'MATA_MATA' },
      grupo: null,
      rodada: 1,
      confrontoId: null,
      mandante: {
        timeId: 'time-1',
        nome: 'Leões',
        sigla: 'LEO',
        escudoUrl: null,
      },
      visitante: {
        timeId: 'time-2',
        nome: 'Tigres',
        sigla: 'TIG',
        escudoUrl: null,
      },
      agendamento: { inicioEm: null, campo: null },
      estado: 'ENCERRADA_SUMULA',
      motivoPublico: null,
      resultado: {
        tipo: 'SUMULA',
        placarRegulamentar: { mandante: 2, visitante: 1 },
        placarProrrogacao: null,
        placarPenaltis: null,
      },
      sumulaPublica: {
        gols: [{ autor: 'Ana Gol', time: 'Leões', minuto: 12 }],
        cartoes: [
          {
            jogador: 'Bia Cartão',
            time: 'Tigres',
            minuto: 44,
            tipo: 'amarelo',
          },
        ],
        substituicoes: [
          {
            time: 'Leões',
            minuto: 61,
            sai: 'Carla Sai',
            entra: 'Dani Entra',
          },
        ],
      },
    });

    render(<TelaDetalhesPartida />);

    expect(await screen.findByRole('heading', { name: 'Gols' })).toBeVisible();
    expect(screen.getByText('Ana Gol')).toBeVisible();
    expect(screen.getByRole('region', { name: 'Cartões' })).toHaveTextContent(
      'Bia Cartão',
    );
    expect(
      screen.getByRole('region', { name: 'Substituições' }),
    ).toHaveTextContent('Carla Sai → Dani Entra');
  });

  it('mostra o resultado do jogo e da disputa por pênaltis na súmula', async () => {
    consultarPartida.mockResolvedValue({
      partidaId: 'partida-publica-1',
      campeonato: { id: 'camp-1', nome: 'Copa do Contrato' },
      fase: { id: 'fase-1', nome: 'Final', tipo: 'MATA_MATA' },
      grupo: null,
      rodada: 1,
      confrontoId: 'confronto-1',
      mandante: {
        timeId: 'time-1',
        nome: 'Leões',
        sigla: 'LEO',
        escudoUrl: null,
      },
      visitante: {
        timeId: 'time-2',
        nome: 'Tigres',
        sigla: 'TIG',
        escudoUrl: null,
      },
      agendamento: { inicioEm: null, campo: null },
      estado: 'ENCERRADA_SUMULA',
      motivoPublico: null,
      resultado: {
        tipo: 'SUMULA',
        placarRegulamentar: { mandante: 1, visitante: 1 },
        placarProrrogacao: null,
        placarPenaltis: { mandante: 4, visitante: 3 },
      },
      sumulaPublica: null,
    });

    render(<TelaDetalhesPartida />);

    const resumo = await screen.findByRole('region', {
      name: 'Resumo da partida',
    });
    expect(resumo).toHaveTextContent('Placar no jogo: 1 × 1');
    expect(resumo).toHaveTextContent('Pênaltis: 4 × 3');
  });
});

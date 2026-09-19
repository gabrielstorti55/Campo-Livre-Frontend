import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TelaArtilhariaPublicaCampeonato } from '@/screens/publico/artilharia-publica-campeonato';
import { TelaParticipantesPublicosCampeonato } from '@/screens/publico/participantes-publicos-campeonato';

const consultarArtilharia = vi.fn((_campeonatoId: string, pagina = 1) =>
  Promise.resolve(
    pagina === 1
      ? {
          itens: [
            {
              posicao: 1,
              jogador: {
                nome: 'João',
                nomeUsuario: 'joao',
                fotoUrl: null,
                anonimo: false,
              },
              timeContextual: {
                id: 'time-1',
                nome: 'Leões',
                sigla: 'LEO',
              },
              gols: 3,
              partidasComAtuacao: 2,
            },
          ],
          pagina: 1,
          tamanho: 20,
          totalItens: 2,
          totalPaginas: 2,
        }
      : {
          itens: [
            {
              posicao: 2,
              jogador: {
                nome: 'Carlos',
                nomeUsuario: 'carlos',
                fotoUrl: null,
                anonimo: false,
              },
              timeContextual: {
                id: 'time-2',
                nome: 'Tigres',
                sigla: 'TIG',
              },
              gols: 2,
              partidasComAtuacao: 2,
            },
          ],
          pagina: 2,
          tamanho: 20,
          totalItens: 2,
          totalPaginas: 2,
        },
  ),
);

const listarTimesParticipantes = vi.fn().mockResolvedValue({
  itens: [
    {
      timeId: 'time-1',
      nome: 'Leões',
      sigla: 'LEO',
      escudoUrl: null,
      statusParticipacao: 'ATIVO',
      ordemInscricao: 1,
    },
    {
      timeId: 'time-2',
      nome: 'Tigres antigos',
      sigla: 'TIG',
      escudoUrl: null,
      statusParticipacao: 'INATIVO',
      ordemInscricao: 2,
    },
  ],
  pagina: 1,
  tamanho: 20,
  totalItens: 2,
  totalPaginas: 1,
});

const partidasApi = { consultarArtilharia };
const campeonatosApi = { listarTimesParticipantes };

vi.mock('@/contexts/partidas-api', () => ({
  usePartidasApi: () => partidasApi,
}));
vi.mock('@/contexts/campeonatos-api', () => ({
  useCampeonatosApi: () => campeonatosApi,
}));

describe('projeções públicas completas do campeonato', () => {
  it('carrega e pagina a artilharia sem exibir vazio durante loading', async () => {
    render(<TelaArtilhariaPublicaCampeonato campeonatoId="camp-1" />);

    expect(screen.getByRole('status')).toHaveTextContent(
      'Carregando artilharia',
    );
    expect(screen.queryByText('Ainda não há gols')).not.toBeInTheDocument();
    expect(await screen.findAllByText('João')).not.toHaveLength(0);
    expect(consultarArtilharia).toHaveBeenCalledWith('camp-1', 1, 20);
    consultarArtilharia.mockClear();

    fireEvent.click(
      screen.getByRole('button', { name: 'Carregar mais artilheiros' }),
    );
    expect(await screen.findAllByText('Carlos')).not.toHaveLength(0);
    expect(consultarArtilharia).toHaveBeenCalledWith('camp-1', 2, 20);
  });

  it('consulta participantes publicamente, sem Bearer', async () => {
    render(<TelaParticipantesPublicosCampeonato campeonatoId="camp-1" />);

    expect(await screen.findByText('Leões')).toBeVisible();
    expect(screen.getByText('Participação ativa')).toBeVisible();
    expect(screen.getByText('Participação encerrada')).toBeVisible();
    await waitFor(() =>
      expect(listarTimesParticipantes).toHaveBeenCalledWith(
        'camp-1',
        undefined,
        1,
        20,
      ),
    );
  });
});

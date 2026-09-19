import { describe, expect, it, vi } from 'vitest';

import { carregarPartidasAdministrativas } from '@/services/partidas/carregar-partidas-administrativas';
import type { PartidasApi } from '@/services/partidas/partidas-api';
import type {
  DetalheAdministrativoPartida,
  ItemAgendaPartida,
  PaginaAgendaPartidas,
} from '@/types/api/partidas';

const item = (partidaId: string): ItemAgendaPartida => ({
  partidaId,
  campeonato: { id: 'camp-1', nome: 'Copa' },
  faseId: 'fase-1',
  rodada: 1,
  mandante: { timeId: `m-${partidaId}`, nome: 'Mandante', sigla: 'MAN' },
  visitante: { timeId: `v-${partidaId}`, nome: 'Visitante', sigla: 'VIS' },
  inicioEm: null,
  campo: null,
  estado: 'PENDENTE_AGENDAMENTO',
});

const pagina = (
  itens: ItemAgendaPartida[],
  numero: number,
  totalPaginas: number,
): PaginaAgendaPartidas => ({
  itens,
  pagina: numero,
  tamanho: 100,
  totalItens: 2,
  totalPaginas,
});

const detalhe = (partidaId: string): DetalheAdministrativoPartida =>
  ({ partidaId }) as DetalheAdministrativoPartida;

describe('carregarPartidasAdministrativas', () => {
  it('pagina a agenda e consulta todos os detalhes com o mesmo sinal e token', async () => {
    const signal = new AbortController().signal;
    const listarAgenda = vi
      .fn()
      .mockResolvedValueOnce(pagina([item('p-1')], 1, 2))
      .mockResolvedValueOnce(pagina([item('p-2')], 2, 2));
    const consultarAdministracao = vi
      .fn()
      .mockImplementation((partidaId: string) =>
        Promise.resolve(detalhe(partidaId)),
      );
    const api = {
      listarAgenda,
      consultarAdministracao,
    } as unknown as PartidasApi;
    const executarAutenticado = <T>(
      request: (accessToken: string) => Promise<T>,
    ) => request('token-1');

    const resultado = await carregarPartidasAdministrativas({
      api,
      campeonatoId: 'camp-1',
      executarAutenticado,
      signal,
    });

    expect(resultado.partidas.map(({ partidaId }) => partidaId)).toEqual([
      'p-1',
      'p-2',
    ]);
    expect(resultado.detalhes.map(({ partidaId }) => partidaId)).toEqual([
      'p-1',
      'p-2',
    ]);
    expect(listarAgenda.mock.calls).toEqual([
      [{ campeonatoId: 'camp-1', pagina: 1, tamanho: 100 }, { signal }],
      [{ campeonatoId: 'camp-1', pagina: 2, tamanho: 100 }, { signal }],
    ]);
    expect(consultarAdministracao.mock.calls).toEqual([
      ['p-1', 'token-1', { signal }],
      ['p-2', 'token-1', { signal }],
    ]);
  });
});

import type { PartidasApi } from '@/services/partidas/partidas-api';
import type {
  DetalheAdministrativoPartida,
  ItemAgendaPartida,
} from '@/types/api/partidas';

type ExecutarAutenticado = <T>(
  request: (accessToken: string) => Promise<T>,
) => Promise<T>;

export async function carregarPartidasAdministrativas({
  api,
  campeonatoId,
  executarAutenticado,
  signal,
}: {
  api: PartidasApi;
  campeonatoId: string;
  executarAutenticado: ExecutarAutenticado;
  signal: AbortSignal;
}): Promise<{
  partidas: ItemAgendaPartida[];
  detalhes: DetalheAdministrativoPartida[];
}> {
  const primeiraPagina = await api.listarAgenda(
    { campeonatoId, pagina: 1, tamanho: 100 },
    { signal },
  );
  const itens = [...primeiraPagina.itens];

  for (let pagina = 2; pagina <= primeiraPagina.totalPaginas; pagina += 1) {
    const proximaPagina = await api.listarAgenda(
      { campeonatoId, pagina, tamanho: 100 },
      { signal },
    );
    itens.push(...proximaPagina.itens);
  }

  const detalhes = await executarAutenticado((accessToken) =>
    Promise.all(
      itens.map((partida) =>
        api.consultarAdministracao(partida.partidaId, accessToken, { signal }),
      ),
    ),
  );

  return {
    partidas: itens,
    detalhes,
  };
}

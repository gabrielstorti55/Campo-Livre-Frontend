import type {
  AtletaPublico,
  CampeonatoPublico,
  FiltrosCampeonatoPublico,
  PartidaPublica,
  TimePublico,
} from '@/features/publico/model/public-models';

export type DetalheCampeonatoPublico = {
  campeonato: CampeonatoPublico;
  times: TimePublico[];
  partidas: PartidaPublica[];
  classificacao: Array<{
    time: TimePublico;
    pontos: number;
    jogos: number;
    vitorias: number;
    empates: number;
    derrotas: number;
    golsPro: number;
    golsContra: number;
  }>;
};

export type DetalheTimePublico = {
  time: TimePublico;
  elenco: AtletaPublico[];
  campeonatos: CampeonatoPublico[];
};

/**
 * Porta de consultas da projeção pública.
 *
 * Não representa contrato HTTP, endpoint ou DTO do backend. Os modelos são
 * orientados às telas já confirmadas. Quando o OpenAPI existir, um adapter
 * fará a tradução dos DTOs para estas projeções sem levar URLs às páginas.
 */
export type PublicCatalogPort = {
  listarCampeonatos(filtros?: FiltrosCampeonatoPublico): CampeonatoPublico[];
  obterCampeonato(id: string | number): DetalheCampeonatoPublico | undefined;
  listarTimes(busca?: string): TimePublico[];
  obterTime(id: string | number): DetalheTimePublico | undefined;
  listarPartidas(): PartidaPublica[];
  obterPartida(id: string | number): PartidaPublica | undefined;
  listarAtletas(busca?: string): AtletaPublico[];
  obterAtleta(id: string | number): AtletaPublico | undefined;
};

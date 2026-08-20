import {
  campeonatosOrganizadorMock,
  convitesColaboradorMock,
  reservasOrganizadorMock,
  situacoesComerciaisPorContaMock,
  vinculosCampeonatoOrganizadorMock,
} from '@/mocks/organizador/dados-organizador';
import type { SituacaoComercialOrganizador } from '@/types/organizador';

const situacaoComercialVazia: SituacaoComercialOrganizador = {
  primeiroCampeonatoUtilizado: false,
  direitosAdicionaisDisponiveis: 0,
  contextoPrefeituraIsento: false,
  compras: [],
};

/**
 * Adapter local das necessidades do painel do organizador.
 * Não representa endpoint, DTO HTTP, autorização real ou persistência.
 * O papel é resolvido pela associação conta-campeonato, nunca pelo campeonato.
 */
export const catalogoOrganizadorMock = {
  listarCampeonatos(contaId: string, ids: string[]) {
    const permitidos = new Set(ids.map(Number));
    const vinculos = new Map(
      vinculosCampeonatoOrganizadorMock
        .filter(
          (vinculo) =>
            vinculo.contaId === contaId && permitidos.has(vinculo.campeonatoId),
        )
        .map((vinculo) => [vinculo.campeonatoId, vinculo.papel]),
    );

    return campeonatosOrganizadorMock
      .filter((item) => vinculos.has(item.id))
      .map((item) => ({ ...item, papelDaConta: vinculos.get(item.id)! }));
  },

  obterCampeonato(id: string | number, contaId: string, ids: string[]) {
    return this.listarCampeonatos(contaId, ids).find(
      (item) => item.id === Number(id),
    );
  },

  obterSituacaoComercial(contaId: string) {
    return situacoesComerciaisPorContaMock[contaId] ?? situacaoComercialVazia;
  },

  listarConvitesColaborador(campeonatoId: number) {
    return convitesColaboradorMock.filter(
      (convite) => convite.campeonatoId === campeonatoId,
    );
  },

  listarReservas(campeonatoId: number) {
    return reservasOrganizadorMock.filter(
      (reserva) => reserva.campeonatoId === campeonatoId,
    );
  },
};

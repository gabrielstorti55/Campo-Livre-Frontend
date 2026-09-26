import type { SumulaCompletaPrototipo } from '@/types/api/partidas';

export type ConfrontoGeradoPeloChaveamento = {
  confrontoId: string;
  partidaId: string | null;
  campeonatoId: string;
  faseId: string;
  rodada: number;
  ordem: number;
  timeAId: string | null;
  timeBId: string | null;
  confrontoDestinoId: string | null;
  posicaoDestino: 'A' | 'B' | null;
  resultado: {
    golsTimeA: number;
    golsTimeB: number;
    vencedorTimeId: string;
  } | null;
  sumula: SumulaCompletaPrototipo | null;
};

export type PartidaGeradaPeloChaveamento = {
  partidaId: string;
  campeonatoId: string;
  faseId: string;
  confrontoId: string;
  rodada: number;
  mandanteTimeId: string;
  visitanteTimeId: string;
  resultado: ConfrontoGeradoPeloChaveamento['resultado'];
};

export class PartidasChaveamentoPrototipo {
  private readonly confrontosPorCampeonato = new Map<
    string,
    ConfrontoGeradoPeloChaveamento[]
  >();

  substituir(
    campeonatoId: string,
    confrontos: ConfrontoGeradoPeloChaveamento[],
  ): void {
    this.confrontosPorCampeonato.set(
      campeonatoId,
      confrontos.map((confronto) => ({ ...confronto })),
    );
  }

  listar(): PartidaGeradaPeloChaveamento[] {
    return Array.from(this.confrontosPorCampeonato.values()).flatMap(
      (confrontos) =>
        confrontos.flatMap((confronto) => {
          if (
            !confronto.partidaId ||
            !confronto.timeAId ||
            !confronto.timeBId
          ) {
            return [];
          }
          return [
            {
              partidaId: confronto.partidaId,
              campeonatoId: confronto.campeonatoId,
              faseId: confronto.faseId,
              confrontoId: confronto.confrontoId,
              rodada: confronto.rodada,
              mandanteTimeId: confronto.timeAId,
              visitanteTimeId: confronto.timeBId,
              resultado: confronto.resultado,
            },
          ];
        }),
    );
  }

  registrarResultado(
    partidaId: string,
    golsMandante: number,
    golsVisitante: number,
  ): { vencedorTimeId: string; finalLiberada: boolean } {
    if (golsMandante === golsVisitante) {
      throw new Error('MATA_MATA_EXIGE_VENCEDOR');
    }
    const confrontos = Array.from(this.confrontosPorCampeonato.values()).find(
      (itens) => itens.some((item) => item.partidaId === partidaId),
    );
    const confronto = confrontos?.find((item) => item.partidaId === partidaId);
    if (!confrontos || !confronto || !confronto.timeAId || !confronto.timeBId) {
      throw new Error('PARTIDA_NAO_PERTENCE_AO_CHAVEAMENTO');
    }
    if (confronto.resultado) throw new Error('RESULTADO_JA_REGISTRADO');

    const vencedorTimeId =
      golsMandante > golsVisitante ? confronto.timeAId : confronto.timeBId;
    confronto.resultado = {
      golsTimeA: golsMandante,
      golsTimeB: golsVisitante,
      vencedorTimeId,
    };

    const destino = confronto.confrontoDestinoId
      ? confrontos.find(
          (item) => item.confrontoId === confronto.confrontoDestinoId,
        )
      : null;
    if (destino && confronto.posicaoDestino === 'A') {
      destino.timeAId = vencedorTimeId;
    }
    if (destino && confronto.posicaoDestino === 'B') {
      destino.timeBId = vencedorTimeId;
    }

    return {
      vencedorTimeId,
      finalLiberada: Boolean(destino?.timeAId && destino?.timeBId),
    };
  }

  registrarSumula(
    partidaId: string,
    sumula: SumulaCompletaPrototipo,
  ): { vencedorTimeId: string; finalLiberada: boolean } {
    const confrontos = Array.from(this.confrontosPorCampeonato.values()).find(
      (itens) => itens.some((item) => item.partidaId === partidaId),
    );
    const confronto = confrontos?.find((item) => item.partidaId === partidaId);
    if (!confrontos || !confronto || !confronto.timeAId || !confronto.timeBId) {
      throw new Error('PARTIDA_NAO_PERTENCE_AO_CHAVEAMENTO');
    }
    if (confronto.resultado) throw new Error('RESULTADO_JA_REGISTRADO');
    const vencedorTimeId =
      sumula.golsMandante > sumula.golsVisitante
        ? confronto.timeAId
        : sumula.golsVisitante > sumula.golsMandante
          ? confronto.timeBId
          : (sumula.placarPenaltis?.mandante ?? 0) >
              (sumula.placarPenaltis?.visitante ?? 0)
            ? confronto.timeAId
            : confronto.timeBId;
    confronto.resultado = {
      golsTimeA: sumula.golsMandante,
      golsTimeB: sumula.golsVisitante,
      vencedorTimeId,
    };
    confronto.sumula = structuredClone(sumula);
    const destino = confronto.confrontoDestinoId
      ? confrontos.find(
          (item) => item.confrontoId === confronto.confrontoDestinoId,
        )
      : null;
    if (destino && confronto.posicaoDestino === 'A') {
      destino.timeAId = vencedorTimeId;
    }
    if (destino && confronto.posicaoDestino === 'B') {
      destino.timeBId = vencedorTimeId;
    }
    return {
      vencedorTimeId,
      finalLiberada: Boolean(destino?.timeAId && destino?.timeBId),
    };
  }
}

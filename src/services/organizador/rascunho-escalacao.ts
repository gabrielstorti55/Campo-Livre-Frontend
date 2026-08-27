export type SituacaoEscalacao = 'TITULAR' | 'RESERVA';

export type PosicaoEscalacao =
  'GOLEIRO' | 'ZAGUEIRO' | 'LATERAL' | 'MEIO_CAMPO' | 'ATACANTE';

export type AtletaEscaladoRascunho = {
  atletaId: number;
  nome: string;
  posicaoPrincipal: string;
  situacao: SituacaoEscalacao | null;
  posicaoUsada: PosicaoEscalacao | null;
};

export function criarRascunhoEscalacao(
  atletas: Array<{ id: number; nome: string; posicao: string }>,
): AtletaEscaladoRascunho[] {
  return atletas.map((atleta) => ({
    atletaId: atleta.id,
    nome: atleta.nome,
    posicaoPrincipal: atleta.posicao,
    situacao: null,
    posicaoUsada: null,
  }));
}

export function atualizarEscalado(
  atleta: AtletaEscaladoRascunho,
  alteracao: Pick<AtletaEscaladoRascunho, 'situacao' | 'posicaoUsada'>,
): AtletaEscaladoRascunho {
  return { ...atleta, ...alteracao };
}

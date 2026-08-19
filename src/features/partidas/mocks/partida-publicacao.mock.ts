// Mock exclusivo do frontend para prototipar a publicação do resultado.
// TODO(api): substituir por dados e tipos do contrato oficial quando ele existir.

export type GolResumoPartidaMock = {
  autor: string;
  time: string;
  minuto: number;
};

export type CartaoResumoPartidaMock = {
  jogador: string;
  time: string;
  minuto: number;
  tipo: 'amarelo' | 'vermelho';
};

export type SubstituicaoResumoPartidaMock = {
  time: string;
  minuto: number;
  sai: string;
  entra: string;
};

export type SumulaPublicaMock = {
  gols: GolResumoPartidaMock[];
  cartoes?: CartaoResumoPartidaMock[];
  substituicoes?: SubstituicaoResumoPartidaMock[];
  wo?: {
    vencedor: string;
  };
};

type PublicacaoPartidaMock = {
  resultadoPublicado: boolean;
  sumulaPublica?: SumulaPublicaMock;
  // Existe apenas para garantir que informação administrativa não vaze na tela canônica.
  observacaoAdministrativaMock?: string;
};

const publicacaoPorPartida: Record<string, PublicacaoPartidaMock> = {
  '1': { resultadoPublicado: false },
  '2': { resultadoPublicado: false },
  '3': {
    resultadoPublicado: true,
    sumulaPublica: {
      gols: [
        { autor: 'Marcos Oliveira', time: 'Time A', minuto: 12 },
        { autor: 'Felipe Rocha', time: 'Time A', minuto: 37 },
        { autor: 'Rogério Lima', time: 'Bairro Sul FC', minuto: 51 },
        { autor: 'Lucas Prado', time: 'Time A', minuto: 68 },
      ],
      cartoes: [
        { jogador: 'Diego Souza', time: 'Time A', minuto: 44, tipo: 'amarelo' },
        {
          jogador: 'Rogério Lima',
          time: 'Bairro Sul FC',
          minuto: 73,
          tipo: 'vermelho',
        },
      ],
      substituicoes: [
        {
          time: 'Time A',
          minuto: 61,
          sai: 'Felipe Rocha',
          entra: 'Vitor Nunes',
        },
      ],
    },
    observacaoAdministrativaMock:
      'Revisar documento do árbitro antes do arquivamento.',
  },
  '4': {
    resultadoPublicado: false,
    observacaoAdministrativaMock:
      'Resultado aguardando revisão interna do organizador.',
  },
  '5': { resultadoPublicado: false },
  '6': { resultadoPublicado: false },
};

export function getPublicacaoPartidaMock(
  id: string | number,
): PublicacaoPartidaMock {
  return publicacaoPorPartida[String(id)] ?? { resultadoPublicado: false };
}

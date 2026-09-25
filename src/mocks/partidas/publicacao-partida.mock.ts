// Mock exclusivo do frontend para prototipar a publicação do resultado.
// TODO(api): substituir pelos dados do contrato oficial quando ele existir.

import type { SumulaPublica } from '@/types/publico';

type PublicacaoPartidaMock = {
  resultadoPublicado: boolean;
  sumulaPublica?: SumulaPublica;
};

const publicacaoPorPartida: Record<string, PublicacaoPartidaMock> = {
  '1': { resultadoPublicado: false },
  '2': { resultadoPublicado: false },
  '3': {
    resultadoPublicado: true,
    sumulaPublica: {
      gols: [
        { autor: 'Marcos Oliveira', time: 'Vila Nova FC', minuto: 12 },
        { autor: 'Bruno Alves', time: 'Vila Nova FC', minuto: 37 },
        { autor: 'Eduardo Nunes', time: 'Bairro Sul FC', minuto: 51 },
        { autor: 'Marcos Oliveira', time: 'Vila Nova FC', minuto: 68 },
      ],
      cartoes: [
        {
          jogador: 'Diego Souza',
          time: 'Vila Nova FC',
          minuto: 44,
          tipo: 'amarelo',
        },
        {
          jogador: 'Eduardo Nunes',
          time: 'Bairro Sul FC',
          minuto: 73,
          tipo: 'vermelho',
        },
      ],
      substituicoes: [
        {
          time: 'Vila Nova FC',
          minuto: 61,
          sai: 'Bruno Alves',
          entra: 'Gabriel Martins',
        },
      ],
    },
  },
  '4': { resultadoPublicado: false },
  '5': { resultadoPublicado: false },
  '6': { resultadoPublicado: false },
};

export function obterPublicacaoPartidaMock(
  id: string | number,
): PublicacaoPartidaMock {
  return publicacaoPorPartida[String(id)] ?? { resultadoPublicado: false };
}

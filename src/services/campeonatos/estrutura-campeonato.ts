import type {
  ConfiguracaoFase,
  FormatoCampeonato,
} from '@/types/api/campeonatos';

export type OpcoesEstruturaCampeonato = {
  turnos: 'TURNO_UNICO' | 'TURNO_E_RETORNO';
  quantidadeGrupos: number;
  classificadosPorGrupo: number;
  numeroPartidasConfronto: 1 | 2;
};

export function criarFasesPadrao(
  formato: FormatoCampeonato,
  opcoes: OpcoesEstruturaCampeonato,
): ConfiguracaoFase[] {
  if (formato === 'MATA_MATA') {
    return [
      {
        nome: 'Mata-mata',
        tipo: 'MATA_MATA',
        ordem: 1,
        turnos: null,
        pontosVitoria: null,
        pontosEmpate: null,
        pontosDerrota: null,
        quantidadeGrupos: null,
        classificadosPorGrupo: null,
        numeroPartidasConfronto: opcoes.numeroPartidasConfronto,
        permiteProrrogacao: true,
        permitePenaltis: true,
        golDeOuro: false,
      },
    ];
  }

  if (formato === 'GRUPOS_E_MATA_MATA') {
    return [
      {
        nome: 'Fase de grupos',
        tipo: 'GRUPOS',
        ordem: 1,
        turnos: opcoes.turnos,
        pontosVitoria: 3,
        pontosEmpate: 1,
        pontosDerrota: 0,
        quantidadeGrupos: opcoes.quantidadeGrupos,
        classificadosPorGrupo: opcoes.classificadosPorGrupo,
        numeroPartidasConfronto: null,
        permiteProrrogacao: null,
        permitePenaltis: null,
        golDeOuro: null,
      },
      {
        nome: 'Mata-mata',
        tipo: 'MATA_MATA',
        ordem: 2,
        turnos: null,
        pontosVitoria: null,
        pontosEmpate: null,
        pontosDerrota: null,
        quantidadeGrupos: null,
        classificadosPorGrupo: null,
        numeroPartidasConfronto: opcoes.numeroPartidasConfronto,
        permiteProrrogacao: true,
        permitePenaltis: true,
        golDeOuro: false,
      },
    ];
  }

  return [
    {
      nome: 'Pontos corridos',
      tipo: 'PONTOS_CORRIDOS',
      ordem: 1,
      turnos: opcoes.turnos,
      pontosVitoria: 3,
      pontosEmpate: 1,
      pontosDerrota: 0,
      quantidadeGrupos: null,
      classificadosPorGrupo: null,
      numeroPartidasConfronto: null,
      permiteProrrogacao: null,
      permitePenaltis: null,
      golDeOuro: null,
    },
  ];
}

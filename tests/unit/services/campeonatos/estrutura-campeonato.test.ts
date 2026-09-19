import { describe, expect, it } from 'vitest';

import { criarFasesPadrao } from '@/services/campeonatos/estrutura-campeonato';

describe('templates documentados da estrutura do campeonato', () => {
  it('materializa pontos corridos como uma fase classificatória', () => {
    expect(
      criarFasesPadrao('PONTOS_CORRIDOS', {
        turnos: 'TURNO_UNICO',
        quantidadeGrupos: 2,
        classificadosPorGrupo: 2,
        numeroPartidasConfronto: 1,
      }),
    ).toEqual([
      {
        nome: 'Pontos corridos',
        tipo: 'PONTOS_CORRIDOS',
        ordem: 1,
        turnos: 'TURNO_UNICO',
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
    ]);
  });

  it('materializa mata-mata como uma fase eliminatória', () => {
    expect(
      criarFasesPadrao('MATA_MATA', {
        turnos: 'TURNO_UNICO',
        quantidadeGrupos: 2,
        classificadosPorGrupo: 2,
        numeroPartidasConfronto: 2,
      }),
    ).toEqual([
      expect.objectContaining({
        nome: 'Mata-mata',
        tipo: 'MATA_MATA',
        ordem: 1,
        turnos: null,
        numeroPartidasConfronto: 2,
        permiteProrrogacao: true,
        permitePenaltis: true,
      }),
    ]);
  });

  it('materializa grupos seguidos de mata-mata', () => {
    const fases = criarFasesPadrao('GRUPOS_E_MATA_MATA', {
      turnos: 'TURNO_UNICO',
      quantidadeGrupos: 4,
      classificadosPorGrupo: 2,
      numeroPartidasConfronto: 1,
    });

    expect(fases).toHaveLength(2);
    expect(fases[0]).toMatchObject({
      nome: 'Fase de grupos',
      tipo: 'GRUPOS',
      ordem: 1,
      quantidadeGrupos: 4,
      classificadosPorGrupo: 2,
    });
    expect(fases[1]).toMatchObject({
      nome: 'Mata-mata',
      tipo: 'MATA_MATA',
      ordem: 2,
      numeroPartidasConfronto: 1,
    });
  });
});

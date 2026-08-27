import { describe, expect, it } from 'vitest';

import {
  atualizarEscalado,
  criarRascunhoEscalacao,
} from '@/services/organizador/rascunho-escalacao';

describe('rascunho de escalação', () => {
  it('separa posição principal de situação e posição efetivamente usada', () => {
    const rascunho = criarRascunhoEscalacao([
      { id: 7, nome: 'Ana', posicao: 'Atacante' },
    ]);
    const atleta = rascunho[0];

    expect(atleta).toBeDefined();
    if (!atleta) throw new Error('Atleta esperado no rascunho');

    expect(atleta).toEqual({
      atletaId: 7,
      nome: 'Ana',
      posicaoPrincipal: 'Atacante',
      situacao: null,
      posicaoUsada: null,
    });

    const atualizado = atualizarEscalado(atleta, {
      situacao: 'TITULAR',
      posicaoUsada: 'GOLEIRO',
    });

    expect(atualizado.posicaoPrincipal).toBe('Atacante');
    expect(atualizado.situacao).toBe('TITULAR');
    expect(atualizado.posicaoUsada).toBe('GOLEIRO');
  });
});

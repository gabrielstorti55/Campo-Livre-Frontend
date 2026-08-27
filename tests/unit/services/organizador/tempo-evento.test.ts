import { describe, expect, it } from 'vitest';

import {
  criarTempoEvento,
  formatarTempoEvento,
} from '@/services/organizador/tempo-evento';

describe('tempo estruturado dos eventos da súmula', () => {
  it('preserva período, minuto regulamentar e acréscimo sem minuto absoluto', () => {
    const tempo = criarTempoEvento('segundo-tempo', '45', '3');

    expect(tempo).toEqual({
      periodo: 'segundo-tempo',
      minutoRegulamentar: 45,
      acrescimo: 3,
    });
    expect(tempo).not.toHaveProperty('minutoAbsoluto');
    expect(formatarTempoEvento(tempo)).toBe("Segundo tempo · 45+3'");
  });

  it('representa ausência de acréscimo com null', () => {
    expect(criarTempoEvento('primeiro-tempo', '12', '')).toEqual({
      periodo: 'primeiro-tempo',
      minutoRegulamentar: 12,
      acrescimo: null,
    });
  });
});

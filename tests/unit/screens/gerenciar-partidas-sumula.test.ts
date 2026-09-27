import { describe, expect, it } from 'vitest';

import { podePreencherSumula } from '@/screens/organizador/gerenciar-partidas';

describe('entrada da Súmula na administração de partidas', () => {
  it('usa a autorização contextual do backend no integrado', () => {
    expect(
      podePreencherSumula({
        prototipo: false,
        partidaId: 'uuid-sem-convencao-textual',
        estado: 'AGENDADA',
        operacoesPermitidas: ['PUBLICAR_SUMULA'],
      }),
    ).toBe(true);
  });

  it('preserva a entrada demonstrativa do mata-mata no protótipo', () => {
    expect(
      podePreencherSumula({
        prototipo: true,
        partidaId: 'camp-8-mata-mata-semifinal-1',
        estado: 'AGENDADA',
        operacoesPermitidas: [],
      }),
    ).toBe(true);
  });

  it('não oferece a operação quando nenhum dos modos a suporta', () => {
    expect(
      podePreencherSumula({
        prototipo: false,
        partidaId: 'partida-1',
        estado: 'AGENDADA',
        operacoesPermitidas: [],
      }),
    ).toBe(false);
  });
});

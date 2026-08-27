import { describe, expect, it } from 'vitest';

import { resolverModoAplicacao } from '@/config/modo-aplicacao';

describe('resolverModoAplicacao', () => {
  it('mantém produção sempre no modo integrado', () => {
    expect(
      resolverModoAplicacao({
        nodeEnv: 'production',
        modoSolicitado: 'prototipo',
      }),
    ).toBe('integrado');
  });

  it('exige ativação explícita do protótipo fora de produção', () => {
    expect(
      resolverModoAplicacao({
        nodeEnv: 'development',
        modoSolicitado: undefined,
      }),
    ).toBe('integrado');
    expect(
      resolverModoAplicacao({
        nodeEnv: 'development',
        modoSolicitado: 'prototipo',
      }),
    ).toBe('prototipo');
  });

  it('ignora valores desconhecidos em vez de habilitar protótipo', () => {
    expect(
      resolverModoAplicacao({
        nodeEnv: 'test',
        modoSolicitado: 'fake',
      }),
    ).toBe('integrado');
  });
});

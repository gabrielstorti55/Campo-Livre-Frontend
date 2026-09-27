import { describe, expect, it } from 'vitest';

import { resolverModoAplicacao } from '@/config/modo-aplicacao';

describe('resolverModoAplicacao', () => {
  it('usa a experiência híbrida como modo único padrão de desenvolvimento', () => {
    expect(
      resolverModoAplicacao({
        nodeEnv: 'development',
        modoSolicitado: undefined,
      }),
    ).toBe('hibrido');
  });

  it('aceita a experiência híbrida explicitamente em desenvolvimento ou apresentação publicada', () => {
    expect(
      resolverModoAplicacao({
        nodeEnv: 'test',
        modoSolicitado: 'hibrido',
      }),
    ).toBe('hibrido');
    expect(
      resolverModoAplicacao({
        nodeEnv: 'production',
        modoSolicitado: 'hibrido',
      }),
    ).toBe('hibrido');
  });

  it('mantém produção sempre no modo integrado', () => {
    expect(
      resolverModoAplicacao({
        nodeEnv: 'production',
        modoSolicitado: 'prototipo',
      }),
    ).toBe('integrado');
  });

  it('preserva o protótipo legado apenas quando solicitado explicitamente', () => {
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

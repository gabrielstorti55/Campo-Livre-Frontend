import { describe, expect, it } from 'vitest';

import { obterDestinoPosLogin } from '@/services/autenticacao/navegacao-sessao';
import type { SessaoPessoal } from '@/types/sessao';

const session = {
  activeContext: null,
} as SessaoPessoal;

describe('obterDestinoPosLogin', () => {
  it('aceita somente um caminho interno absoluto', () => {
    expect(obterDestinoPosLogin('/minha-conta?aba=dados', session)).toBe(
      '/minha-conta?aba=dados',
    );
  });

  it.each([
    'https://malicioso.test',
    '//malicioso.test/roubo',
    '/\\malicioso.test',
    'javascript:alert(1)',
  ])('rejeita destino inseguro: %s', (candidate) => {
    expect(obterDestinoPosLogin(candidate, session)).toBe('/minha-area');
  });
});

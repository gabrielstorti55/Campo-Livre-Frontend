import { describe, expect, it } from 'vitest';

import {
  obterDestinoPosLogin,
  obterInicioContexto,
} from '@/services/autenticacao/navegacao-sessao';
import type { SessaoPessoal } from '@/types/sessao';

const session = {
  activeContext: null,
} as SessaoPessoal;

describe('obterDestinoPosLogin', () => {
  it.each([
    null,
    '/atleta/inicio',
    '/organizador/campeonatos',
    '/prefeitura/painel',
    '/minha-conta?aba=dados',
    'https://malicioso.test',
  ])('sempre inicia pela Minha área, ignorando o destino %s', (candidate) => {
    expect(obterDestinoPosLogin(candidate, session)).toBe('/minha-area');
  });
});

describe('obterInicioContexto', () => {
  it('abre Times e convites ao entrar como atleta', () => {
    expect(obterInicioContexto('atleta')).toBe('/atleta/time/buscar');
  });

  it('abre Meus Campeonatos ao entrar como organizador', () => {
    expect(obterInicioContexto('organizador')).toBe('/organizador/campeonatos');
  });
});

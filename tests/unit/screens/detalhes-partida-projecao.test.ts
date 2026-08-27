import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { obterPublicacaoPartidaMock } from '@/mocks/partidas/publicacao-partida.mock';

describe('projeção pública do detalhe da partida', () => {
  it('não entrega observações administrativas ao consumidor público', () => {
    expect(obterPublicacaoPartidaMock(3)).not.toHaveProperty(
      'observacaoAdministrativaMock',
    );
  });

  it('não leva o catálogo completo de atletas nem o PDF restrito para a tela pública', () => {
    const fonte = readFileSync(
      resolve(process.cwd(), 'src/screens/publico/detalhes-partida.tsx'),
      'utf8',
    );

    expect(fonte).not.toContain('@/mocks/publico/dados-publicos');
    expect(fonte).not.toContain('partida.pdfSumula');
  });
});

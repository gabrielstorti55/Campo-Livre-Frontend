import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const arquivosComerciais = [
  'src/types/organizador.ts',
  'src/mocks/organizador/dados-organizador.ts',
  'src/services/organizador/catalogo-organizador.mock.ts',
  'src/screens/organizador/inicio.tsx',
  'src/screens/organizador/criar-campeonato.tsx',
  'src/screens/organizador/perfil.tsx',
];

describe('modelo comercial do organizador', () => {
  it('não representa campeonatos adicionais como créditos reutilizáveis', () => {
    const fontes = arquivosComerciais
      .map((arquivo) => readFileSync(resolve(process.cwd(), arquivo), 'utf8'))
      .join('\n');

    expect(fontes).not.toContain('direitosAdicionaisDisponiveis');
    expect(fontes).not.toMatch(/direito adicional dispon[ií]vel/i);
    expect(fontes).not.toMatch(/reservar ao salvar/i);
  });

  it('representa checkout externo do Mercado Pago vinculado ao campeonato', () => {
    const fontes = arquivosComerciais
      .map((arquivo) => readFileSync(resolve(process.cwd(), arquivo), 'utf8'))
      .join('\n');

    expect(fontes).toContain('MERCADO_PAGO');
    expect(fontes).not.toContain("meio: 'PIX'");
    expect(fontes).toMatch(/pagamento pr[oó]prio/i);
  });
});

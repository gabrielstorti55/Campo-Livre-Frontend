import { describe, expect, it } from 'vitest';

import { catalogoPublicoMock } from '@/services/publico/catalogo-publico.mock';
import { atletasPublicosMock } from '@/mocks/publico/dados-publicos';

describe('projeção pública de atletas no MVP', () => {
  it('não permite ocultar um perfil esportivo existente', () => {
    expect(catalogoPublicoMock.listarAtletas()).toHaveLength(
      atletasPublicosMock.length,
    );
    expect(catalogoPublicoMock.listarAtletas()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ nome: 'Rafael Lima' }),
      ]),
    );
  });

  it('não carrega métricas ou conquistas fora da allowlist aprovada', () => {
    for (const atleta of atletasPublicosMock) {
      expect(atleta).not.toHaveProperty('perfilPublico');
      expect(atleta).not.toHaveProperty('assistenciasPublicadas');
      expect(atleta).not.toHaveProperty('conquistas');
    }
  });
});

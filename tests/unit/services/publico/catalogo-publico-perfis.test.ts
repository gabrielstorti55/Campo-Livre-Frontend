import { describe, expect, it } from 'vitest';

import { catalogoPublicoMock } from '@/services/publico/catalogo-publico.mock';
import {
  atletasPublicosMock,
  timesPublicosMock,
} from '@/mocks/publico/dados-publicos';

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

  it('mantém todo atleta com estatísticas vinculado a pelo menos um time', () => {
    for (const atleta of atletasPublicosMock) {
      if (atleta.partidasPublicadas > 0 || atleta.golsPublicados > 0) {
        expect(atleta.historicoTimes, atleta.nome).not.toHaveLength(0);
      }
    }
  });

  it('publica elencos coerentes com ao menos sete atletas por time', () => {
    const atletasPorId = new Map(
      atletasPublicosMock.map((atleta) => [atleta.id, atleta]),
    );

    for (const time of timesPublicosMock.filter((item) => item.publicado)) {
      expect(time.atletaIds, time.nome).toHaveLength(7);
      for (const atletaId of time.atletaIds) {
        const atleta = atletasPorId.get(atletaId);
        expect(atleta, `${time.nome} → atleta ${atletaId}`).toBeDefined();
        expect(
          atleta?.historicoTimes.some(
            (vinculo) => vinculo.time === time.nome && !vinculo.fim,
          ),
          `${atleta?.nome ?? atletaId} sem vínculo ativo com ${time.nome}`,
        ).toBe(true);
      }
    }
  });
});

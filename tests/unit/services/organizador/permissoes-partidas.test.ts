import { describe, expect, it } from 'vitest';

import { podeRegistrarWo } from '@/services/organizador/permissoes-partidas';

describe('permissões contextuais de partidas', () => {
  it('reserva o registro de WO ao responsável do campeonato', () => {
    expect(podeRegistrarWo('RESPONSAVEL')).toBe(true);
    expect(podeRegistrarWo('ORGANIZADOR')).toBe(false);
  });
});

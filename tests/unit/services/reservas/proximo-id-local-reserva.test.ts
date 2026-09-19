import { describe, expect, it } from 'vitest';

import { proximoIdLocalReserva } from '@/services/reservas/proximo-id-local-reserva';

describe('proximoIdLocalReserva', () => {
  it('não reutiliza identificador que já migrou para a projeção municipal', () => {
    expect(proximoIdLocalReserva([1], [1, 2])).toBe(3);
  });

  it('ignora identificadores municipais ausentes', () => {
    expect(proximoIdLocalReserva([], [undefined])).toBe(1);
  });
});

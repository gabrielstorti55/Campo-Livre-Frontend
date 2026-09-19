import { describe, expect, it, vi } from 'vitest';

import { criarGeradorIdEvento } from '@/services/sumula/proximo-id-evento';

describe('criarGeradorIdEvento', () => {
  it('gera ids distintos mesmo quando o relógio não avança', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_787_497_200_000);
    const proximoId = criarGeradorIdEvento();

    expect([proximoId(), proximoId(), proximoId()]).toEqual([
      1_787_497_200_000, 1_787_497_200_001, 1_787_497_200_002,
    ]);
  });
});

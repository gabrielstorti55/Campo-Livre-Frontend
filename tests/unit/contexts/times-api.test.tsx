import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { ProvedorTimesApi, useTimesApi } from '@/contexts/times-api';
import type { TimesApi } from '@/services/times/times-api';

describe('ProvedorTimesApi', () => {
  it('entrega à tela somente o contrato do domínio', () => {
    const api: TimesApi = {
      removerAtleta: vi.fn(),
      sairDoTime: vi.fn(),
      transferirCapitania: vi.fn(),
      listarHistoricoElenco: vi.fn(),
      desativarTime: vi.fn(),
      reativarTime: vi.fn(),
      buscarAtletaParaConvite: vi.fn(),
      enviarConvite: vi.fn(),
      reenviarConvite: vi.fn(),
      cancelarConvite: vi.fn(),
      enviarEscudo: vi.fn(),
      removerEscudo: vi.fn(),
      atualizarTime: vi.fn(),
      consultarTime: vi.fn(),
      listarElenco: vi.fn(),
      listarTimes: vi.fn(),
      listarMeusConvites: vi.fn(),
    };
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ProvedorTimesApi api={api}>{children}</ProvedorTimesApi>
    );

    const { result } = renderHook(() => useTimesApi(), { wrapper });

    expect(result.current).toBe(api);
  });
});

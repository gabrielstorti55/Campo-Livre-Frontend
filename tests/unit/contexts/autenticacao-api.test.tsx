import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import {
  ProvedorAutenticacaoApi,
  useAutenticacaoApi,
} from '@/contexts/autenticacao-api';
import type { AutenticacaoApi } from '@/services/autenticacao/autenticacao-api';

describe('ProvedorAutenticacaoApi', () => {
  it('entrega a mesma interface selecionada pela composição da aplicação', () => {
    const api = {} as AutenticacaoApi;
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ProvedorAutenticacaoApi api={api}>{children}</ProvedorAutenticacaoApi>
    );

    const { result } = renderHook(() => useAutenticacaoApi(), { wrapper });

    expect(result.current).toBe(api);
  });
});

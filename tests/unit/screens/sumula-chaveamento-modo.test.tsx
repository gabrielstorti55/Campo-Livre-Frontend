import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TelaSumulaChaveamento } from '@/screens/organizador/sumula-chaveamento';

vi.mock('@/screens/organizador/sumula-integrada', () => ({
  TelaSumulaIntegrada: ({
    campeonatoId,
    partidaId,
  }: {
    campeonatoId: string;
    partidaId: string;
  }) => <p>{`Integrada ${campeonatoId} ${partidaId}`}</p>,
}));

vi.mock('@/contexts/partidas-api', () => ({
  usePartidasApi: () => ({}),
}));

vi.mock('@/hooks/use-sessao', () => ({
  useSessao: () => ({
    hydrated: true,
    session: { prototipo: false },
    executarAutenticado: vi.fn(),
  }),
}));

describe('seleção da Súmula por modo', () => {
  it('usa a jornada HTTP no integrado em vez do bloqueio antigo', () => {
    render(
      <TelaSumulaChaveamento campeonatoId="camp-1" partidaId="partida-1" />,
    );

    expect(screen.getByText('Integrada camp-1 partida-1')).toBeVisible();
    expect(
      screen.queryByText('Súmula integrada indisponível'),
    ).not.toBeInTheDocument();
  });
});

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TelaGerenciarPartidas } from '@/screens/organizador/gerenciar-partidas';

const { registrarPartidaDefinitiva } = vi.hoisted(() => ({
  registrarPartidaDefinitiva: vi.fn(),
}));

vi.mock('@/hooks/use-sessao', () => ({
  useSessao: () => ({
    hydrated: true,
    session: {
      account: { id: 'responsavel-1' },
      links: { organizedChampionshipIds: ['1'] },
    },
  }),
}));

vi.mock('@/services/organizador/catalogo-organizador.mock', () => ({
  catalogoOrganizadorMock: {
    obterCampeonato: () => ({
      id: 1,
      nome: 'Copa Teste',
      estado: 'EM_ANDAMENTO',
      papelDaConta: 'RESPONSAVEL',
    }),
  },
}));

vi.mock('@/stores/estado-operacional-organizador', () => ({
  useEstadoOperacionalOrganizador: () => ({
    estado: {
      estado: 'EM_ANDAMENTO',
      partidaEstados: { 1: 'AGENDADA' },
      fatosDefinitivos: {},
    },
    atualizarEstadoPartida: vi.fn(),
    registrarPartidaDefinitiva,
  }),
}));

vi.mock('@/services/publico/catalogo-publico.mock', () => ({
  catalogoPublicoMock: {
    listarPartidas: () => [
      {
        id: 1,
        campeonatoId: 1,
        timeCasaId: 10,
        timeForaId: 20,
        rodada: 'Rodada 1',
        estado: 'AGENDADA',
        resultadoPublicado: false,
      },
    ],
  },
  obterNomeCampoPartida: () => 'Campo Teste',
  obterNomeTimePublico: (id: number) => (id === 10 ? 'Time A' : 'Time B'),
}));

describe('registro definitivo de WO', () => {
  it('só registra depois da confirmação explícita', () => {
    render(<TelaGerenciarPartidas campeonatoId="1" />);

    fireEvent.click(
      screen.getByRole('button', { name: 'Registrar WO na partida 1' }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Revisar WO definitivo' }),
    );

    expect(registrarPartidaDefinitiva).not.toHaveBeenCalled();
    expect(
      screen.getByRole('alertdialog', {
        name: 'Confirma o registro definitivo do WO?',
      }),
    ).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar registro' }));
    expect(registrarPartidaDefinitiva).not.toHaveBeenCalled();

    fireEvent.click(
      screen.getByRole('button', { name: 'Revisar WO definitivo' }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Registrar WO definitivo' }),
    );

    expect(registrarPartidaDefinitiva).toHaveBeenCalledTimes(1);
  });
});

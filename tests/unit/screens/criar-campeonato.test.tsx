import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ProvedorCampeonatosApi } from '@/contexts/campeonatos-api';
import { ProvedorMunicipiosApi } from '@/contexts/municipios-api';
import { ProvedorPrefeiturasApi } from '@/contexts/prefeituras-api';
import { TelaCriarCampeonato } from '@/screens/organizador/criar-campeonato';
import type { CampeonatosApi } from '@/services/campeonatos/campeonatos-api';
import type { MunicipiosApi } from '@/services/municipios/municipios-api';
import type { PrefeiturasApi } from '@/services/prefeituras/prefeituras-api';

const push = vi.fn();
const executarAutenticado = <T,>(request: (token: string) => Promise<T>) =>
  request('access-token');
const session = {
  account: { id: 'conta-1', name: 'Ana Souza' },
};

vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
vi.mock('@/hooks/use-sessao', () => ({
  useSessao: () => ({
    session,
    executarAutenticado,
  }),
}));

const municipios: MunicipiosApi = {
  listarMunicipios: vi.fn().mockResolvedValue({
    itens: [
      {
        id: 'municipio-franca',
        nome: 'Franca',
        uf: 'SP',
        codigoIbge: '3516200',
      },
    ],
    pagina: 1,
    tamanho: 100,
    totalItens: 1,
    totalPaginas: 1,
  }),
};
const prefeituras: PrefeiturasApi = {
  listarMinhasPrefeituras: vi.fn().mockResolvedValue({
    itens: [
      {
        membroId: 'membro-prefeitura-1',
        papel: 'RESPONSAVEL',
        iniciadoEm: '2026-01-01T00:00:00.000Z',
        prefeitura: {
          id: 'prefeitura-franca',
          nomeOficial: 'Prefeitura de Franca',
          status: 'ATIVA',
          municipio: { id: 'municipio-franca', nome: 'Franca', uf: 'SP' },
          emailContatoPublico: 'esporte@franca.sp.gov.br',
          telefoneContatoPublico: null,
        },
      },
    ],
    pagina: 1,
    tamanho: 100,
    totalItens: 1,
    totalPaginas: 1,
  }),
};

function renderizar(criarCampeonato: CampeonatosApi['criarCampeonato']) {
  render(
    <ProvedorMunicipiosApi api={municipios}>
      <ProvedorPrefeiturasApi api={prefeituras}>
        <ProvedorCampeonatosApi api={{ criarCampeonato } as CampeonatosApi}>
          <TelaCriarCampeonato />
        </ProvedorCampeonatosApi>
      </ProvedorPrefeiturasApi>
    </ProvedorMunicipiosApi>,
  );
}

describe('TelaCriarCampeonato', () => {
  it('cria com os cinco dados iniciais e entra no workspace retornado', async () => {
    const criarCampeonato = vi.fn().mockResolvedValue({
      id: 'campeonato-9',
      status: 'EM_INSCRICOES',
      responsavelUsuarioId: 'usuario-1',
      situacaoComercial: 'AUTORIZADO',
      origemAutorizacao: 'BENEFICIO',
      pagamentoNecessario: false,
    });
    renderizar(criarCampeonato);

    await screen.findByRole('option', { name: 'Franca — SP' });
    expect(
      await screen.findByRole('option', { name: 'Prefeitura de Franca' }),
    ).toBeVisible();

    fireEvent.change(screen.getByLabelText('Nome do campeonato'), {
      target: { value: 'Copa Franca 2026' },
    });
    fireEvent.change(screen.getByLabelText('Contexto responsável'), {
      target: { value: 'prefeitura-franca' },
    });
    fireEvent.change(screen.getByLabelText('Data prevista de início'), {
      target: { value: '2026-09-10' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Criar campeonato' }));

    await waitFor(() =>
      expect(criarCampeonato).toHaveBeenCalledWith(
        'access-token',
        {
          nome: 'Copa Franca 2026',
          municipioId: 'municipio-franca',
          contexto: 'PREFEITURA',
          prefeituraId: 'prefeitura-franca',
          formato: 'PONTOS_CORRIDOS',
          inicioPrevistoEm: '2026-09-10',
        },
        expect.any(String),
      ),
    );
    expect(push).toHaveBeenCalledWith('/organizador/campeonato/campeonato-9');
  });
});

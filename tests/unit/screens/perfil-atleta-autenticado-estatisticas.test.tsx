import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TelaPerfilAtletaAutenticado } from '@/screens/atleta/perfil';

const contaMarcos = {
  id: 'mock-person-1',
  nome: 'Marcos Oliveira',
  nomeUsuario: 'marcosoliveira',
  email: 'pessoa@campolivre.test',
  cpf: '00000000000',
  rg: { numero: '000000000', orgaoExpedidor: 'SSP', uf: 'SP' },
  dataNascimento: '1995-05-10',
  idade: 31,
  municipio: { id: 'municipio-franca', nome: 'Franca', uf: 'SP' },
  fotoUrl: null,
  biografia: 'Atacante de Franca com foco em competições municipais.',
  posicaoPrincipal: 'ATACANTE',
  status: 'ATIVA',
  administrador: false,
  organizadorHabilitado: true,
  criadoEm: '2026-01-01T00:00:00.000Z',
  atualizadoEm: '2026-01-01T00:00:00.000Z',
};

const contaDiego = {
  ...contaMarcos,
  id: 'mock-person-athlete-1',
  nome: 'Diego Souza',
  nomeUsuario: 'diegosouza',
  email: 'atleta@campolivre.test',
  biografia: null,
  posicaoPrincipal: 'ZAGUEIRO',
  organizadorHabilitado: false,
};

const contaHenrique = {
  ...contaMarcos,
  id: 'mock-person-captain-2',
  nome: 'Henrique Alves',
  nomeUsuario: 'henriquealves',
  email: 'capitao2@campolivre.test',
  biografia: null,
  organizadorHabilitado: false,
};

let contaAtiva: typeof contaMarcos | typeof contaDiego | typeof contaHenrique =
  contaMarcos;

vi.mock('@/contexts/autenticacao-api', () => ({
  useAutenticacaoApi: () => ({
    atualizarMinhaConta: vi.fn(),
    enviarFotoMinhaConta: vi.fn(),
    removerFotoMinhaConta: vi.fn(),
  }),
}));

vi.mock('@/contexts/municipios-api', () => ({
  useMunicipiosApi: () => ({
    listarMunicipios: vi.fn().mockResolvedValue({
      itens: [contaMarcos.municipio],
      pagina: 1,
      tamanho: 100,
      totalItens: 1,
      totalPaginas: 1,
    }),
  }),
}));

vi.mock('@/hooks/use-sessao', () => ({
  useSessao: () => ({
    session: { prototipo: true, minhaConta: contaAtiva },
    executarAutenticado: <T,>(op: (token: string) => Promise<T>) => op('token'),
    recarregarMinhaConta: vi.fn(),
  }),
}));

function esperarEstatisticas(partidas: string, gols: string) {
  const estatisticas = screen.getByRole('region', {
    name: 'Suas estatísticas',
  });
  expect(within(estatisticas).getByText(partidas)).toBeVisible();
  expect(within(estatisticas).getByText('Partidas')).toBeVisible();
  expect(within(estatisticas).getByText(gols)).toBeVisible();
  expect(within(estatisticas).getByText('Gols')).toBeVisible();
}

describe('perfil autenticado do atleta no protótipo', () => {
  beforeEach(() => {
    contaAtiva = contaMarcos;
  });

  it('mostra ao Marcos as próprias estatísticas publicadas', () => {
    render(<TelaPerfilAtletaAutenticado />);
    esperarEstatisticas('14', '7');
  });

  it('mostra ao Diego as próprias estatísticas publicadas', () => {
    contaAtiva = contaDiego;
    render(<TelaPerfilAtletaAutenticado />);
    esperarEstatisticas('11', '1');
  });

  it('mostra ao Henrique as próprias estatísticas publicadas', () => {
    contaAtiva = contaHenrique;
    render(<TelaPerfilAtletaAutenticado />);
    esperarEstatisticas('13', '5');
  });

  it('mostra os títulos conquistados pelo Marcos', () => {
    render(<TelaPerfilAtletaAutenticado />);

    const titulos = screen.getByRole('region', {
      name: 'Títulos conquistados',
    });
    expect(within(titulos).getByText('Copa Franca 2025')).toBeVisible();
    expect(within(titulos).getByText('Torneio dos Bairros 2024')).toBeVisible();
    expect(within(titulos).getAllByText(/Campeão ·/)).toHaveLength(2);
  });
});

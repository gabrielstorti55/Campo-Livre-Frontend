import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TelaPerfilAtletaAutenticado } from '@/screens/atleta/perfil';

const atualizarMinhaConta = vi.fn().mockResolvedValue({});
const recarregarMinhaConta = vi.fn().mockResolvedValue({});
const municipiosApi = {
  listarMunicipios: vi.fn(function (this: unknown) {
    expect(this).toBe(municipiosApi);
    return Promise.resolve({
      itens: [
        {
          id: 'mun-franca',
          nome: 'Franca',
          uf: 'SP',
          codigoIbge: '3516200',
        },
        {
          id: 'mun-restinga',
          nome: 'Restinga',
          uf: 'SP',
          codigoIbge: '3542709',
        },
      ],
      pagina: 1,
      tamanho: 100,
      totalItens: 2,
      totalPaginas: 1,
    });
  }),
};
const conta = {
  id: 'u1',
  nome: 'Gabriel',
  nomeUsuario: 'gabriel',
  email: 'g@example.test',
  cpf: null,
  rg: { numero: null, orgaoExpedidor: null, uf: null },
  dataNascimento: null,
  idade: null,
  municipio: { id: 'mun-franca', nome: 'Franca', uf: 'SP' },
  fotoUrl: null,
  biografia: null,
  posicaoPrincipal: null,
  status: 'ATIVA',
  administrador: false,
  organizadorHabilitado: false,
  criadoEm: '2026-01-01T00:00:00Z',
  atualizadoEm: '2026-01-01T00:00:00Z',
};

vi.mock('@/contexts/autenticacao-api', () => ({
  useAutenticacaoApi: () => ({
    atualizarMinhaConta,
    enviarFotoMinhaConta: vi.fn(),
    removerFotoMinhaConta: vi.fn(),
  }),
}));
vi.mock('@/contexts/municipios-api', () => ({
  useMunicipiosApi: () => municipiosApi,
}));
vi.mock('@/hooks/use-sessao', () => ({
  useSessao: () => ({
    session: { minhaConta: conta },
    executarAutenticado: <T,>(op: (token: string) => Promise<T>) => op('token'),
    recarregarMinhaConta,
  }),
}));

describe('perfil integrado', () => {
  it('permite selecionar município canônico e persiste o UUID', async () => {
    render(<TelaPerfilAtletaAutenticado />);
    const seletor = await screen.findByLabelText('Município');
    fireEvent.change(seletor, { target: { value: 'mun-restinga' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar perfil' }));
    await waitFor(() => expect(atualizarMinhaConta).toHaveBeenCalled());
    expect(atualizarMinhaConta.mock.calls[0]![1]).toMatchObject({
      municipioId: 'mun-restinga',
    });
  });

  it('liga o perfil às rotas integradas de segurança da conta', async () => {
    render(<TelaPerfilAtletaAutenticado />);

    expect(
      screen.getByRole('link', { name: 'Alterar e-mail' }),
    ).toHaveAttribute('href', '/minha-conta/alterar-email');
    expect(screen.getByRole('link', { name: 'Alterar senha' })).toHaveAttribute(
      'href',
      '/minha-conta/seguranca',
    );
  });
});

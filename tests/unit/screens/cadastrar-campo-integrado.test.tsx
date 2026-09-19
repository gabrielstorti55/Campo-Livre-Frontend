import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TelaCadastrarCampo } from '@/screens/prefeitura/cadastrar-campo';

const push = vi.fn();
const listarMinhasPrefeituras = vi.fn();
const cadastrarCampo = vi.fn();
const executarAutenticado = <T,>(operacao: (token: string) => Promise<T>) =>
  operacao('access-token');

vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
vi.mock('@/contexts/prefeituras-api', () => ({
  usePrefeiturasApi: () => ({ listarMinhasPrefeituras }),
}));
vi.mock('@/contexts/campos-api', () => ({
  useCamposApi: () => ({ cadastrarCampo }),
}));
vi.mock('@/hooks/use-sessao', () => ({
  useSessao: () => ({
    session: { account: { id: 'conta-1' } },
    executarAutenticado,
  }),
}));

const pagina = (papel: 'RESPONSAVEL' | 'MEMBRO') => ({
  itens: [
    {
      membroId: 'membro-1',
      papel,
      iniciadoEm: '2026-01-10T12:00:00.000Z',
      prefeitura: {
        id: 'prefeitura-1',
        nomeOficial: 'Prefeitura Municipal de Franca',
        status: 'ATIVA',
        municipio: { id: 'municipio-1', nome: 'Franca', uf: 'SP' },
        emailContatoPublico: 'esporte@example.test',
        telefoneContatoPublico: null,
      },
    },
  ],
  pagina: 1,
  tamanho: 100,
  totalItens: 1,
  totalPaginas: 1,
});

describe('TelaCadastrarCampo', () => {
  beforeEach(() => {
    push.mockReset();
    cadastrarCampo.mockReset().mockResolvedValue({ id: 'campo-criado' });
    listarMinhasPrefeituras
      .mockReset()
      .mockResolvedValue(pagina('RESPONSAVEL'));
  });

  it('cadastra no vínculo responsável e navega ao detalhe público', async () => {
    render(<TelaCadastrarCampo />);
    await screen.findByText('Prefeitura Municipal de Franca');

    fireEvent.change(screen.getByLabelText('Nome do campo'), {
      target: { value: ' Campo Comunitário ' },
    });
    fireEvent.change(screen.getByLabelText('Endereço completo'), {
      target: { value: ' Rua do Esporte, 10 ' },
    });
    fireEvent.change(screen.getByLabelText('Descrição pública'), {
      target: { value: ' Espaço municipal ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Cadastrar campo' }));

    await waitFor(() => expect(cadastrarCampo).toHaveBeenCalledTimes(1));
    expect(cadastrarCampo).toHaveBeenCalledWith(
      'prefeitura-1',
      'access-token',
      {
        nome: 'Campo Comunitário',
        endereco: 'Rua do Esporte, 10',
        descricao: 'Espaço municipal',
      },
    );
    expect(push).toHaveBeenCalledWith('/campos/campo-criado');
  });

  it('não oferece criação a membro sem responsabilidade institucional', async () => {
    listarMinhasPrefeituras.mockResolvedValue(pagina('MEMBRO'));
    render(<TelaCadastrarCampo />);

    expect(
      await screen.findByRole('heading', {
        name: 'Responsabilidade institucional necessária',
      }),
    ).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Cadastrar campo' }),
    ).not.toBeInTheDocument();
  });
});

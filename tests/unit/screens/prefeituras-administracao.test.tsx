import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TelaPrefeiturasAdministracao } from '@/screens/administracao/prefeituras';

const listarPrefeituras = vi.fn().mockResolvedValue({
  itens: [
    {
      id: 'pref-1',
      nomeOficial: 'Prefeitura de Franca',
      status: 'ATIVA',
      municipio: {
        id: 'mun-1',
        nome: 'Franca',
        uf: 'SP',
        codigoIbge: '3516200',
      },
      responsavel: null,
    },
  ],
  pagina: 1,
  tamanho: 20,
  totalItens: 1,
  totalPaginas: 1,
});
const criarPrefeitura = vi.fn().mockResolvedValue({ id: 'pref-2' });
const editarPrefeitura = vi.fn().mockResolvedValue({ id: 'pref-1' });
const buscarUsuarioPorEmail = vi.fn().mockResolvedValue({
  itens: [{ usuarioId: 'user-2', nome: 'Gestora', nomeUsuario: 'gestora' }],
});
const listarMunicipios = vi.fn().mockResolvedValue({
  itens: [{ id: 'mun-1', nome: 'Franca', uf: 'SP', codigoIbge: '3516200' }],
});

vi.mock('@/contexts/administracao-global-api', () => ({
  useAdministracaoGlobalApi: () => ({
    listarPrefeituras,
    criarPrefeitura,
    buscarUsuarioPorEmail,
    editarPrefeitura,
  }),
}));
vi.mock('@/contexts/municipios-api', () => ({
  useMunicipiosApi: () => ({ listarMunicipios }),
}));
vi.mock('@/hooks/use-sessao', () => ({
  useSessao: () => ({
    executarAutenticado: <T,>(op: (token: string) => Promise<T>) => op('token'),
  }),
}));

describe('TelaPrefeiturasAdministracao', () => {
  it('lista e cria Prefeitura com responsável confirmado', async () => {
    render(<TelaPrefeiturasAdministracao />);
    expect(await screen.findByText('Prefeitura de Franca')).toBeVisible();
    fireEvent.change(screen.getByLabelText('E-mail do responsável inicial'), {
      target: { value: 'gestora@example.test' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar responsável' }));
    expect(await screen.findByText('Gestora')).toBeVisible();
    fireEvent.change(screen.getByLabelText('Nome oficial'), {
      target: { value: 'Prefeitura Nova' },
    });
    fireEvent.change(screen.getByLabelText('E-mail público'), {
      target: { value: 'esporte@example.test' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Criar Prefeitura' }));
    await waitFor(() => expect(criarPrefeitura).toHaveBeenCalled());
    expect(criarPrefeitura.mock.calls[0]![0]).toMatchObject({
      municipioId: 'mun-1',
      responsavelInicialUsuarioId: 'user-2',
      nomeOficial: 'Prefeitura Nova',
    });
  });

  it('edita somente os contatos explicitamente informados', async () => {
    render(<TelaPrefeiturasAdministracao />);
    expect(await screen.findByText('Prefeitura de Franca')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    fireEvent.change(screen.getByLabelText('Novo e-mail público'), {
      target: { value: 'novo@example.test' },
    });
    fireEvent.change(screen.getByLabelText('Novo telefone público'), {
      target: { value: '16999999999' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar edição' }));

    await waitFor(() => expect(editarPrefeitura).toHaveBeenCalled());
    expect(editarPrefeitura.mock.calls[0]![1]).toEqual({
      emailContatoPublico: 'novo@example.test',
      telefoneContatoPublico: '16999999999',
    });
  });

  it('permite limpar explicitamente o telefone sem apagar outros contatos', async () => {
    render(<TelaPrefeiturasAdministracao />);
    expect(await screen.findByText('Prefeitura de Franca')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    fireEvent.click(screen.getByLabelText('Remover telefone público atual'));
    fireEvent.click(screen.getByRole('button', { name: 'Salvar edição' }));

    await waitFor(() => expect(editarPrefeitura).toHaveBeenCalled());
    expect(editarPrefeitura.mock.calls.at(-1)![1]).toEqual({
      telefoneContatoPublico: null,
    });
  });
});

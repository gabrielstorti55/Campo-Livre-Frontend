import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TelaCriarTime } from '@/screens/atleta/criar-time';

const push = vi.fn();
const criarTime = vi.fn().mockResolvedValue({ id: 'time-criado' });
const listarMunicipios = vi.fn().mockResolvedValue({
  itens: [
    {
      id: 'municipio-1',
      nome: 'Franca',
      uf: 'SP',
      codigoIbge: '3516200',
    },
  ],
  pagina: 1,
  tamanho: 100,
  totalItens: 1,
  totalPaginas: 1,
});
const executarAutenticado = <T,>(operacao: (token: string) => Promise<T>) =>
  operacao('access-token');
const timesApi = { criarTime };
const municipiosApi = { listarMunicipios };

vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
vi.mock('@/contexts/times-api', () => ({ useTimesApi: () => timesApi }));
vi.mock('@/contexts/municipios-api', () => ({
  useMunicipiosApi: () => municipiosApi,
}));
vi.mock('@/hooks/use-sessao', () => ({
  useSessao: () => ({ executarAutenticado }),
}));

describe('TelaCriarTime', () => {
  it('cria pela porta com Município do catálogo e navega para a gestão', async () => {
    render(<TelaCriarTime />);
    await screen.findByRole('option', { name: 'Franca/SP' });

    fireEvent.change(screen.getByLabelText('Nome do time'), {
      target: { value: '  Leões   da Vila ' },
    });
    fireEvent.change(screen.getByLabelText('Sigla'), {
      target: { value: 'lev' },
    });
    fireEvent.change(screen.getByLabelText('Descrição pública'), {
      target: { value: '  Time comunitário  ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Criar Time' }));

    await waitFor(() => expect(criarTime).toHaveBeenCalledTimes(1));
    expect(criarTime).toHaveBeenCalledWith(
      'access-token',
      {
        nome: 'Leões da Vila',
        sigla: 'LEV',
        municipioId: 'municipio-1',
        descricao: 'Time comunitário',
      },
      expect.any(String),
    );
    expect(push).toHaveBeenCalledWith('/atleta/time/time-criado');
  });
});

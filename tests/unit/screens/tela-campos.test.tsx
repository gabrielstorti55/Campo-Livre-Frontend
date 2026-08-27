import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TelaCampos } from '@/screens/publico/campos';

const listarCampos = vi.fn().mockResolvedValue({
  itens: [
    {
      id: 'campo-sentinela',
      nome: 'Estádio Sentinela',
      endereco: 'Rua do Teste, 10',
      municipio: { id: 'municipio-1', nome: 'Franca', uf: 'SP' },
      statusOperacional: 'ATIVO',
    },
  ],
  pagina: 1,
  tamanho: 20,
  totalItens: 1,
  totalPaginas: 1,
});

vi.mock('@/contexts/campos-api', () => ({
  useCamposApi: () => ({ listarCampos }),
}));

describe('TelaCampos', () => {
  it('consulta e apresenta somente a projeção pública dos campos', async () => {
    render(<TelaCampos />);

    expect(
      await screen.findByRole('heading', { name: 'Estádio Sentinela' }),
    ).toBeVisible();
    expect(screen.getByText('Rua do Teste, 10')).toBeVisible();
    expect(screen.getByText('Franca/SP')).toBeVisible();
    expect(screen.queryByText(/reservar/i)).toBeNull();
    expect(screen.queryByText(/agenda/i)).toBeNull();
    expect(listarCampos).toHaveBeenCalledWith({ pagina: 1, tamanho: 20 });
  });
});

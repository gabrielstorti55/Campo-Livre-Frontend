import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TelaDetalhesCampo } from '@/screens/publico/detalhes-campo';

const consultarCampo = vi.fn().mockResolvedValue({
  id: 'campo-1',
  nome: 'Estádio Municipal',
  descricao: 'Campo público para partidas.',
  endereco: 'Avenida do Estádio, 100',
  municipio: { id: 'municipio-1', nome: 'Franca', uf: 'SP' },
  statusOperacional: 'EM_MANUTENCAO',
  prefeitura: {
    nomeOficial: 'Prefeitura Municipal de Franca',
    emailInstitucional: 'esportes@franca.sp.gov.br',
  },
  aviso: 'Cadastro informativo; não representa reserva ou autorização de uso.',
});

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'campo-1' }),
}));
vi.mock('@/contexts/campos-api', () => ({
  useCamposApi: () => ({ consultarCampo }),
}));

describe('TelaDetalhesCampo', () => {
  it('apresenta somente a projeção pública e o aviso de uso', async () => {
    render(<TelaDetalhesCampo />);

    expect(
      await screen.findByRole('heading', { name: 'Estádio Municipal' }),
    ).toBeVisible();
    expect(screen.getByText('Em manutenção')).toBeVisible();
    expect(screen.getByText('esportes@franca.sp.gov.br')).toBeVisible();
    expect(screen.getByText(/não representa reserva/i)).toBeVisible();
    expect(screen.queryByRole('button', { name: /reservar/i })).toBeNull();
    expect(consultarCampo).toHaveBeenCalledWith('campo-1');
  });
});

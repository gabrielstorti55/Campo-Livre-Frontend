import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TelaGerenciarCampo } from '@/screens/prefeitura/gerenciar-campo';

const consultarCampo = vi.fn();
const atualizarCampo = vi.fn();
const alterarEstadoOperacional = vi.fn();
const executarAutenticado = <T,>(operacao: (token: string) => Promise<T>) =>
  operacao('access-token');

const camposApi = { consultarCampo };
const gestaoCamposApi = { atualizarCampo, alterarEstadoOperacional };

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'campo-1' }),
}));
vi.mock('@/contexts/campos-api', () => ({
  useCamposApi: () => camposApi,
}));
vi.mock('@/contexts/gestao-campos-api', () => ({
  useGestaoCamposApi: () => gestaoCamposApi,
}));
vi.mock('@/hooks/use-sessao', () => ({
  useSessao: () => ({ executarAutenticado }),
}));

const campo = {
  id: 'campo-1',
  nome: 'Estádio Municipal',
  descricao: 'Campo público',
  endereco: 'Rua do Campo, 100',
  municipio: { id: 'municipio-1', nome: 'Franca', uf: 'SP' },
  statusOperacional: 'ATIVO' as const,
  prefeitura: {
    nomeOficial: 'Prefeitura Municipal de Franca',
    emailInstitucional: 'esporte@example.test',
  },
  aviso: 'Cadastro informativo.',
};

describe('TelaGerenciarCampo', () => {
  beforeEach(() => {
    consultarCampo.mockReset().mockResolvedValue(campo);
    atualizarCampo.mockReset().mockResolvedValue({
      id: 'campo-1',
      nome: 'Estádio reformado',
      descricao: null,
      endereco: 'Rua Nova, 20',
      atualizadoEm: '2026-09-17T12:00:00.000Z',
    });
    alterarEstadoOperacional.mockReset().mockResolvedValue({
      id: 'campo-1',
      statusOperacional: 'EM_MANUTENCAO',
      estadoAnterior: 'ATIVO',
      alterado: true,
      alteradoEm: '2026-09-17T12:00:00.000Z',
    });
  });

  it('edita o Campo conhecido e recarrega a projeção persistida', async () => {
    consultarCampo.mockResolvedValueOnce(campo).mockResolvedValueOnce({
      ...campo,
      nome: 'Estádio reformado',
      descricao: null,
      endereco: 'Rua Nova, 20',
    });
    render(<TelaGerenciarCampo />);

    fireEvent.change(await screen.findByLabelText('Nome do campo'), {
      target: { value: ' Estádio reformado ' },
    });
    fireEvent.change(screen.getByLabelText('Endereço completo'), {
      target: { value: ' Rua Nova, 20 ' },
    });
    fireEvent.change(screen.getByLabelText('Descrição pública'), {
      target: { value: ' ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar alterações' }));

    await waitFor(() => expect(atualizarCampo).toHaveBeenCalledTimes(1));
    expect(atualizarCampo).toHaveBeenCalledWith('campo-1', 'access-token', {
      nome: 'Estádio reformado',
      endereco: 'Rua Nova, 20',
      descricao: null,
    });
    expect(consultarCampo).toHaveBeenCalledTimes(2);
    expect(await screen.findByDisplayValue('Estádio reformado')).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent('Campo atualizado.');
  });

  it('exige motivo e confirmação antes de alterar o estado operacional', async () => {
    consultarCampo.mockResolvedValueOnce(campo).mockResolvedValueOnce({
      ...campo,
      statusOperacional: 'EM_MANUTENCAO',
    });
    render(<TelaGerenciarCampo />);

    await screen.findByDisplayValue('Estádio Municipal');
    fireEvent.change(screen.getByLabelText('Novo estado operacional'), {
      target: { value: 'EM_MANUTENCAO' },
    });
    fireEvent.change(screen.getByLabelText('Motivo da alteração'), {
      target: { value: ' Reparo do gramado ' },
    });

    const submit = screen.getByRole('button', { name: 'Alterar estado' });
    expect(submit).toBeDisabled();
    fireEvent.click(
      screen.getByLabelText('Confirmo a alteração do estado operacional'),
    );
    fireEvent.click(submit);

    await waitFor(() =>
      expect(alterarEstadoOperacional).toHaveBeenCalledWith(
        'campo-1',
        'access-token',
        {
          statusOperacional: 'EM_MANUTENCAO',
          motivo: 'Reparo do gramado',
          confirmacao: true,
        },
      ),
    );
    expect(consultarCampo).toHaveBeenCalledTimes(2);
    expect(screen.getByRole('status')).toHaveTextContent(
      'Estado operacional atualizado.',
    );
  });
});

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TelaOrganizadoresPrefeitura } from '@/screens/prefeitura/organizadores';

const listarMinhasPrefeituras = vi.fn();
const listarFuncionarios = vi.fn();
const listarConvitesEnviados = vi.fn();
const buscarUsuarioInstitucional = vi.fn();
const convidarFuncionario = vi.fn();
const reenviarConvite = vi.fn();
const removerFuncionario = vi.fn();
const transferirResponsabilidade = vi.fn();
const prefeiturasApi = { listarMinhasPrefeituras };
const gestaoPrefeiturasApi = {
  listarFuncionarios,
  listarConvitesEnviados,
  buscarUsuarioInstitucional,
  convidarFuncionario,
  reenviarConvite,
  removerFuncionario,
  transferirResponsabilidade,
};
const executarAutenticado = <T,>(operacao: (token: string) => Promise<T>) =>
  operacao('access-token');

vi.mock('@/contexts/prefeituras-api', () => ({
  usePrefeiturasApi: () => prefeiturasApi,
}));
vi.mock('@/contexts/gestao-prefeituras-api', () => ({
  useGestaoPrefeiturasApi: () => gestaoPrefeiturasApi,
}));
vi.mock('@/hooks/use-sessao', () => ({
  useSessao: () => ({ executarAutenticado }),
}));

describe('TelaOrganizadoresPrefeitura integrada', () => {
  beforeEach(() => {
    listarMinhasPrefeituras.mockReset().mockResolvedValue({
      itens: [
        {
          membroId: 'membro-responsavel',
          papel: 'RESPONSAVEL',
          iniciadoEm: '2026-01-01T00:00:00.000Z',
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
    listarFuncionarios.mockReset().mockResolvedValue({
      itens: [
        {
          membroId: 'membro-responsavel',
          usuarioId: 'usuario-1',
          nome: 'Responsável Municipal',
          nomeUsuario: 'responsavel.municipal',
          papel: 'RESPONSAVEL',
          status: 'ATIVO',
          iniciadoEm: '2026-01-01T00:00:00.000Z',
          encerradoEm: null,
        },
        {
          membroId: 'membro-2',
          usuarioId: 'usuario-2',
          nome: 'Funcionária Municipal',
          nomeUsuario: 'funcionaria.municipal',
          papel: 'MEMBRO',
          status: 'ATIVO',
          iniciadoEm: '2026-02-01T00:00:00.000Z',
          encerradoEm: null,
        },
      ],
      pagina: 1,
      tamanho: 100,
      totalItens: 2,
      totalPaginas: 1,
    });
    listarConvitesEnviados.mockReset().mockResolvedValue({
      itens: [
        {
          conviteId: 'convite-1',
          destinatario: {
            usuarioId: 'usuario-3',
            nome: 'Pessoa Convidada',
            nomeUsuario: 'pessoa.convidada',
            emailMascarado: 'p***@example.test',
          },
          papelDestino: 'MEMBRO',
          status: 'PENDENTE',
          convidadoEm: '2026-03-01T00:00:00.000Z',
          reenviadoEm: null,
          expiraEm: '2026-03-08T00:00:00.000Z',
          acoesPermitidas: ['REENVIAR'],
        },
      ],
      pagina: 1,
      tamanho: 100,
      totalItens: 1,
      totalPaginas: 1,
    });
    buscarUsuarioInstitucional.mockReset().mockResolvedValue({
      itens: [
        {
          usuarioId: 'usuario-4',
          nome: 'Nova Funcionária',
          nomeUsuario: 'nova.funcionaria',
        },
      ],
      pagina: 1,
      tamanho: 20,
      totalItens: 1,
      totalPaginas: 1,
    });
    convidarFuncionario.mockReset().mockResolvedValue({
      conviteId: 'convite-2',
      papelDestino: 'MEMBRO',
      status: 'PENDENTE',
      expiraEm: '2026-03-09T00:00:00.000Z',
    });
    reenviarConvite.mockReset().mockResolvedValue({
      conviteId: 'convite-1',
      status: 'PENDENTE',
      expiraEm: '2026-03-10T00:00:00.000Z',
    });
    removerFuncionario.mockReset().mockResolvedValue({
      membroId: 'membro-2',
      status: 'ENCERRADO',
      encerradoEm: '2026-03-02T00:00:00.000Z',
    });
    transferirResponsabilidade.mockReset().mockResolvedValue({
      prefeituraId: 'prefeitura-1',
      responsavelMembroId: 'membro-2',
      responsavelAnteriorPapel: 'MEMBRO',
      transferidoEm: '2026-03-02T00:00:00.000Z',
    });
  });

  it('carrega funcionários e convites reais da Prefeitura responsável', async () => {
    render(<TelaOrganizadoresPrefeitura />);

    expect(
      await screen.findByRole('heading', { name: 'Funcionários municipais' }),
    ).toBeVisible();
    expect(screen.getByText('Responsável Municipal')).toBeVisible();
    expect(screen.getByText('Funcionária Municipal')).toBeVisible();
    expect(screen.getByText('Pessoa Convidada')).toBeVisible();
    expect(screen.getByText('p***@example.test')).toBeVisible();
    expect(listarFuncionarios).toHaveBeenCalledWith(
      'prefeitura-1',
      'access-token',
      'ATIVO',
      1,
      100,
    );
    expect(listarConvitesEnviados).toHaveBeenCalledWith(
      'prefeitura-1',
      'access-token',
      1,
      100,
    );
    expect(screen.queryByText(/eventos organizados/i)).not.toBeInTheDocument();
  });

  it('busca por e-mail, confirma a identidade mínima e envia convite idempotente', async () => {
    render(<TelaOrganizadoresPrefeitura />);
    await screen.findByText('Responsável Municipal');

    fireEvent.change(screen.getByLabelText('E-mail da pessoa'), {
      target: { value: 'nova@example.test' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar pessoa' }));

    expect(await screen.findByText('Nova Funcionária')).toBeVisible();
    expect(screen.getByText('@nova.funcionaria')).toBeVisible();
    expect(buscarUsuarioInstitucional).toHaveBeenCalledWith(
      'nova@example.test',
      'access-token',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Enviar convite' }));

    await waitFor(() => expect(convidarFuncionario).toHaveBeenCalled());
    expect(convidarFuncionario).toHaveBeenCalledWith(
      'prefeitura-1',
      'usuario-4',
      'access-token',
      expect.any(String),
    );
    expect(
      await screen.findByText('Convite enviado com sucesso.'),
    ).toBeVisible();
    expect(listarConvitesEnviados).toHaveBeenCalledTimes(2);
  });

  it('reenvia um convite recuperado e atualiza a projeção', async () => {
    render(<TelaOrganizadoresPrefeitura />);
    await screen.findByText('Pessoa Convidada');

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Reenviar convite para Pessoa Convidada',
      }),
    );

    await waitFor(() => expect(reenviarConvite).toHaveBeenCalled());
    expect(reenviarConvite).toHaveBeenCalledWith(
      'prefeitura-1',
      'convite-1',
      'access-token',
      expect.any(String),
    );
    expect(
      await screen.findByText('Convite reenviado com sucesso.'),
    ).toBeVisible();
    expect(listarConvitesEnviados).toHaveBeenCalledTimes(2);
  });

  it('remove membro somente após motivo e confirmação', async () => {
    render(<TelaOrganizadoresPrefeitura />);
    await screen.findByText('Funcionária Municipal');

    fireEvent.click(
      screen.getByRole('button', { name: 'Remover Funcionária Municipal' }),
    );
    fireEvent.change(screen.getByLabelText('Motivo da remoção'), {
      target: { value: 'Encerramento do vínculo institucional' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar remoção' }));

    await waitFor(() => expect(removerFuncionario).toHaveBeenCalled());
    expect(removerFuncionario).toHaveBeenCalledWith(
      'prefeitura-1',
      'membro-2',
      'access-token',
      'Encerramento do vínculo institucional',
    );
    expect(await screen.findByText('Funcionário removido.')).toBeVisible();
    expect(listarFuncionarios).toHaveBeenCalledTimes(2);
  });

  it('transfere a responsabilidade para um membro ativo após confirmação', async () => {
    render(<TelaOrganizadoresPrefeitura />);
    await screen.findByText('Funcionária Municipal');

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Transferir responsabilidade para Funcionária Municipal',
      }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Confirmar transferência' }),
    );

    await waitFor(() => expect(transferirResponsabilidade).toHaveBeenCalled());
    expect(transferirResponsabilidade).toHaveBeenCalledWith(
      'prefeitura-1',
      'membro-2',
      'access-token',
    );
    expect(
      await screen.findByText('Responsabilidade transferida.'),
    ).toBeVisible();
    expect(listarMinhasPrefeituras).toHaveBeenCalledTimes(2);
  });
});

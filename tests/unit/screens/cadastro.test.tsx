import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ProvedorAutenticacaoApi } from '@/contexts/autenticacao-api';
import { TelaCadastro } from '@/screens/publico/cadastro';
import type { AutenticacaoApi } from '@/services/autenticacao/autenticacao-api';

function preencherCampo(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

function renderizar(api: AutenticacaoApi, modo: 'integrado' | 'prototipo') {
  render(
    <ProvedorAutenticacaoApi api={api}>
      <TelaCadastro modo={modo} />
    </ProvedorAutenticacaoApi>,
  );
}

describe('TelaCadastro', () => {
  it('envia o contrato adulto completo no modo protótipo sem autenticar automaticamente', async () => {
    const cadastrar = vi.fn().mockResolvedValue({
      cadastroId: 'cadastro-1',
      cadastroToken: 'token-cadastro',
      status: 'PENDENTE_CONFIRMACAO',
      emailConfirmado: false,
      consentimentoResponsavelNecessario: false,
      proximaAcao: 'CONFIRMAR_EMAIL',
    });
    renderizar({ cadastrar } as unknown as AutenticacaoApi, 'prototipo');

    preencherCampo('Nome completo', 'Ana Souza');
    preencherCampo('Nome de usuário', 'anasouza');
    preencherCampo('E-mail', ' ANA@EXEMPLO.COM ');
    preencherCampo('Telefone (opcional)', '(16) 99999-9999');
    preencherCampo('CPF', '123.456.789-01');
    preencherCampo('Número do RG', '12.345.678-9');
    preencherCampo('Órgão expedidor', 'SSP');
    preencherCampo('UF do RG', 'sp');
    preencherCampo('Data de nascimento', '2000-01-01');
    preencherCampo('Senha', 'senha-segura');
    preencherCampo('Confirmar senha', 'senha-segura');
    fireEvent.click(screen.getByLabelText('Aceito os termos de uso'));
    fireEvent.click(
      screen.getByRole('button', { name: 'Criar conta pessoal' }),
    );

    await waitFor(() =>
      expect(cadastrar).toHaveBeenCalledWith({
        nome: 'Ana Souza',
        nomeUsuario: 'anasouza',
        email: 'ana@exemplo.com',
        telefone: '(16) 99999-9999',
        cpf: '12345678901',
        rgNumero: '123456789',
        rgOrgaoExpedidor: 'SSP',
        rgUf: 'SP',
        dataNascimento: '2000-01-01',
        municipioId: '00000000-0000-4000-8000-000000000001',
        senha: 'senha-segura',
        termosAceitos: true,
      }),
    );
    expect(
      screen.getByRole('heading', { name: 'Confirme seu e-mail' }),
    ).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'Abrir confirmação simulada' }),
    ).toHaveAttribute('href', '/confirmar-email?token=token-cadastro');
  });

  it('não finge cadastro integrado enquanto a seleção canônica de município não existe', () => {
    renderizar({} as AutenticacaoApi, 'integrado');

    expect(
      screen.getByText(
        /cadastro integrado aguarda o catálogo público de municípios/i,
      ),
    ).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Criar conta pessoal' }),
    ).toBeDisabled();
  });

  it('falha fechada quando a API exige o fluxo do responsável', async () => {
    const cadastrar = vi.fn().mockResolvedValue({
      cadastroId: 'cadastro-menor',
      cadastroToken: 'token-menor',
      status: 'AGUARDANDO_CONSENTIMENTO',
      emailConfirmado: false,
      consentimentoResponsavelNecessario: true,
      proximaAcao: 'INFORMAR_RESPONSAVEL',
    });
    renderizar({ cadastrar } as unknown as AutenticacaoApi, 'prototipo');

    preencherCampo('Nome completo', 'Pessoa Menor');
    preencherCampo('Nome de usuário', 'pessoamenor');
    preencherCampo('E-mail', 'menor@exemplo.com');
    preencherCampo('CPF', '123.456.789-01');
    preencherCampo('Número do RG', '12.345.678-9');
    preencherCampo('Órgão expedidor', 'SSP');
    preencherCampo('UF do RG', 'SP');
    preencherCampo('Data de nascimento', '2012-01-01');
    preencherCampo('Senha', 'senha-segura');
    preencherCampo('Confirmar senha', 'senha-segura');
    fireEvent.click(screen.getByLabelText('Aceito os termos de uso'));
    fireEvent.click(
      screen.getByRole('button', { name: 'Criar conta pessoal' }),
    );

    expect(
      await screen.findByRole('heading', {
        name: 'Cadastro de menor não concluído',
      }),
    ).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Reenviar confirmação' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Abrir confirmação simulada' }),
    ).not.toBeInTheDocument();
  });
});

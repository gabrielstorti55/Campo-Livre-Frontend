import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ProvedorAutenticacaoApi } from '@/contexts/autenticacao-api';
import { ProvedorMunicipiosApi } from '@/contexts/municipios-api';
import { TelaCadastro } from '@/screens/publico/cadastro';
import type { AutenticacaoApi } from '@/services/autenticacao/autenticacao-api';
import type { MunicipiosApi } from '@/services/municipios/municipios-api';

function preencherCampo(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

function renderizar(api: AutenticacaoApi, modo: 'integrado' | 'prototipo') {
  const municipiosApi: MunicipiosApi = {
    listarMunicipios: vi.fn().mockResolvedValue({
      itens: [
        {
          id: 'municipio-franca',
          nome: 'Franca',
          uf: 'SP',
          codigoIbge: '3516200',
        },
      ],
      pagina: 1,
      tamanho: 100,
      totalItens: 1,
      totalPaginas: 1,
    }),
  };
  render(
    <ProvedorMunicipiosApi api={municipiosApi}>
      <ProvedorAutenticacaoApi api={api}>
        <TelaCadastro modo={modo} />
      </ProvedorAutenticacaoApi>
    </ProvedorMunicipiosApi>,
  );
}

describe('TelaCadastro', () => {
  it('envia o contrato adulto completo no modo protótipo sem autenticar automaticamente', async () => {
    const cadastrar = vi.fn().mockResolvedValue({
      cadastroId: 'cadastro-1',
      status: 'PENDENTE_CONFIRMACAO',
      proximaAcao: 'CONFIRMAR_EMAIL',
    });
    const reenviarConfirmacaoEmail = vi
      .fn()
      .mockResolvedValue({ envioAceito: true });
    renderizar(
      { cadastrar, reenviarConfirmacaoEmail } as unknown as AutenticacaoApi,
      'prototipo',
    );

    await screen.findByRole('option', { name: 'Franca — SP' });

    preencherCampo('Nome completo', 'Ana Souza');
    preencherCampo('Nome de usuário', 'anasouza');
    preencherCampo('E-mail', ' ANA@EXEMPLO.COM ');
    preencherCampo('Telefone (opcional)', '(16) 99999-9999');
    preencherCampo('CPF', '123.456.789-01');
    preencherCampo('Número do RG', '12.345.678-X');
    preencherCampo('Órgão expedidor', 'SSP');
    preencherCampo('UF do RG', 'sp');
    preencherCampo('Data de nascimento', '2000-01-01');
    preencherCampo('Senha', 'Senha12!');
    preencherCampo('Confirmar senha', 'Senha12!');
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
        rgNumero: '12345678X',
        rgOrgaoExpedidor: 'SSP',
        rgUf: 'SP',
        dataNascimento: '2000-01-01',
        municipioId: 'municipio-franca',
        senha: 'Senha12!',
        termosAceitos: true,
      }),
    );
    expect(
      screen.getByRole('heading', { name: 'Confirme seu e-mail' }),
    ).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'Abrir confirmação simulada' }),
    ).toHaveAttribute('href', '/confirmar-email?token=prototipo%3Acadastro-1');

    fireEvent.click(
      screen.getByRole('button', { name: 'Reenviar confirmação' }),
    );
    await waitFor(() =>
      expect(reenviarConfirmacaoEmail).toHaveBeenCalledWith('ana@exemplo.com'),
    );
  });

  it('habilita o cadastro integrado com o município canônico selecionado', async () => {
    const cadastrar = vi.fn().mockResolvedValue({
      cadastroId: 'cadastro-1',
      status: 'PENDENTE_CONFIRMACAO',
      proximaAcao: 'CONFIRMAR_EMAIL',
    });
    renderizar({ cadastrar } as unknown as AutenticacaoApi, 'integrado');

    expect(
      await screen.findByRole('option', { name: 'Franca — SP' }),
    ).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Criar conta pessoal' }),
    ).toBeEnabled();
  });

  it('pede a confirmação do e-mail antes do consentimento do responsável', async () => {
    const cadastrar = vi.fn().mockResolvedValue({
      cadastroId: 'cadastro-menor',
      status: 'AGUARDANDO_CONSENTIMENTO',
      proximaAcao: 'CONFIRMAR_EMAIL',
    });
    renderizar({ cadastrar } as unknown as AutenticacaoApi, 'integrado');

    await screen.findByRole('option', { name: 'Franca — SP' });

    preencherCampo('Nome completo', 'Pessoa Menor');
    preencherCampo('Nome de usuário', 'pessoamenor');
    preencherCampo('E-mail', 'menor@exemplo.com');
    preencherCampo('CPF', '123.456.789-01');
    preencherCampo('Número do RG', '12.345.678-X');
    preencherCampo('Órgão expedidor', 'SSP');
    preencherCampo('UF do RG', 'SP');
    preencherCampo('Data de nascimento', '2012-01-01');
    preencherCampo('Senha', 'Senha12!');
    preencherCampo('Confirmar senha', 'Senha12!');
    fireEvent.click(screen.getByLabelText('Aceito os termos de uso'));
    fireEvent.click(
      screen.getByRole('button', { name: 'Criar conta pessoal' }),
    );

    expect(
      await screen.findByRole('heading', {
        name: 'Confirme seu e-mail',
      }),
    ).toBeVisible();
    expect(
      screen.queryByRole('link', { name: 'Abrir confirmação simulada' }),
    ).not.toBeInTheDocument();
  });
});

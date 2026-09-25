import { describe, expect, it } from 'vitest';

import { AutenticacaoPrototipo } from '@/services/autenticacao/autenticacao-prototipo';
import type { EntradaCadastro } from '@/types/api/autenticacao';

const cadastro: EntradaCadastro = {
  nome: 'Ana Souza',
  nomeUsuario: 'anasouza',
  email: 'ana.nova@campolivre.test',
  telefone: null,
  cpf: '12345678901',
  rgNumero: '123456789',
  rgOrgaoExpedidor: 'SSP',
  rgUf: 'SP',
  dataNascimento: '2000-01-01',
  municipioId: '00000000-0000-4000-8000-000000000001',
  senha: 'senha-segura',
  termosAceitos: true,
};

describe('AutenticacaoPrototipo', () => {
  it.each([
    ['sem-time@campolivre.test', 'Lucas Ferreira'],
    ['atleta@campolivre.test', 'Diego Souza'],
    ['colaborador@campolivre.test', 'Juliana Lopes'],
    ['pessoa@campolivre.test', 'Marcos Oliveira'],
    ['prefeitura@campolivre.test', 'Gestora Municipal'],
  ])('autentica a persona de demonstração %s', async (email, nome) => {
    const api = new AutenticacaoPrototipo();
    await expect(
      api.login({ email, senha: 'senha-mock', plataforma: 'WEB' }),
    ).resolves.toMatchObject({ usuario: { nome } });
  });

  it('só permite login da conta cadastrada depois da confirmação de e-mail', async () => {
    const api = new AutenticacaoPrototipo();
    const resposta = await api.cadastrar(cadastro);

    await expect(
      api.login({
        email: cadastro.email,
        senha: cadastro.senha,
        plataforma: 'WEB',
      }),
    ).rejects.toMatchObject({ problem: { codigo: 'EMAIL_NAO_CONFIRMADO' } });

    await api.confirmarEmail(`prototipo:${resposta.cadastroId}`);

    await expect(
      api.login({
        email: cadastro.email,
        senha: cadastro.senha,
        plataforma: 'WEB',
      }),
    ).resolves.toMatchObject({
      usuario: { nomeUsuario: cadastro.nomeUsuario },
    });
  });

  it('redefine a senha em memória e invalida o token de recuperação', async () => {
    const api = new AutenticacaoPrototipo();
    await api.solicitarRecuperacao('pessoa@campolivre.test');

    const token = 'recuperacao-token-pessoa%40campolivre.test';
    await api.redefinirSenha({ token, novaSenha: 'nova-senha' });

    await expect(
      api.login({
        email: 'pessoa@campolivre.test',
        senha: 'nova-senha',
        plataforma: 'WEB',
      }),
    ).resolves.toBeDefined();
    await expect(
      api.redefinirSenha({ token, novaSenha: 'outra-senha' }),
    ).rejects.toMatchObject({ problem: { codigo: 'TOKEN_JA_UTILIZADO' } });
  });

  it('mantém o e-mail atual até a confirmação do novo endereço', async () => {
    const api = new AutenticacaoPrototipo();
    const login = await api.login({
      email: 'sem-time@campolivre.test',
      senha: 'senha-mock',
      plataforma: 'WEB',
    });

    await api.solicitarAlteracaoEmail(
      login.accessToken,
      'novo@campolivre.test',
    );
    const conta = await api.consultarMinhaConta(login.accessToken);

    expect(conta.email).toBe('sem-time@campolivre.test');
    expect(conta.emailPendente).toBe('novo@campolivre.test');
  });

  it('só troca o e-mail depois de consumir o token de confirmação', async () => {
    const api = new AutenticacaoPrototipo();
    const login = await api.login({
      email: 'colaborador@campolivre.test',
      senha: 'senha-mock',
      plataforma: 'WEB',
    });
    await api.solicitarAlteracaoEmail(
      login.accessToken,
      'atleta-novo@campolivre.test',
    );

    await api.confirmarAlteracaoEmail(
      'alteracao-email-token-atleta-novo%40campolivre.test',
    );

    await expect(
      api.login({
        email: 'atleta-novo@campolivre.test',
        senha: 'senha-mock',
        plataforma: 'WEB',
      }),
    ).resolves.toBeDefined();
  });

  it('reativa uma conta sem criar sessão automática', async () => {
    const api = new AutenticacaoPrototipo();

    await expect(
      api.reativarConta({
        email: 'inativa@campolivre.test',
        senha: 'senha-mock',
        confirmacao: true,
      }),
    ).resolves.toEqual({
      contaReativada: true,
      eliminacaoCancelada: true,
      novoLoginNecessario: true,
    });

    await expect(
      api.login({
        email: 'inativa@campolivre.test',
        senha: 'senha-mock',
        plataforma: 'WEB',
      }),
    ).resolves.toBeDefined();
  });

  it('mantém resposta neutra e consome uma vez o token de reativação por e-mail', async () => {
    const api = new AutenticacaoPrototipo();

    await expect(
      api.solicitarReativacaoConta('desconhecida@campolivre.test'),
    ).resolves.toEqual({ solicitacaoAceita: true });
    await api.solicitarReativacaoConta('inativa@campolivre.test');
    await expect(
      api.confirmarReativacaoConta('reativacao-token-inativa@campolivre.test'),
    ).resolves.toMatchObject({ contaReativada: true });
    await expect(
      api.confirmarReativacaoConta('reativacao-token-inativa@campolivre.test'),
    ).rejects.toMatchObject({ problem: { codigo: 'TOKEN_JA_UTILIZADO' } });
  });

  it('rejeita token de confirmação de e-mail inválido ou reutilizado', async () => {
    const api = new AutenticacaoPrototipo();

    await expect(api.confirmarEmail('token-inexistente')).rejects.toMatchObject(
      {
        problem: { codigo: 'TOKEN_INVALIDO' },
      },
    );

    const cadastro = await api.cadastrar({
      nome: 'Conta Confirmação',
      nomeUsuario: 'contaconfirmacao',
      email: 'confirmacao@campolivre.test',
      telefone: null,
      cpf: '77777777777',
      rgNumero: '777777777',
      rgOrgaoExpedidor: 'SSP',
      rgUf: 'SP',
      dataNascimento: '1990-01-01',
      municipioId: '00000000-0000-4000-8000-000000000001',
      senha: 'senha-mock',
      termosAceitos: true,
    });
    const token = `prototipo:${cadastro.cadastroId}`;
    await api.confirmarEmail(token);

    await expect(api.confirmarEmail(token)).rejects.toMatchObject({
      problem: { codigo: 'TOKEN_JA_UTILIZADO' },
    });
  });

  it('mantém menor sem login normal depois de confirmar o próprio e-mail', async () => {
    const api = new AutenticacaoPrototipo();
    const menor = {
      ...cadastro,
      nome: 'Pessoa Menor',
      nomeUsuario: 'pessoamenorconsentimento',
      email: 'menor.consentimento@campolivre.test',
      cpf: '88888888888',
      rgNumero: '888888888',
      dataNascimento: '2012-01-01',
    };
    const resposta = await api.cadastrar(menor);

    expect(resposta).toMatchObject({
      status: 'AGUARDANDO_CONSENTIMENTO',
      proximaAcao: 'CONFIRMAR_EMAIL',
    });
    await expect(
      api.confirmarEmail(`prototipo:${resposta.cadastroId}`),
    ).resolves.toMatchObject({
      statusConta: 'AGUARDANDO_CONSENTIMENTO',
      consentimentoResponsavelNecessario: true,
    });
    await expect(
      api.login({
        email: menor.email,
        senha: menor.senha,
        plataforma: 'WEB',
      }),
    ).rejects.toMatchObject({ problem: { codigo: 'CONTA_INAPTA' } });
  });

  it('expõe somente em memória a identidade ativa para adapters de protótipo', async () => {
    const api = new AutenticacaoPrototipo();

    expect(api.obterContaAtivaId('sem-sessao')).toBeNull();
    const login = await api.login({
      email: 'sem-time@campolivre.test',
      senha: 'senha-mock',
      plataforma: 'WEB',
    });
    expect(api.obterContaAtivaId(login.accessToken)).toBe(
      'mock-person-unlinked-1',
    );
    expect(api.obterContaAtivaId('token-divergente')).toBeNull();

    await api.logout();
    expect(api.obterContaAtivaId(login.accessToken)).toBeNull();
  });
});

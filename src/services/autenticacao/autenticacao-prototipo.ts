import { ErroApi } from '@/services/api/problem-details';
import type { AutenticacaoApi } from '@/services/autenticacao/autenticacao-api';
import type {
  EntradaAlteracaoSenha,
  EntradaAtualizacaoMinhaConta,
  EntradaCadastro,
  EntradaLogin,
  EntradaRedefinicaoSenha,
  EntradaReativacaoConta,
  MinhaConta,
  RespostaAlteracaoSenha,
  RespostaAtivacaoOrganizador,
  RespostaCadastro,
  RespostaDesativacaoConta,
  RespostaFotoMinhaConta,
  RespostaConfirmacaoAlteracaoEmail,
  RespostaConfirmacaoEmail,
  RespostaLogin,
  RespostaRedefinicaoSenha,
  RespostaReenvioConfirmacaoEmail,
  RespostaRenovacao,
  RespostaReativacaoConta,
  RespostaSolicitacaoAlteracaoEmail,
  RespostaSolicitacaoRecuperacao,
  RespostaSolicitacaoReativacaoConta,
} from '@/types/api/autenticacao';

const ACCESS_TOKEN_PROTOTIPO = 'access-token-prototipo-apenas-em-memoria';
const ACCESS_EXPIRY = '2030-01-01T00:15:00.000Z';
const REFRESH_EXPIRY = '2030-01-30T00:00:00.000Z';

function criarContaPrototipo(input: {
  id: string;
  nome: string;
  nomeUsuario: string;
  email: string;
  cpf: string;
  rgNumero: string;
  nascimento: string;
  idade: number;
  organizadorHabilitado?: boolean;
}): MinhaConta {
  return {
    id: input.id,
    nome: input.nome,
    nomeUsuario: input.nomeUsuario,
    email: input.email,
    emailPendente: null,
    emailConfirmado: true,
    telefone: null,
    cpf: input.cpf,
    rg: {
      numero: input.rgNumero,
      orgaoExpedidor: 'SSP',
      uf: 'SP',
    },
    dataNascimento: input.nascimento,
    idade: input.idade,
    municipio: { id: 'municipio-franca', nome: 'Franca', uf: 'SP' },
    fotoUrl: null,
    biografia: null,
    posicaoPrincipal: null,
    status: 'ATIVA',
    organizadorHabilitado: input.organizadorHabilitado ?? false,
    administrador: false,
    criadoEm: '2026-01-01T00:00:00.000Z',
    atualizadoEm: '2026-01-01T00:00:00.000Z',
  };
}

const contas: Record<string, MinhaConta> = {
  'pessoa@campolivre.test': criarContaPrototipo({
    id: 'mock-person-1',
    nome: 'Marcos Oliveira',
    nomeUsuario: 'marcosoliveira',
    email: 'pessoa@campolivre.test',
    cpf: '00000000000',
    rgNumero: '000000000',
    nascimento: '1995-05-10',
    idade: 31,
    organizadorHabilitado: true,
  }),
  'sem-time@campolivre.test': criarContaPrototipo({
    id: 'mock-person-unlinked-1',
    nome: 'Lucas Ferreira',
    nomeUsuario: 'lucasferreira',
    email: 'sem-time@campolivre.test',
    cpf: '11111111111',
    rgNumero: '111111111',
    nascimento: '1998-08-20',
    idade: 28,
  }),
  'atleta@campolivre.test': criarContaPrototipo({
    id: 'mock-person-athlete-1',
    nome: 'Diego Souza',
    nomeUsuario: 'diegosouza',
    email: 'atleta@campolivre.test',
    cpf: '66666666666',
    rgNumero: '666666666',
    nascimento: '1999-06-12',
    idade: 27,
  }),
  'atleta-cancelado@campolivre.test': criarContaPrototipo({
    id: 'conta-atleta-cancelado',
    nome: 'Rafael Lima',
    nomeUsuario: 'rafaellima',
    email: 'atleta-cancelado@campolivre.test',
    cpf: '44444444444',
    rgNumero: '444444444',
    nascimento: '1997-03-14',
    idade: 29,
  }),
  'colaborador@campolivre.test': criarContaPrototipo({
    id: 'mock-person-collaborator-1',
    nome: 'Juliana Lopes',
    nomeUsuario: 'julianalopes',
    email: 'colaborador@campolivre.test',
    cpf: '22222222222',
    rgNumero: '222222222',
    nascimento: '1992-02-02',
    idade: 34,
    organizadorHabilitado: true,
  }),
  'prefeitura@campolivre.test': criarContaPrototipo({
    id: 'conta-prefeitura',
    nome: 'Gestora Municipal',
    nomeUsuario: 'gestoramunicipal',
    email: 'prefeitura@campolivre.test',
    cpf: '33333333333',
    rgNumero: '333333333',
    nascimento: '1988-03-03',
    idade: 38,
  }),
};

const senhas: Record<string, string> = Object.fromEntries(
  Object.keys(contas).map((email) => [email, 'senha-mock']),
);

const cadastrosPendentes = new Map<
  string,
  { input: EntradaCadastro; cadastroId: string }
>();
const tokensConfirmacaoEmailUtilizados = new Set<string>();
const emailsAguardandoConsentimento = new Set<string>();

const recuperacoesPendentes = new Map<string, string>();
const tokensRecuperacaoUtilizados = new Set<string>();

function invalidCredentials(): ErroApi {
  return new ErroApi({
    type: 'https://campolivre.app/problemas/credenciais-invalidas',
    title: 'Credenciais inválidas',
    status: 401,
    detail: 'E-mail ou senha inválidos.',
    codigo: 'CREDENCIAIS_INVALIDAS',
  });
}

function emailNaoConfirmado(): ErroApi {
  return new ErroApi({
    type: 'https://campolivre.app/problemas/email-nao-confirmado',
    title: 'E-mail não confirmado',
    status: 403,
    codigo: 'EMAIL_NAO_CONFIRMADO',
  });
}

function tokenRecuperacaoInvalido(codigo: string): ErroApi {
  return new ErroApi({
    type: 'https://campolivre.app/problemas/token-recuperacao-invalido',
    title: 'Token de recuperação inválido',
    status: 400,
    codigo,
  });
}

function respostaRenovacao(): RespostaRenovacao {
  return {
    accessToken: ACCESS_TOKEN_PROTOTIPO,
    tokenTipo: 'Bearer',
    accessTokenExpiraEm: ACCESS_EXPIRY,
    refreshToken: null,
    refreshTokenExpiraEm: REFRESH_EXPIRY,
  };
}

export class AutenticacaoPrototipo implements AutenticacaoApi {
  private activeEmail: string | null = null;
  private reativacaoPorEmailPendente = false;
  private reativacaoPorEmailUtilizada = false;

  obterContaAtivaId(accessToken: string): string | null {
    if (accessToken !== ACCESS_TOKEN_PROTOTIPO || !this.activeEmail)
      return null;
    return contas[this.activeEmail]?.id ?? null;
  }

  async login(input: EntradaLogin): Promise<RespostaLogin> {
    const email = input.email.trim().toLowerCase();
    const account = contas[email];
    const cadastroPendente = Array.from(cadastrosPendentes.values()).some(
      ({ input: pendente }) => pendente.email.trim().toLowerCase() === email,
    );
    if (cadastroPendente) throw emailNaoConfirmado();
    if (emailsAguardandoConsentimento.has(email)) {
      throw new ErroApi({
        type: 'https://campolivre.app/problemas/conta-inapta',
        title: 'Conta inapta',
        status: 403,
        codigo: 'CONTA_INAPTA',
      });
    }
    if (!account || input.senha !== senhas[email]) {
      throw invalidCredentials();
    }
    this.activeEmail = email;
    return {
      ...respostaRenovacao(),
      usuario: {
        id: account.id,
        nome: account.nome,
        nomeUsuario: account.nomeUsuario,
        administrador: account.administrador,
        organizadorHabilitado: account.organizadorHabilitado,
      },
    };
  }

  async renovar(): Promise<RespostaRenovacao> {
    if (!this.activeEmail) {
      throw new ErroApi({
        type: 'about:blank',
        title: 'Sessão indisponível',
        status: 401,
        codigo: 'RENOVACAO_INVALIDA',
      });
    }
    return respostaRenovacao();
  }

  async logout(): Promise<void> {
    this.activeEmail = null;
  }

  async ativarOrganizador(
    accessToken: string,
  ): Promise<RespostaAtivacaoOrganizador> {
    if (accessToken !== ACCESS_TOKEN_PROTOTIPO || !this.activeEmail) {
      throw invalidCredentials();
    }
    const account = contas[this.activeEmail];
    if (!account) throw invalidCredentials();
    account.organizadorHabilitado = true;
    account.atualizadoEm = new Date().toISOString();
    return {
      organizadorHabilitado: true,
      organizadorHabilitadoEm: account.atualizadoEm,
    };
  }

  async desativarConta(accessToken: string): Promise<RespostaDesativacaoConta> {
    if (accessToken !== ACCESS_TOKEN_PROTOTIPO || !this.activeEmail) {
      throw invalidCredentials();
    }
    const eliminacaoPrevistaEm = new Date(
      Date.now() + 90 * 24 * 60 * 60 * 1000,
    ).toISOString();
    this.activeEmail = null;
    return {
      contaInativada: true,
      sessoesRevogadas: true,
      eliminacaoPrevistaEm,
      prazoDias: 90,
    };
  }

  async consultarMinhaConta(accessToken: string): Promise<MinhaConta> {
    if (accessToken !== ACCESS_TOKEN_PROTOTIPO || !this.activeEmail) {
      throw invalidCredentials();
    }
    const account = contas[this.activeEmail];
    if (!account) throw invalidCredentials();
    return structuredClone(account);
  }

  async atualizarMinhaConta(
    accessToken: string,
    input: EntradaAtualizacaoMinhaConta,
  ): Promise<MinhaConta> {
    if (accessToken !== ACCESS_TOKEN_PROTOTIPO || !this.activeEmail) {
      throw invalidCredentials();
    }
    const account = contas[this.activeEmail];
    if (!account) throw invalidCredentials();
    if (input.nome !== undefined) account.nome = input.nome;
    if (input.biografia !== undefined) account.biografia = input.biografia;
    if (input.posicaoPrincipal !== undefined) {
      account.posicaoPrincipal = input.posicaoPrincipal;
    }
    if (input.municipioId !== undefined && account.municipio) {
      account.municipio.id = input.municipioId;
    }
    account.atualizadoEm = new Date().toISOString();
    return structuredClone(account);
  }

  async enviarFotoMinhaConta(
    accessToken: string,
    arquivo: File,
  ): Promise<RespostaFotoMinhaConta> {
    if (accessToken !== ACCESS_TOKEN_PROTOTIPO || !this.activeEmail) {
      throw invalidCredentials();
    }
    const account = contas[this.activeEmail];
    if (!account) throw invalidCredentials();
    account.fotoUrl = `/prototipo/fotos/${encodeURIComponent(arquivo.name)}`;
    account.atualizadoEm = new Date().toISOString();
    return { fotoUrl: account.fotoUrl, atualizadoEm: account.atualizadoEm };
  }

  async removerFotoMinhaConta(accessToken: string): Promise<void> {
    if (accessToken !== ACCESS_TOKEN_PROTOTIPO || !this.activeEmail) {
      throw invalidCredentials();
    }
    const account = contas[this.activeEmail];
    if (!account) throw invalidCredentials();
    account.fotoUrl = null;
    account.atualizadoEm = new Date().toISOString();
  }

  async alterarSenha(
    accessToken: string,
    input: EntradaAlteracaoSenha,
  ): Promise<RespostaAlteracaoSenha> {
    if (accessToken !== ACCESS_TOKEN_PROTOTIPO || !this.activeEmail) {
      throw invalidCredentials();
    }
    if (senhas[this.activeEmail] !== input.senhaAtual) {
      throw new ErroApi({
        type: 'https://campolivre.app/problemas/senha-atual-incorreta',
        title: 'Senha atual incorreta',
        status: 422,
        codigo: 'SENHA_ATUAL_INCORRETA',
      });
    }
    senhas[this.activeEmail] = input.novaSenha;
    this.activeEmail = null;
    return {
      senhaAlterada: true,
      sessoesRevogadas: true,
      novoLoginNecessario: true,
    };
  }

  async solicitarAlteracaoEmail(
    accessToken: string,
    novoEmailInformado: string,
  ): Promise<RespostaSolicitacaoAlteracaoEmail> {
    if (accessToken !== ACCESS_TOKEN_PROTOTIPO || !this.activeEmail) {
      throw invalidCredentials();
    }
    const novoEmail = novoEmailInformado.trim().toLowerCase();
    const account = contas[this.activeEmail];
    if (!account) throw invalidCredentials();
    account.emailPendente = novoEmail;
    const [local = '', dominio = ''] = novoEmail.split('@');
    return {
      confirmacaoPendente: true,
      novoEmailMascarado: `${local.slice(0, 1)}***@${dominio}`,
      expiraEm: '2030-01-01T00:30:00.000Z',
    };
  }

  async confirmarAlteracaoEmail(
    token: string,
  ): Promise<RespostaConfirmacaoAlteracaoEmail> {
    const prefixo = 'alteracao-email-token-';
    if (!token.startsWith(prefixo)) {
      throw tokenRecuperacaoInvalido('TOKEN_INVALIDO');
    }
    const novoEmail = decodeURIComponent(token.slice(prefixo.length));
    const atual = Object.entries(contas).find(
      ([, account]) => account.emailPendente === novoEmail,
    );
    if (!atual) throw tokenRecuperacaoInvalido('TOKEN_INVALIDO');
    const [emailAtual, account] = atual;
    const senha = senhas[emailAtual];
    delete contas[emailAtual];
    delete senhas[emailAtual];
    account.email = novoEmail;
    account.emailPendente = null;
    contas[novoEmail] = account;
    if (senha) senhas[novoEmail] = senha;
    if (this.activeEmail === emailAtual) this.activeEmail = novoEmail;
    return { emailAlterado: true, emailConfirmado: true };
  }

  async reativarConta(
    input: EntradaReativacaoConta,
  ): Promise<RespostaReativacaoConta> {
    const email = input.email.trim().toLowerCase();
    if (
      email !== 'inativa@campolivre.test' ||
      input.senha !== 'senha-mock' ||
      !input.confirmacao
    ) {
      throw invalidCredentials();
    }
    if (!contas[email]) {
      contas[email] = criarContaPrototipo({
        id: 'conta-reativada-prototipo',
        nome: 'Conta Reativada',
        nomeUsuario: 'contareativada',
        email,
        cpf: '55555555555',
        rgNumero: '555555555',
        nascimento: '1990-05-05',
        idade: 36,
      });
      senhas[email] = input.senha;
    }
    this.activeEmail = null;
    return {
      contaReativada: true,
      eliminacaoCancelada: true,
      novoLoginNecessario: true,
    };
  }

  async solicitarReativacaoConta(
    emailInformado: string,
  ): Promise<RespostaSolicitacaoReativacaoConta> {
    this.reativacaoPorEmailPendente =
      emailInformado.trim().toLowerCase() === 'inativa@campolivre.test';
    if (this.reativacaoPorEmailPendente) {
      this.reativacaoPorEmailUtilizada = false;
    }
    return { solicitacaoAceita: true };
  }

  async confirmarReativacaoConta(
    token: string,
  ): Promise<RespostaReativacaoConta> {
    if (this.reativacaoPorEmailUtilizada) {
      throw tokenRecuperacaoInvalido('TOKEN_JA_UTILIZADO');
    }
    if (
      token !== 'reativacao-token-inativa@campolivre.test' ||
      !this.reativacaoPorEmailPendente
    ) {
      throw tokenRecuperacaoInvalido('TOKEN_INVALIDO');
    }
    this.reativacaoPorEmailPendente = false;
    this.reativacaoPorEmailUtilizada = true;
    return this.reativarConta({
      email: 'inativa@campolivre.test',
      senha: 'senha-mock',
      confirmacao: true,
    });
  }

  async solicitarRecuperacao(
    emailInformado: string,
  ): Promise<RespostaSolicitacaoRecuperacao> {
    const email = emailInformado.trim().toLowerCase();
    if (contas[email]) {
      recuperacoesPendentes.set(
        `recuperacao-token-${encodeURIComponent(email)}`,
        email,
      );
    }
    return { solicitacaoAceita: true };
  }

  async redefinirSenha(
    input: EntradaRedefinicaoSenha,
  ): Promise<RespostaRedefinicaoSenha> {
    if (tokensRecuperacaoUtilizados.has(input.token)) {
      throw tokenRecuperacaoInvalido('TOKEN_JA_UTILIZADO');
    }
    const email = recuperacoesPendentes.get(input.token);
    if (!email) throw tokenRecuperacaoInvalido('TOKEN_INVALIDO');
    senhas[email] = input.novaSenha;
    recuperacoesPendentes.delete(input.token);
    tokensRecuperacaoUtilizados.add(input.token);
    this.activeEmail = null;
    return {
      senhaAlterada: true,
      sessoesRevogadas: true,
      novoLoginNecessario: true,
    };
  }

  async cadastrar(input: EntradaCadastro): Promise<RespostaCadastro> {
    const cadastroId = `cadastro-${input.nomeUsuario}`;
    const cadastroToken = `prototipo:${cadastroId}`;
    cadastrosPendentes.set(cadastroToken, { input, cadastroId });
    const nascimento = new Date(`${input.dataNascimento}T00:00:00`);
    const agora = new Date();
    let idade = agora.getFullYear() - nascimento.getFullYear();
    const aniversarioAindaNaoOcorreu =
      agora.getMonth() < nascimento.getMonth() ||
      (agora.getMonth() === nascimento.getMonth() &&
        agora.getDate() < nascimento.getDate());
    if (aniversarioAindaNaoOcorreu) idade -= 1;
    return {
      cadastroId,
      status: idade < 18 ? 'AGUARDANDO_CONSENTIMENTO' : 'PENDENTE_CONFIRMACAO',
      proximaAcao: 'CONFIRMAR_EMAIL',
    };
  }

  async confirmarEmail(token: string): Promise<RespostaConfirmacaoEmail> {
    if (tokensConfirmacaoEmailUtilizados.has(token)) {
      throw tokenRecuperacaoInvalido('TOKEN_JA_UTILIZADO');
    }
    const pendente = cadastrosPendentes.get(token);
    if (!pendente) throw tokenRecuperacaoInvalido('TOKEN_INVALIDO');

    const { input } = pendente;
    const email = input.email.trim().toLowerCase();
    const nascimento = new Date(`${input.dataNascimento}T00:00:00`);
    const agora = new Date();
    let idade = agora.getFullYear() - nascimento.getFullYear();
    const aniversarioAindaNaoOcorreu =
      agora.getMonth() < nascimento.getMonth() ||
      (agora.getMonth() === nascimento.getMonth() &&
        agora.getDate() < nascimento.getDate());
    if (aniversarioAindaNaoOcorreu) idade -= 1;

    contas[email] = criarContaPrototipo({
      id: pendente.cadastroId,
      nome: input.nome,
      nomeUsuario: input.nomeUsuario,
      email,
      cpf: input.cpf,
      rgNumero: input.rgNumero,
      nascimento: input.dataNascimento,
      idade,
    });
    contas[email].telefone = input.telefone;
    contas[email].rg.orgaoExpedidor = input.rgOrgaoExpedidor;
    contas[email].rg.uf = input.rgUf;
    senhas[email] = input.senha;
    cadastrosPendentes.delete(token);
    tokensConfirmacaoEmailUtilizados.add(token);
    if (idade < 18) emailsAguardandoConsentimento.add(email);
    return {
      emailConfirmado: true,
      statusConta: idade < 18 ? 'AGUARDANDO_CONSENTIMENTO' : 'ATIVA',
      consentimentoResponsavelNecessario: idade < 18,
    };
  }

  async reenviarConfirmacaoEmail(
    _email: string,
  ): Promise<RespostaReenvioConfirmacaoEmail> {
    return { envioAceito: true };
  }
}

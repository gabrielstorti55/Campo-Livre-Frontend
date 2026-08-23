import { ErroApi } from '@/services/api/problem-details';
import type { AutenticacaoApi } from '@/services/autenticacao/autenticacao-api';
import type {
  EntradaCadastro,
  EntradaLogin,
  EntradaRedefinicaoSenha,
  MinhaConta,
  RespostaCadastro,
  RespostaConfirmacaoEmail,
  RespostaLogin,
  RespostaRedefinicaoSenha,
  RespostaRenovacao,
  RespostaSolicitacaoRecuperacao,
} from '@/types/api/autenticacao';

const ACCESS_TOKEN_FAKE = 'access-token-fake-apenas-em-memoria';
const ACCESS_EXPIRY = '2030-01-01T00:15:00.000Z';
const REFRESH_EXPIRY = '2030-01-30T00:00:00.000Z';

function criarContaFake(input: {
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
  'pessoa@campolivre.test': criarContaFake({
    id: 'conta-marcos',
    nome: 'Marcos Oliveira',
    nomeUsuario: 'marcosoliveira',
    email: 'pessoa@campolivre.test',
    cpf: '00000000000',
    rgNumero: '000000000',
    nascimento: '1995-05-10',
    idade: 31,
    organizadorHabilitado: true,
  }),
  'sem-time@campolivre.test': criarContaFake({
    id: 'conta-lucas',
    nome: 'Lucas Ferreira',
    nomeUsuario: 'lucasferreira',
    email: 'sem-time@campolivre.test',
    cpf: '11111111111',
    rgNumero: '111111111',
    nascimento: '1998-08-20',
    idade: 28,
  }),
  'atleta-cancelado@campolivre.test': criarContaFake({
    id: 'conta-atleta-cancelado',
    nome: 'Rafael Lima',
    nomeUsuario: 'rafaellima',
    email: 'atleta-cancelado@campolivre.test',
    cpf: '44444444444',
    rgNumero: '444444444',
    nascimento: '1997-03-14',
    idade: 29,
  }),
  'colaborador@campolivre.test': criarContaFake({
    id: 'conta-colaboradora',
    nome: 'Juliana Lopes',
    nomeUsuario: 'julianalopes',
    email: 'colaborador@campolivre.test',
    cpf: '22222222222',
    rgNumero: '222222222',
    nascimento: '1992-02-02',
    idade: 34,
    organizadorHabilitado: true,
  }),
  'prefeitura@campolivre.test': criarContaFake({
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

function invalidCredentials(): ErroApi {
  return new ErroApi({
    type: 'https://campolivre.app/problemas/credenciais-invalidas',
    title: 'Credenciais inválidas',
    status: 401,
    detail: 'E-mail ou senha inválidos.',
    codigo: 'CREDENCIAIS_INVALIDAS',
  });
}

function respostaRenovacao(): RespostaRenovacao {
  return {
    accessToken: ACCESS_TOKEN_FAKE,
    tokenTipo: 'Bearer',
    accessTokenExpiraEm: ACCESS_EXPIRY,
    refreshToken: null,
    refreshTokenExpiraEm: REFRESH_EXPIRY,
  };
}

export class AutenticacaoFake implements AutenticacaoApi {
  private activeEmail: string | null = null;

  registrarContaPrototipo(account: { name: string; email: string }): void {
    const email = account.email.trim().toLowerCase();
    contas[email] = criarContaFake({
      id: `conta-prototipo-${email}`,
      nome: account.name,
      nomeUsuario: email.split('@')[0] || 'conta-prototipo',
      email,
      cpf: '99999999999',
      rgNumero: '999999999',
      nascimento: '2000-01-01',
      idade: 26,
    });
  }

  async login(input: EntradaLogin): Promise<RespostaLogin> {
    const email = input.email.trim().toLowerCase();
    const account = contas[email];
    if (!account || input.senha !== 'senha-mock') {
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

  async consultarMinhaConta(accessToken: string): Promise<MinhaConta> {
    if (accessToken !== ACCESS_TOKEN_FAKE || !this.activeEmail) {
      throw invalidCredentials();
    }
    const account = contas[this.activeEmail];
    if (!account) throw invalidCredentials();
    return structuredClone(account);
  }

  async solicitarRecuperacao(
    _email: string,
  ): Promise<RespostaSolicitacaoRecuperacao> {
    return { solicitacaoAceita: true };
  }

  async redefinirSenha(
    _input: EntradaRedefinicaoSenha,
  ): Promise<RespostaRedefinicaoSenha> {
    return {
      senhaAlterada: true,
      sessoesRevogadas: true,
      novoLoginNecessario: true,
    };
  }

  async cadastrar(input: EntradaCadastro): Promise<RespostaCadastro> {
    return {
      cadastroId: `cadastro-${input.nomeUsuario}`,
      cadastroToken: `cadastro-token-${input.nomeUsuario}`,
      status: 'PENDENTE_CONFIRMACAO',
      emailConfirmado: false,
      consentimentoResponsavelNecessario: false,
      proximaAcao: 'CONFIRMAR_EMAIL',
    };
  }

  async confirmarEmail(_token: string): Promise<RespostaConfirmacaoEmail> {
    return {
      emailConfirmado: true,
      statusConta: 'ATIVA',
      consentimentoResponsavelNecessario: false,
    };
  }
}

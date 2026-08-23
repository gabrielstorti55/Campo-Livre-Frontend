export type PlataformaLogin = 'WEB' | 'MOBILE';

export type EntradaLogin = {
  email: string;
  senha: string;
  plataforma: PlataformaLogin;
};

export type UsuarioAutenticado = {
  id: string;
  nome: string;
  nomeUsuario: string;
  administrador: boolean;
  organizadorHabilitado: boolean;
};

export type RespostaRenovacao = {
  accessToken: string;
  tokenTipo: 'Bearer';
  accessTokenExpiraEm: string;
  refreshToken: null;
  refreshTokenExpiraEm: string;
};

export type RespostaLogin = RespostaRenovacao & {
  usuario: UsuarioAutenticado;
};

export type PosicaoPrincipal =
  'GOLEIRO' | 'ZAGUEIRO' | 'LATERAL' | 'MEIO_CAMPO' | 'ATACANTE';

export type MinhaConta = {
  id: string;
  nome: string;
  nomeUsuario: string;
  email: string;
  emailPendente: string | null;
  emailConfirmado: boolean;
  telefone: string | null;
  cpf: string;
  rg: {
    numero: string;
    orgaoExpedidor: string;
    uf: string;
  };
  dataNascimento: string;
  idade: number;
  municipio: {
    id: string;
    nome: string;
    uf: string;
  };
  fotoUrl: string | null;
  biografia: string | null;
  posicaoPrincipal: PosicaoPrincipal | null;
  status: 'ATIVA';
  organizadorHabilitado: boolean;
  administrador: boolean;
  criadoEm: string;
  atualizadoEm: string;
};

export type EntradaCadastro = {
  nome: string;
  nomeUsuario: string;
  email: string;
  telefone: string | null;
  cpf: string;
  rgNumero: string;
  rgOrgaoExpedidor: string;
  rgUf: string;
  dataNascimento: string;
  municipioId: string;
  senha: string;
  termosAceitos: true;
};

export type ProximaAcaoCadastro = 'CONFIRMAR_EMAIL' | 'INFORMAR_RESPONSAVEL';

export type RespostaCadastro = {
  cadastroId: string;
  cadastroToken: string;
  status: 'PENDENTE_CONFIRMACAO' | 'AGUARDANDO_CONSENTIMENTO';
  emailConfirmado: false;
  consentimentoResponsavelNecessario: boolean;
  proximaAcao: ProximaAcaoCadastro;
};

export type EntradaRedefinicaoSenha = {
  token: string;
  novaSenha: string;
};

export type RespostaSolicitacaoRecuperacao = {
  solicitacaoAceita: true;
};

export type RespostaRedefinicaoSenha = {
  senhaAlterada: true;
  sessoesRevogadas: true;
  novoLoginNecessario: true;
};

export type RespostaConfirmacaoEmail = {
  emailConfirmado: true;
  statusConta: 'ATIVA' | 'AGUARDANDO_CONSENTIMENTO';
  consentimentoResponsavelNecessario: boolean;
};

export type ErroDeCampo = {
  campo: string;
  mensagem: string;
};

export type ProblemDetails = {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  codigo: string;
  erros?: ErroDeCampo[];
};

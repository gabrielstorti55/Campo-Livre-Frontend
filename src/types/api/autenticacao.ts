export type PlataformaLogin = 'WEB' | 'MOBILE';

export type EntradaLogin = {
  email: string;
  senha: string;
  plataforma: PlataformaLogin;
};

export type UsuarioAutenticado = {
  id: string;
  nome: string | null;
  nomeUsuario: string | null;
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
  cpf: string | null;
  rg: {
    numero: string | null;
    orgaoExpedidor: string | null;
    uf: string | null;
  };
  dataNascimento: string | null;
  idade: number | null;
  municipio: {
    id: string;
    nome: string;
    uf: string;
  } | null;
  fotoUrl: string | null;
  biografia: string | null;
  posicaoPrincipal: PosicaoPrincipal | null;
  status: 'ATIVA';
  organizadorHabilitado: boolean;
  administrador: boolean;
  criadoEm: string;
  atualizadoEm: string;
};

export type RespostaAtivacaoOrganizador = {
  organizadorHabilitado: true;
  organizadorHabilitadoEm: string;
};

export type RespostaDesativacaoConta = {
  contaInativada: true;
  sessoesRevogadas: true;
  eliminacaoPrevistaEm: string;
  prazoDias: number;
};

export type EntradaAtualizacaoMinhaConta = {
  nome?: string;
  biografia?: string | null;
  municipioId?: string;
  posicaoPrincipal?: PosicaoPrincipal | null;
};

export type RespostaFotoMinhaConta = {
  fotoUrl: string;
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

export type ProximaAcaoCadastro = 'CONFIRMAR_EMAIL';

export type RespostaCadastro = {
  cadastroId: string;
  status: 'PENDENTE_CONFIRMACAO' | 'AGUARDANDO_CONSENTIMENTO';
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

export type EntradaAlteracaoSenha = {
  senhaAtual: string;
  novaSenha: string;
};

export type RespostaAlteracaoSenha = RespostaRedefinicaoSenha;

export type RespostaSolicitacaoAlteracaoEmail = {
  confirmacaoPendente: true;
  novoEmailMascarado: string;
  expiraEm: string;
};

export type RespostaConfirmacaoAlteracaoEmail = {
  emailAlterado: true;
  emailConfirmado: true;
};

export type EntradaReativacaoConta = {
  email: string;
  senha: string;
  confirmacao: true;
};

export type RespostaReativacaoConta = {
  contaReativada: true;
  eliminacaoCancelada: true;
  novoLoginNecessario: true;
};

export type RespostaSolicitacaoReativacaoConta = {
  solicitacaoAceita: true;
};

export type RespostaConfirmacaoEmail = {
  emailConfirmado: true;
  statusConta: 'ATIVA' | 'AGUARDANDO_CONSENTIMENTO';
  consentimentoResponsavelNecessario: boolean;
};

export type RespostaReenvioConfirmacaoEmail = {
  envioAceito: true;
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

export type CategoriaBloqueio =
  'VIOLACAO_TERMOS' | 'SEGURANCA' | 'FRAUDE' | 'OUTRO';

export type Pagina<T> = {
  itens: T[];
  pagina: number;
  tamanho: number;
  totalItens: number;
  totalPaginas: number;
};

export type ResumoAdministrador = {
  usuarioId: string;
  nome: string;
  email: string;
  status: 'ATIVA' | 'BLOQUEADA';
  concedidoEm: string | null;
  concedidoPorUsuarioId: string | null;
};

export type UsuarioInstitucional = {
  usuarioId: string;
  nome: string;
  nomeUsuario: string;
};

export type FiltrosAdministradores = {
  pagina?: number;
  tamanho?: number;
  nome?: string | undefined;
  email?: string | undefined;
};

export type EntradaBloqueio = {
  categoria: CategoriaBloqueio;
  motivo: string;
};

export type RespostaBloqueio = {
  usuarioId: string;
  status: 'BLOQUEADA';
  categoria: CategoriaBloqueio;
  sessoesRevogadas: true;
  bloqueadoEm: string;
};

export type RespostaDesbloqueio = {
  usuarioId: string;
  status: 'ATIVA';
  novoLoginNecessario: true;
};

export type RespostaConcessaoAdministrador = {
  usuarioId: string;
  administrador: true;
  concedidoEm: string;
};

export type RespostaRevogacaoAdministrador = {
  usuarioId: string;
  administrador: false;
  revogadoEm: string | null;
};

export type PaginaAdministradores = Pagina<ResumoAdministrador>;
export type PaginaUsuariosInstitucionais = Pagina<UsuarioInstitucional>;

export type FiltrosPrefeiturasAdministrativas = {
  nome?: string;
  municipioId?: string;
  uf?: string;
  pagina?: number;
  tamanho?: number;
};

export type PrefeituraAdministrativa = {
  id: string;
  nomeOficial: string;
  status: 'EM_CONFIGURACAO' | 'ATIVA' | 'INATIVA';
  municipio: { id: string; nome: string; uf: string; codigoIbge: string };
  responsavel: { usuarioId: string; nome: string; email: string } | null;
};

export type PaginaPrefeiturasAdministrativas = Pagina<PrefeituraAdministrativa>;

export type EntradaCriacaoPrefeitura = {
  municipioId: string;
  nomeOficial: string;
  cnpj: string | null;
  emailContatoPublico: string;
  telefoneContatoPublico: string | null;
  responsavelInicialUsuarioId: string;
};

export type PrefeituraCriadaAdministracao = {
  id: string;
  status: 'EM_CONFIGURACAO';
  municipioId: string;
  nomeOficial: string;
  conviteResponsavelId: string;
  conviteExpiraEm: string;
};

export type EntradaEdicaoPrefeitura = {
  nomeOficial?: string;
  emailContatoPublico?: string;
  telefoneContatoPublico?: string | null;
};

export type PrefeituraEditadaAdministracao = {
  id: string;
  nomeOficial: string;
  emailContatoPublico: string;
  telefoneContatoPublico: string | null;
  atualizadoEm: string;
};

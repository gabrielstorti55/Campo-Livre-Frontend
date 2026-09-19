export type PrefeituraDaConta = {
  membroId: string;
  papel: 'RESPONSAVEL' | 'MEMBRO';
  iniciadoEm: string;
  prefeitura: {
    id: string;
    nomeOficial: string;
    status: 'ATIVA' | 'INATIVA';
    municipio: { id: string; nome: string; uf: string };
    emailContatoPublico: string;
    telefoneContatoPublico: string | null;
  };
};

export type PaginaPrefeiturasDaConta = {
  itens: PrefeituraDaConta[];
  pagina: number;
  tamanho: number;
  totalItens: number;
  totalPaginas: number;
};

export type PapelFuncionarioPrefeitura = 'RESPONSAVEL' | 'MEMBRO';
export type StatusFuncionarioPrefeitura = 'ATIVO' | 'ENCERRADO';

export type FuncionarioPrefeitura = {
  membroId: string;
  usuarioId: string;
  nome: string;
  nomeUsuario: string;
  papel: PapelFuncionarioPrefeitura;
  status: StatusFuncionarioPrefeitura;
  iniciadoEm: string;
  encerradoEm: string | null;
};

export type PaginaFuncionariosPrefeitura = {
  itens: FuncionarioPrefeitura[];
  pagina: number;
  tamanho: number;
  totalItens: number;
  totalPaginas: number;
};

export type ConvitePrefeituraEnviado = {
  conviteId: string;
  destinatario: {
    usuarioId: string;
    nome: string;
    nomeUsuario: string;
    emailMascarado: string;
  };
  papelDestino: 'MEMBRO';
  status: 'PENDENTE';
  convidadoEm: string;
  reenviadoEm: string | null;
  expiraEm: string;
  acoesPermitidas: 'REENVIAR'[];
};

export type PaginaConvitesPrefeituraEnviados = {
  itens: ConvitePrefeituraEnviado[];
  pagina: number;
  tamanho: number;
  totalItens: number;
  totalPaginas: number;
};

export type UsuarioInstitucional = {
  usuarioId: string;
  nome: string;
  nomeUsuario: string;
};

export type PaginaUsuariosInstitucionais = {
  itens: UsuarioInstitucional[];
  pagina: number;
  tamanho: number;
  totalItens: number;
  totalPaginas: number;
};

export type ConvitePrefeituraCriado = {
  conviteId: string;
  papelDestino: 'MEMBRO';
  status: 'PENDENTE';
  expiraEm: string;
};

export type ReenvioConvitePrefeitura = {
  conviteId: string;
  status: 'PENDENTE';
  expiraEm: string;
};

export type RemocaoFuncionarioPrefeitura = {
  membroId: string;
  status: 'ENCERRADO';
  encerradoEm: string;
};

export type TransferenciaResponsabilidadePrefeitura = {
  prefeituraId: string;
  responsavelMembroId: string;
  responsavelAnteriorPapel: 'MEMBRO';
  transferidoEm: string;
};

export type ConvitePrefeituraRecebido = {
  conviteId: string;
  prefeitura: {
    id: string;
    nomeOficial: string;
    municipio: { nome: string; uf: string };
  };
  papelDestino: PapelFuncionarioPrefeitura;
  convidadoEm: string;
  expiraEm: string;
  acoesPermitidas: ('ACEITAR' | 'RECUSAR')[];
};

export type PaginaConvitesPrefeituraRecebidos = {
  itens: ConvitePrefeituraRecebido[];
  pagina: number;
  tamanho: number;
  totalItens: number;
  totalPaginas: number;
};

export type AceiteConvitePrefeitura = {
  prefeituraId: string;
  papel: PapelFuncionarioPrefeitura;
  vinculoAtivo: true;
};

export type ConvitePrefeituraPorToken = {
  prefeituraId: string;
  prefeituraNome: string;
  papelDestino: PapelFuncionarioPrefeitura;
  status: 'PENDENTE';
  expiraEm: string;
};

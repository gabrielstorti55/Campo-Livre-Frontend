export type StatusOperacionalCampo = 'ATIVO' | 'INATIVO' | 'EM_MANUTENCAO';

export type MunicipioCampo = {
  id: string;
  nome: string;
  uf: string;
};

export type CampoResumo = {
  id: string;
  nome: string;
  endereco: string;
  municipio: MunicipioCampo;
  statusOperacional: StatusOperacionalCampo;
};

export type CampoDetalhado = CampoResumo & {
  descricao: string | null;
  prefeitura: {
    nomeOficial: string;
    emailInstitucional: string;
  };
  aviso: string;
};

export type FiltrosCampos = {
  nome?: string;
  municipioId?: string;
  statusOperacional?: StatusOperacionalCampo;
  pagina?: number;
  tamanho?: number;
};

export type PaginaCampos = {
  itens: CampoResumo[];
  pagina: number;
  tamanho: number;
  totalItens: number;
  totalPaginas: number;
};

export type CadastroCampo = {
  nome: string;
  endereco: string;
  descricao: string | null;
};

export type CampoCriado = CadastroCampo & {
  id: string;
  prefeituraId: string;
  municipioId: string;
  statusOperacional: 'ATIVO';
  criadoEm: string;
};

export type AtualizacaoCampo = Partial<CadastroCampo>;

export type CampoAtualizado = CadastroCampo & {
  id: string;
  atualizadoEm: string;
};

export type AlteracaoEstadoOperacionalCampo = {
  statusOperacional: StatusOperacionalCampo;
  motivo: string;
  confirmacao: true;
};

export type EstadoOperacionalCampoAlterado = {
  id: string;
  statusOperacional: StatusOperacionalCampo;
  estadoAnterior: StatusOperacionalCampo;
  alterado: boolean;
  alteradoEm: string;
};

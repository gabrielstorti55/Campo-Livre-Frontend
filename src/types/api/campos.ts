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

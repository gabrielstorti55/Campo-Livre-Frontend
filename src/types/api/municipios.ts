export type Municipio = {
  id: string;
  nome: string;
  uf: string;
  codigoIbge: string;
};

export type FiltrosMunicipios = {
  nome?: string;
  uf?: string;
  pagina?: number;
  tamanho?: number;
};

export type PaginaMunicipios = {
  itens: Municipio[];
  pagina: number;
  tamanho: number;
  totalItens: number;
  totalPaginas: number;
};

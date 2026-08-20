export type PapelOrganizador = 'RESPONSAVEL' | 'ORGANIZADOR';
export type ContextoOrganizacao =
  | { tipo: 'PESSOAL'; nome: string }
  | { tipo: 'PREFEITURA'; nome: string; prefeituraId: string };

export type EstadoCampeonatoOperacional =
  'EM_CONFIGURACAO' | 'EM_ANDAMENTO' | 'ENCERRADO' | 'CANCELADO';

export type CampeonatoOrganizador = {
  id: number;
  nome: string;
  modalidade: string;
  formato: 'PONTOS_CORRIDOS' | 'MATA_MATA' | 'GRUPOS_MATA_MATA';
  municipio: string;
  uf: string;
  inicio: string;
  visibilidade: 'PUBLICO';
  estado: EstadoCampeonatoOperacional;
  inscricoesAbertasEm?: string;
  contexto: ContextoOrganizacao;
  responsavel: string;
  timeIds: number[];
  partidaIds: number[];
  pendencias: string[];
  convitesPendentes: number;
};

export type VinculoCampeonatoOrganizador = {
  contaId: string;
  campeonatoId: number;
  papel: PapelOrganizador;
};

export type CampeonatoAdministravel = CampeonatoOrganizador & {
  papelDaConta: PapelOrganizador;
};

export type SituacaoComercialOrganizador = {
  primeiroCampeonatoUtilizado: boolean;
  direitosAdicionaisDisponiveis: number;
  contextoPrefeituraIsento: boolean;
  compras: Array<{
    id: string;
    campeonato: string;
    estado: 'PAGO' | 'PENDENTE' | 'CANCELADO';
    meio: 'PIX';
    valor: string;
    data: string;
  }>;
};

export type ConviteColaborador = {
  id: number;
  campeonatoId: number;
  conta: string;
  contaId?: string;
  contexto: string;
  estado: 'PENDENTE' | 'ACEITO' | 'RECUSADO' | 'CANCELADO';
};

export type ReservaCampeonatoOrganizador = {
  id: number;
  campeonatoId: number;
  campo: string;
  data: string;
  inicio: string;
  fim: string;
  estado: 'PENDENTE' | 'APROVADA' | 'RECUSADA' | 'CANCELADA';
  motivo?: string;
};

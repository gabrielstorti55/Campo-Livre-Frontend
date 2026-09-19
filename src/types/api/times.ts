export type CriacaoTime = {
  nome: string;
  sigla: string;
  municipioId: string;
  descricao: string | null;
};

export type TimeCriado = CriacaoTime & {
  id: string;
  escudoUrl: null;
  status: 'ATIVO';
  capitaoMembroId: string;
};

export type ConviteTimePorToken = {
  conviteId: string;
  time: {
    id: string;
    nome: string;
    sigla: string;
    escudoUrl: string | null;
  };
  destinatario: { emailMascarado: string };
  status: 'PENDENTE';
  expiraEm: string;
  acoesPermitidas: Array<'ACEITAR' | 'RECUSAR'>;
};

export type AceiteConviteTime = {
  conviteId: string;
  status: 'ACEITO';
  timeId: string;
  membroTimeId: string;
  entrouEm: string;
};

export type RecusaConviteTime = {
  conviteId: string;
  status: 'RECUSADO';
  respondidoEm: string;
};

export type ConviteTimePendente = {
  id: string;
  time: {
    id: string;
    nome: string;
    sigla: string;
    escudoUrl: string | null;
  };
  remetente: {
    nome: string;
    nomeUsuario: string;
  };
  expiraEm: string;
};

export type PaginaConvitesTime = {
  itens: ConviteTimePendente[];
  pagina: number;
  tamanho: number;
  totalItens: number;
  totalPaginas: number;
};

export type TimeResumido = {
  id: string;
  nome: string;
  sigla: string;
  escudoUrl: string | null;
  municipio: {
    nome: string;
    uf: string;
  };
};

export type FiltrosTimes = {
  nome?: string;
  municipioId?: string;
  uf?: string;
  pagina?: number;
  tamanho?: number;
};

export type PaginaTimes = {
  itens: TimeResumido[];
  pagina: number;
  tamanho: number;
  totalItens: number;
  totalPaginas: number;
};

export type VinculoTimeDaConta = {
  membroId: string;
  funcao: 'ATLETA' | 'CAPITAO';
  entrouEm: string;
  time: {
    id: string;
    nome: string;
    sigla: string;
    escudoUrl: string | null;
    status: 'ATIVO' | 'DESATIVADO';
  };
};

export type PaginaTimesDaConta = {
  itens: VinculoTimeDaConta[];
  pagina: number;
  tamanho: number;
  totalItens: number;
  totalPaginas: number;
};

export type EstatisticasTime = {
  partidas: number;
  vitorias: number;
  derrotas: number;
  gols: number;
  defesas: number;
  penaltisDefendidos: number;
  cartoesAmarelos: number;
  cartoesVermelhos: number;
};

export type TimeDetalhado = {
  id: string;
  nome: string;
  sigla: string;
  descricao: string | null;
  escudoUrl: string | null;
  municipio: { id: string; nome: string; uf: string };
  status: 'ATIVO' | 'DESATIVADO';
  capitao: { nomeUsuario: string; nome: string };
  elencoResumo: unknown[];
  historicoPartidas: unknown[];
  estatisticasGerais: EstatisticasTime;
  estatisticasPorCampeonato: unknown[];
  posicoesLeaderboards: unknown[];
  titulosEColocacoes: unknown[];
};

export type MembroElenco = {
  membroId: string;
  nome: string;
  nomeUsuario: string;
  fotoUrl: string | null;
  funcao: 'CAPITAO' | 'ATLETA';
  entrouEm: string;
  estatisticas: EstatisticasTime;
};

export type PaginaElenco = {
  itens: MembroElenco[];
  pagina: number;
  tamanho: number;
  totalItens: number;
  totalPaginas: number;
};

export type AtualizacaoTime = {
  nome: string;
  sigla: string;
  descricao: string | null;
};

export type RespostaAtualizacaoTime = AtualizacaoTime & {
  id: string;
  atualizadoEm: string;
};

export type RespostaEscudoTime = {
  timeId: string;
  escudoUrl: string;
  atualizadoEm: string;
};

export type AtletaParaConvite = {
  usuarioId: string;
  nome: string;
  nomeUsuario: string;
  fotoUrl: string | null;
  municipio: { nome: string; uf: string };
  emailMascarado: string;
};

export type ConviteTimeEnviado = {
  id: string;
  timeId: string;
  usuarioDestinatarioId: string;
  status: 'PENDENTE';
  linkCompartilhavel: string;
  expiraEm: string;
  emailEnvioAceito: boolean;
};

export type ConviteTimeEnviadoPendente = {
  conviteId: string;
  destinatario: {
    usuarioId: string;
    nome: string;
    nomeUsuario: string;
    fotoUrl: string | null;
    emailMascarado: string;
  };
  status: 'PENDENTE';
  enviadoEm: string;
  reenviadoEm: string | null;
  expiraEm: string;
  acoesPermitidas: Array<'REENVIAR' | 'CANCELAR'>;
};

export type PaginaConvitesTimeEnviados = {
  itens: ConviteTimeEnviadoPendente[];
  pagina: number;
  tamanho: number;
  totalItens: number;
  totalPaginas: number;
};

export type ReenvioConviteTime = {
  conviteId: string;
  status: 'PENDENTE';
  linkCompartilhavel: string;
  expiraEm: string;
  emailEnvioAceito: boolean;
};

export type CancelamentoConviteTime = {
  conviteId: string;
  status: 'CANCELADO';
  canceladoEm: string;
  canceladoPorUsuarioId: string;
};

export type EncerramentoMembroTime = {
  membroId: string;
  status: 'ENCERRADO';
  saiuEm: string;
  participacoesCampeonatoInativadas: number;
};

export type SaidaVoluntariaTime = EncerramentoMembroTime & {
  motivo: 'SAIDA_VOLUNTARIA';
};

export type TransferenciaCapitania = {
  timeId: string;
  capitaoMembroId: string;
  capitaoAnteriorFuncao: 'ATLETA';
  transferidoEm: string;
};

export type EventoFuncaoMembro = {
  tipo: 'CAPITANIA_TRANSFERIDA';
  funcaoAnterior: 'CAPITAO' | 'ATLETA';
  novaFuncao: 'CAPITAO' | 'ATLETA';
  autorUsuarioId: string;
  ocorridoEm: string;
};

export type HistoricoMembroTime = {
  membroId: string;
  usuarioId: string;
  nome: string;
  entrouEm: string;
  saiuEm: string | null;
  funcaoAtual: 'CAPITAO' | 'ATLETA';
  eventosFuncao: EventoFuncaoMembro[];
  origem: 'FUNDADOR' | 'CONVITE';
  motivoSaida: string | null;
};

export type PaginaHistoricoElenco = {
  itens: HistoricoMembroTime[];
  pagina: number;
  tamanho: number;
  totalItens: number;
  totalPaginas: number;
};

export type DesativacaoTime = {
  timeId: string;
  status: 'DESATIVADO';
  desativadoEm: string;
  convitesAtletasCancelados: number;
  convitesCampeonatosCancelados: number;
};

export type ReativacaoTime = {
  timeId: string;
  status: 'ATIVO';
  reativadoEm: string;
};

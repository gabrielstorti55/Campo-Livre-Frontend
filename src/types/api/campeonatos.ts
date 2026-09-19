export type FormatoCampeonato =
  'PONTOS_CORRIDOS' | 'MATA_MATA' | 'GRUPOS_E_MATA_MATA';

export type EstadoCampeonato =
  | 'EM_INSCRICOES'
  | 'AGUARDANDO_SORTEIO'
  | 'EM_ANDAMENTO'
  | 'ENCERRADO'
  | 'CANCELADO';

export type Pagina<T> = {
  itens: T[];
  pagina: number;
  tamanho: number;
  totalItens: number;
  totalPaginas: number;
};

export type CampeonatoPublicoResumo = {
  id: string;
  nome: string;
  status: 'EM_ANDAMENTO' | 'ENCERRADO' | 'CANCELADO';
  municipio: { id: string; nome: string; uf: string };
};

export type FiltrosCampeonatosPublicos = {
  pagina?: number;
  tamanho?: number;
  nome?: string;
  municipioId?: string;
  uf?: string;
  status?: CampeonatoPublicoResumo['status'];
};

export type CriacaoCampeonato = {
  nome: string;
  municipioId: string;
  contexto: 'PESSOAL' | 'PREFEITURA';
  prefeituraId: string | null;
  formato: FormatoCampeonato;
  inicioPrevistoEm: string;
};

export type CampeonatoCriado = {
  id: string;
  status: 'EM_INSCRICOES';
  responsavelUsuarioId: string;
  situacaoComercial: 'AUTORIZADO' | 'AGUARDANDO_PAGAMENTO';
  origemAutorizacao: 'BENEFICIO' | 'ISENTO_PREFEITURA' | 'PAGAMENTO' | null;
  pagamentoNecessario: boolean;
};

export type CampeonatoConsultado = {
  id: string;
  nome: string;
  status: EstadoCampeonato;
  formato: FormatoCampeonato;
  municipio: { id: string; nome: string; uf: string };
};

export type CampeonatoAdministrado = {
  campeonatoId: string;
  nome: string;
  status: EstadoCampeonato;
  contexto: 'PESSOAL' | 'PREFEITURA';
  prefeitura: { id: string; nome: string } | null;
  vinculo: { funcao: 'RESPONSAVEL' | 'ORGANIZADOR'; status: 'ATIVO' };
  permissoes: string[];
  atualizadoEm: string;
};

export type DetalheAdministrativoCampeonato = {
  campeonatoId: string;
  nome: string;
  descricao: string | null;
  status: EstadoCampeonato;
  formato: FormatoCampeonato;
  contexto: 'PESSOAL' | 'PREFEITURA';
  prefeituraId: string | null;
  municipioId: string;
  inicioPrevistoEm: string;
  fimPrevistoEm: string | null;
  situacaoComercial: 'AUTORIZADO' | 'AGUARDANDO_PAGAMENTO';
  configuracao: {
    limiteTimes: number;
    limiteAtletasPorTime: number;
    quantidadeTurnos: number;
    versao: number;
    valida: boolean;
    pendencias: string[];
  };
  autoridade: {
    funcao: 'RESPONSAVEL' | 'ORGANIZADOR';
    permissoes: string[];
  };
  operacoesPermitidas: string[];
};

export type OrganizadorCampeonato = {
  organizadorId: string;
  usuario: { id: string; nome: string; nomeUsuario: string };
  funcao: 'RESPONSAVEL' | 'ORGANIZADOR';
  status: 'ATIVO' | 'ENCERRADO';
  adicionadoEm: string;
  encerradoEm: string | null;
  podeSerRemovido: boolean;
};

export type UsuarioElegivelOrganizador = {
  usuarioId: string;
  nome: string;
  nomeUsuario: string;
  elegivel: true;
};

export type ConviteCampeonatoEnviado = {
  conviteId: string;
  time: { id: string; nome: string; sigla: string };
  destinatario: { usuarioId: string; nome: string };
  status: 'PENDENTE' | 'ACEITO' | 'RECUSADO' | 'CANCELADO' | 'EXPIRADO';
  enviadoEm: string;
  expiraEm: string;
  encerradoEm: string | null;
  podeCancelar: boolean;
};

export type ElencoContextualCampeonato = {
  campeonatoId: string;
  time: {
    id: string;
    nome: string;
    sigla: string;
    statusParticipacao: 'ATIVO' | 'INATIVO';
  };
  limiteAtletasPorTime: number;
  minimoAtletas: number;
  atletas: Array<{
    atletaCampeonatoId: string;
    membroTimeId: string;
    nomeUsuario: string;
    nomeExibicao: string;
    status: 'ATIVO' | 'INATIVO';
    inscritoEm: string;
  }>;
  quantidadeAtivos: number;
  pendencias: string[];
  atualizadoEm: string;
};

export type AtualizacaoCampeonato = {
  nome: string;
  descricao: string | null;
  inicioPrevistoEm: string;
  fimPrevistoEm: string | null;
};

export type ConfiguracaoRegulamento = {
  regulamentoTexto: string;
  limiteAtletasPorTime: number;
  permiteWo: boolean;
  placarWoMandante: number | null;
  placarWoVisitante: number | null;
  criterioBye: 'ORDEM_INSCRICAO' | 'SORTEIO' | 'SEMENTE';
};

export type CriterioDesempate =
  | 'PONTOS'
  | 'VITORIAS'
  | 'SALDO_GOLS'
  | 'GOLS_PRO'
  | 'CONFRONTO_DIRETO'
  | 'ORDEM_INSCRICAO';

export type ResultadoValidacaoCampeonato = {
  valido: boolean;
  erros: Array<{ codigo: string; mensagem: string }>;
  versaoConfiguracao: number;
};

export type PaginaTimesParticipantes = Pagina<{
  timeId: string;
  nome: string;
  sigla: string;
  escudoUrl: string | null;
  statusParticipacao: 'ATIVO' | 'INATIVO';
  ordemInscricao: number;
}>;

export type ConfiguracaoFase = {
  nome: string;
  tipo: 'PONTOS_CORRIDOS' | 'GRUPOS' | 'MATA_MATA';
  ordem: number;
  turnos: 'TURNO_UNICO' | 'TURNO_E_RETORNO' | null;
  pontosVitoria: number | null;
  pontosEmpate: number | null;
  pontosDerrota: number | null;
  quantidadeGrupos: number | null;
  classificadosPorGrupo: number | null;
  numeroPartidasConfronto: number | null;
  permiteProrrogacao: boolean | null;
  permitePenaltis: boolean | null;
  golDeOuro: boolean | null;
};

export type PosicaoManual = {
  timeId: string;
  faseId: string;
  grupoId: string | null;
  posicao: number;
  semente: number | null;
};

export type PartidaManual = {
  faseId: string;
  grupoId: string | null;
  rodada: number;
  timeMandanteId: string;
  timeVisitanteId: string;
};

export type ConfrontoManual = {
  chaveLocal: string;
  faseId: string;
  rodada: number;
  ordem: number;
  tipo: 'NORMAL' | 'BYE';
  timeAId: string | null;
  timeBId: string | null;
  confrontoDestinoChaveLocal: string | null;
  posicaoDestino: 'A' | 'B' | null;
  criterioByeAplicado: 'ORDEM_INSCRICAO' | 'SORTEIO' | 'SEMENTE' | null;
};

export type FasesPersistidasCampeonato = {
  campeonatoId: string;
  versaoConfiguracao: number;
  fases: Array<{
    faseId: string;
    nome: string;
    ordem: number;
    tipo: 'PONTOS_CORRIDOS' | 'GRUPOS' | 'MATA_MATA';
    quantidadeTurnos: number | null;
    classificadosPorGrupo: number | null;
    grupos: Array<{ grupoId: string; nome: string; ordem: number }>;
    statusMaterializacao: 'NAO_GERADA' | 'GERADA';
  }>;
};

export type DistribuicaoCampeonato = {
  campeonatoId: string;
  estado: 'NAO_EXECUTADA' | 'EXECUTADA';
  modo: 'AUTOMATICA' | 'MANUAL' | null;
  semente: string | null;
  versaoAlgoritmo: string | null;
  executadaEm: string | null;
  posicoes: PosicaoManual[];
};

export type EstruturaMaterializadaCampeonato = {
  campeonatoId: string;
  estado: 'NAO_GERADA' | 'GERADA';
  modo: 'AUTOMATICA' | 'MANUAL' | null;
  geradaEm: string | null;
  pontosCorridos: Array<{
    faseId: string;
    grupoId: string | null;
    rodadas: Array<{ numero: number; partidaIds: string[] }>;
  }>;
  mataMata: Array<{
    confrontoId: string;
    faseId: string;
    rodada: number;
    ordem: number;
    tipo: 'NORMAL' | 'BYE';
    timeAId: string | null;
    timeBId: string | null;
    partidaId: string | null;
    confrontoDestinoId: string | null;
    posicaoDestino: 'A' | 'B' | null;
    criterioByeAplicado: 'ORDEM_INSCRICAO' | 'SORTEIO' | 'SEMENTE' | null;
  }>;
};

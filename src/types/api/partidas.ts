import type { SumulaPublica } from '@/types/publico';

export type RegistroWo = {
  confirmacaoDefinitiva: true;
  timeBeneficiadoId: string;
  fundamentoCodigo: string;
  justificativa: string;
  referenciaAdministrativa: string | null;
};

export type WoRegistrado = {
  partidaId: string;
  estadoPartida: 'ENCERRADA_WO';
  timeBeneficiadoId: string;
  timeInfratorId: string;
  placar: { golsMandante: number; golsVisitante: number };
  registradoEm: string;
};

export type ItemArtilharia = {
  posicao: number;
  jogador: {
    nome: string;
    nomeUsuario: string | null;
    fotoUrl: string | null;
    anonimo: boolean;
  };
  timeContextual: { id: string; nome: string; sigla: string };
  gols: number;
  partidasComAtuacao: number;
};

export type PaginaArtilharia = {
  itens: ItemArtilharia[];
  pagina: number;
  tamanho: number;
  totalItens: number;
  totalPaginas: number;
};

export type LinhaClassificacao = {
  posicao: number;
  timeId: string;
  nome: string;
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  golsPro: number;
  golsContra: number;
  saldoGols: number;
  pontos: number;
  classificado: boolean;
};

export type ConfrontoClassificacao = {
  confrontoId: string;
  rodada: number;
  ordem: number;
  estado:
    | 'AGUARDANDO_PARTICIPANTES'
    | 'AGUARDANDO_PARTIDA'
    | 'EM_DISPUTA'
    | 'DEFINIDO'
    | 'BYE';
  timeA: { timeId: string; nome: string } | null;
  timeB: { timeId: string; nome: string } | null;
  partidas: Array<{
    partidaId: string;
    estado: 'AGENDADA' | 'ENCERRADA_SUMULA' | 'ENCERRADA_WO';
    placarRegulamentar: { mandante: number; visitante: number } | null;
    placarProrrogacao: { mandante: number; visitante: number } | null;
    placarPenaltis: { mandante: number; visitante: number } | null;
  }>;
  classificadoTimeId: string | null;
  confrontoDestinoId: string | null;
  posicaoDestino: 'A' | 'B' | null;
};

export type ClassificacaoCampeonato = {
  campeonatoId: string;
  faseId: string;
  grupoId: string | null;
  tipoProjecao: 'CLASSIFICACAO' | 'CHAVEAMENTO';
  estadoProjecao: 'SEM_RESULTADOS' | 'PARCIAL' | 'DEFINITIVA';
  criteriosAplicados: string[];
  linhas: LinhaClassificacao[];
  confrontos: ConfrontoClassificacao[];
  atualizadoEm: string;
};

export type EstadoPartida =
  | 'PENDENTE_AGENDAMENTO'
  | 'AGENDADA'
  | 'ADIADA'
  | 'CANCELADA'
  | 'ENCERRADA_SUMULA'
  | 'ENCERRADA_WO';

export type ItemAgendaPartida = {
  partidaId: string;
  campeonato: { id: string; nome: string };
  faseId: string;
  rodada: number;
  mandante: { timeId: string; nome: string; sigla: string };
  visitante: { timeId: string; nome: string; sigla: string };
  inicioEm: string | null;
  campo: { id: string; nome: string } | null;
  estado: EstadoPartida;
};

export type PaginaAgendaPartidas = {
  itens: ItemAgendaPartida[];
  pagina: number;
  tamanho: number;
  totalItens: number;
  totalPaginas: number;
};

export type FiltrosAgendaPartidas = {
  pagina?: number;
  tamanho?: number;
  campeonatoId?: string;
  faseId?: string;
  timeId?: string;
  campoId?: string;
  municipioId?: string;
  estado?: EstadoPartida;
  inicioDe?: string;
  inicioAte?: string;
};

export type DetalhePublicoPartida = {
  partidaId: string;
  campeonato: { id: string; nome: string };
  fase: {
    id: string;
    nome: string;
    tipo: 'PONTOS_CORRIDOS' | 'GRUPOS' | 'MATA_MATA';
  };
  grupo: { id: string; nome: string } | null;
  rodada: number;
  confrontoId: string | null;
  mandante: {
    timeId: string;
    nome: string;
    sigla: string;
    escudoUrl: string | null;
  };
  visitante: {
    timeId: string;
    nome: string;
    sigla: string;
    escudoUrl: string | null;
  };
  agendamento: {
    inicioEm: string | null;
    campo: { id: string; nome: string } | null;
  };
  estado: EstadoPartida;
  motivoPublico:
    | 'CLIMA'
    | 'CONDICAO_CAMPO'
    | 'INDISPONIBILIDADE_LOGISTICA'
    | 'DECISAO_ADMINISTRATIVA'
    | 'DESISTENCIA'
    | 'FORCA_MAIOR'
    | null;
  resultado: {
    tipo: 'SUMULA' | 'WO';
    placarRegulamentar: { mandante: number; visitante: number };
    placarProrrogacao: { mandante: number; visitante: number } | null;
    placarPenaltis: { mandante: number; visitante: number } | null;
  } | null;
  sumulaPublica: SumulaPublica | null;
};

export type DetalheAdministrativoPartida = {
  partidaId: string;
  campeonatoId: string;
  faseId: string;
  grupoId: string | null;
  confrontoId: string | null;
  rodada: number;
  mandante: { timeCampeonatoId: string; timeId: string; nome: string };
  visitante: { timeCampeonatoId: string; timeId: string; nome: string };
  estado: EstadoPartida;
  agendamento: {
    inicioEm: string | null;
    campoId: string | null;
    versao: number;
    autorizacaoExternaConfirmada: boolean;
  };
  motivoAdministrativo: string | null;
  operacoesPermitidas: string[];
  pdfOficial: { status: 'INEXISTENTE' | 'PENDENTE' | 'GERADO' | 'FALHOU' };
  resultadoPrototipo?: {
    golsMandante: number;
    golsVisitante: number;
    vencedorTimeId: string;
  } | null;
  atualizadoEm: string;
};

export type RegistroResultadoPrototipo = {
  golsMandante: number;
  golsVisitante: number;
};

export type SumulaCompletaPrototipo = RegistroResultadoPrototipo & {
  placarPenaltis: {
    mandante: number;
    visitante: number;
  } | null;
  arbitragem: {
    arbitro: string;
    primeiroAssistente: string;
    segundoAssistente: string;
    quartoArbitro: string;
  };
  escalacaoMandante: Array<{
    atletaId: number;
    situacao: 'TITULAR' | 'RESERVA';
    posicaoUsada:
      'GOLEIRO' | 'ZAGUEIRO' | 'LATERAL' | 'MEIO_CAMPO' | 'ATACANTE';
  }>;
  escalacaoVisitante: Array<{
    atletaId: number;
    situacao: 'TITULAR' | 'RESERVA';
    posicaoUsada:
      'GOLEIRO' | 'ZAGUEIRO' | 'LATERAL' | 'MEIO_CAMPO' | 'ATACANTE';
  }>;
  gols: Array<{
    atletaId: number;
    lado: 'MANDANTE' | 'VISITANTE';
    periodo: 'PRIMEIRO_TEMPO' | 'SEGUNDO_TEMPO' | 'PRORROGACAO';
    minuto: number;
    acrescimo: number | null;
  }>;
  cartoes: Array<{
    atletaId: number;
    lado: 'MANDANTE' | 'VISITANTE';
    tipo: 'AMARELO' | 'VERMELHO';
    periodo: 'PRIMEIRO_TEMPO' | 'SEGUNDO_TEMPO' | 'PRORROGACAO';
    minuto: number;
    acrescimo: number | null;
  }>;
  substituicoes: Array<{
    lado: 'MANDANTE' | 'VISITANTE';
    atletaSaiId: number;
    atletaEntraId: number;
    periodo: 'PRIMEIRO_TEMPO' | 'SEGUNDO_TEMPO' | 'PRORROGACAO';
    minuto: number;
    acrescimo: number | null;
  }>;
  relatorio: string;
};

export type ResultadoPrototipoRegistrado = {
  partidaId: string;
  estado: 'ENCERRADA_SUMULA';
  placar: RegistroResultadoPrototipo;
  vencedorTimeId: string;
  finalLiberada: boolean;
};

export type AgendamentoPartidaInput = {
  inicioEm: string;
  campoId: string;
  autorizacaoExternaConfirmada: true;
  motivo: string | null;
  versaoEsperada: number;
};

export type AdiamentoPartidaInput = {
  motivo: string;
  confirmacao: true;
  versaoEsperada: number;
};

export type CancelamentoPartidaInput = {
  motivo: string;
  categoriaPublica: 'DECISAO_ADMINISTRATIVA' | 'DESISTENCIA' | 'FORCA_MAIOR';
  confirmacao: true;
  versaoEsperada: number;
};

export type AgendamentoPartidaSalvo = {
  partidaId: string;
  estado: 'AGENDADA';
  agendamento: {
    inicioEm: string;
    campo: { id: string; nome: string };
    versao: number;
    autorizacaoExternaConfirmada: true;
  };
  reagendamento: boolean;
  atualizadoEm: string;
};

export type PartidaAdiada = {
  partidaId: string;
  estado: 'ADIADA';
  agendamento: { inicioEm: null; campo: null; versao: number };
  categoriaPublica:
    | 'CLIMA'
    | 'CONDICAO_CAMPO'
    | 'INDISPONIBILIDADE_LOGISTICA'
    | 'DECISAO_ADMINISTRATIVA'
    | 'FORCA_MAIOR';
  adiadaEm: string;
};

export type PartidaCancelada = {
  partidaId: string;
  estado: 'CANCELADA';
  categoriaPublica: CancelamentoPartidaInput['categoriaPublica'];
  canceladaEm: string;
  canceladaPor: { usuarioId: string };
};

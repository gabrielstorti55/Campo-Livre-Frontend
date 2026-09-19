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
  atualizadoEm: string;
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

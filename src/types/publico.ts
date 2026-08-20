export type CampeonatoEstadoPublico =
  'EM_CONFIGURACAO' | 'EM_ANDAMENTO' | 'ENCERRADO' | 'CANCELADO';

export type CampeonatoFormato =
  'PONTOS_CORRIDOS' | 'MATA_MATA' | 'GRUPOS_MATA_MATA';

export type CampeonatoPublico = {
  id: number;
  nome: string;
  modalidade: string;
  formato: CampeonatoFormato;
  municipio: string;
  uf: string;
  inicio: string;
  estado: CampeonatoEstadoPublico;
  inscricoesAbertas: boolean;
  publicado: boolean;
  rodada: string;
  responsavel: { nome: string; funcao: string; prefeitura?: string };
  timeIds: number[];
  estrutura: string[];
};

export type TimePublico = {
  id: number;
  nome: string;
  municipio: string;
  uf: string;
  fundadoEm: string;
  escudo: string;
  publicado: boolean;
  atletaIds: number[];
  campeonatoIds: number[];
};

export type HistoricoVinculoPublico = {
  time: string;
  funcao: string;
  inicio: string;
  fim?: string;
};

export type ParticipacaoAtletaPublica = {
  campeonato: string;
  resultado: string;
  ano: string;
};

export type ConquistaPublica = {
  titulo: string;
  descricao: string;
  ano: string;
};

export type AtletaPublico = {
  id: number;
  nome: string;
  foto: string;
  bio?: string;
  municipio: string;
  uf: string;
  perfilPublico: boolean;
  posicao: string;
  golsPublicados: number;
  partidasPublicadas: number;
  assistenciasPublicadas: number;
  historicoTimes: HistoricoVinculoPublico[];
  campeonatos: ParticipacaoAtletaPublica[];
  conquistas: ConquistaPublica[];
};

export type LocalPartidaPublico = {
  id: number;
  nome: string;
};

export type PartidaEstadoPublico =
  | 'A_DEFINIR'
  | 'AGENDADA'
  | 'ADIADA'
  | 'CANCELADA'
  | 'AGUARDANDO_PUBLICACAO'
  | 'RESULTADO_PUBLICADO';

export type PartidaPublica = {
  id: number;
  campeonatoId: number;
  fase: string;
  grupo?: string;
  rodada: string;
  timeCasaId: number;
  timeForaId: number;
  data?: string;
  hora?: string;
  campoId?: number;
  estado: PartidaEstadoPublico;
  motivoPublico?:
    | 'Clima'
    | 'Condição do campo'
    | 'Indisponibilidade logística'
    | 'Decisão administrativa'
    | 'Desistência'
    | 'Força maior';
  golsCasa?: number;
  golsFora?: number;
  resultadoPublicado: boolean;
  pdfSumula?: string;
  escalacaoCasaAtletaIds?: number[];
  escalacaoForaAtletaIds?: number[];
};

export type LinhaClassificacaoPublica = {
  campeonatoId: number;
  timeId: number;
  pontos: number;
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  golsPro: number;
  golsContra: number;
};

export type LinhaArtilhariaPublica = {
  campeonatoId: number;
  atletaId: number;
  timeId: number;
  gols: number;
};

export type LinhaArtilhariaExibicao = LinhaArtilhariaPublica & {
  atleta: Pick<AtletaPublico, 'nome'> | undefined;
  time: Pick<TimePublico, 'nome'> | undefined;
};

export type GolResumoPartida = {
  autor: string;
  time: string;
  minuto: number;
};

export type CartaoResumoPartida = {
  jogador: string;
  time: string;
  minuto: number;
  tipo: 'amarelo' | 'vermelho';
};

export type SubstituicaoResumoPartida = {
  time: string;
  minuto: number;
  sai: string;
  entra: string;
};

export type SumulaPublica = {
  gols: GolResumoPartida[];
  cartoes?: CartaoResumoPartida[];
  substituicoes?: SubstituicaoResumoPartida[];
  wo?: { vencedor: string };
};

export type FiltrosCampeonatoPublico = {
  busca?: string;
  estado?: CampeonatoEstadoPublico | 'TODOS';
  municipio?: string;
  uf?: string;
  formato?: CampeonatoFormato | 'TODOS';
  periodo?: 'TODOS' | 'PROXIMOS' | '2026' | '2025';
  ordenacao?: 'INICIO_ASC' | 'RECENTES' | 'NOME';
};

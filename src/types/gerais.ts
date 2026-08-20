export type Status =
  | 'Em andamento'
  | 'Encerrado'
  | 'Fase Final'
  | 'Inscrições abertas'
  | 'Pendente'
  | 'Aprovado'
  | 'Confirmado'
  | 'Reprovado';

export type Campeonato = {
  id: number;
  nome: string;
  modalidade: string;
  formato: string;
  cidade: string;
  times: number;
  rodada: string;
  status: Status;
  encerradoEm?: string;
};

export type Time = {
  id: number;
  nome: string;
  cidade: string;
  jogadores: number;
  status: Status;
  campeonato?: string;
};

export type Jogador = {
  id: number;
  nome: string;
  posicao: string;
  capitao?: boolean;
  gols: number;
  desde: string;
};

export type LinhaClassificacao = {
  time: string;
  p: number;
  j: number;
  v: number;
  e: number;
  d: number;
  gp: number;
  gc: number;
  sg: number;
};

export type Partida = {
  id: number;
  rodada: string;
  casa: string;
  fora: string;
  data: string;
  hora: string;
  campo: string;
  golsCasa?: number;
  golsFora?: number;
  concluida: boolean;
  agendada: boolean;
};

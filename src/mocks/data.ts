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

export const campeonatos: Campeonato[] = [
  {
    id: 1,
    nome: 'Copa Franca 2026',
    modalidade: 'Fut Society',
    formato: 'Pts Corridos',
    cidade: 'Franca, SP',
    times: 8,
    rodada: '4 de 7',
    status: 'Em andamento',
  },
  {
    id: 2,
    nome: 'Liga Bairro Sul',
    modalidade: 'Futebol de Campo',
    formato: 'Pts Corridos',
    cidade: 'Franca, SP',
    times: 10,
    rodada: '6 de 9',
    status: 'Em andamento',
  },
  {
    id: 3,
    nome: 'Torneio Amigos 2025',
    modalidade: 'Society',
    formato: 'Chaveamento',
    cidade: 'Batatais, SP',
    times: 6,
    rodada: 'Semifinal',
    status: 'Fase Final',
  },
  {
    id: 4,
    nome: 'Copa Verão 2026',
    modalidade: 'Society',
    formato: 'Fase de Grupos + Chaveamento',
    cidade: 'Franca, SP',
    times: 12,
    rodada: '—',
    status: 'Inscrições abertas',
  },
  {
    id: 5,
    nome: 'Copa Franca 2025',
    modalidade: 'Fut Society',
    formato: 'Pts Corridos',
    cidade: 'Franca, SP',
    times: 8,
    rodada: 'Final',
    status: 'Encerrado',
    encerradoEm: '12/11/2025',
  },
  {
    id: 6,
    nome: 'Liga Municipal 2025',
    modalidade: 'Futebol de Campo',
    formato: 'Chaveamento',
    cidade: 'Franca, SP',
    times: 16,
    rodada: 'Final',
    status: 'Encerrado',
    encerradoEm: '30/08/2025',
  },
];

export const getCampeonato = (id: string | number) =>
  campeonatos.find((c) => String(c.id) === String(id)) ?? campeonatos[0]!;

export const atletaLogado = {
  nome: 'Marcos Oliveira',
  time: 'Time A',
  cidade: 'Franca, SP',
  score: 92,
  gols: 7,
  partidas: 14,
  golsJogo: 2.3,
};

export const organizadorLogado = {
  nome: 'João Silva',
  cidade: 'Franca, SP',
  score: 88,
  eventos: 12,
  times: 46,
  partidasOrganizadas: 210,
};

export type Time = {
  id: number;
  nome: string;
  cidade: string;
  jogadores: number;
  status: Status;
  campeonato?: string;
};

export const times: Time[] = [
  {
    id: 1,
    nome: 'Time A',
    cidade: 'Franca, SP',
    jogadores: 18,
    status: 'Confirmado',
    campeonato: 'Copa Franca 2026',
  },
  {
    id: 2,
    nome: 'Leões FC',
    cidade: 'Franca, SP',
    jogadores: 14,
    status: 'Confirmado',
    campeonato: 'Copa Franca 2026',
  },
  {
    id: 3,
    nome: 'Unidos do Vale',
    cidade: 'Franca, SP',
    jogadores: 16,
    status: 'Pendente',
    campeonato: 'Liga Bairro Sul',
  },
  {
    id: 4,
    nome: 'Estrela Azul',
    cidade: 'Batatais, SP',
    jogadores: 13,
    status: 'Confirmado',
    campeonato: 'Liga Bairro Sul',
  },
  {
    id: 5,
    nome: 'Bairro Sul FC',
    cidade: 'Franca, SP',
    jogadores: 15,
    status: 'Confirmado',
  },
  {
    id: 6,
    nome: 'Real Aeroporto',
    cidade: 'Franca, SP',
    jogadores: 12,
    status: 'Pendente',
  },
];

export const getTime = (id: string | number) =>
  times.find((t) => String(t.id) === String(id)) ?? times[0]!;

export type Jogador = {
  id: number;
  nome: string;
  posicao: string;
  capitao?: boolean;
  gols: number;
  desde: string;
};

export const elenco: Jogador[] = [
  {
    id: 1,
    nome: 'Marcos Oliveira',
    posicao: 'Atacante',
    capitao: true,
    gols: 7,
    desde: '2024',
  },
  { id: 2, nome: 'Rafael Lima', posicao: 'Goleiro', gols: 0, desde: '2023' },
  { id: 3, nome: 'Diego Souza', posicao: 'Zagueiro', gols: 1, desde: '2025' },
  { id: 4, nome: 'Bruno Alves', posicao: 'Lateral', gols: 2, desde: '2025' },
  { id: 5, nome: 'Felipe Rocha', posicao: 'Meia', gols: 4, desde: '2024' },
  { id: 6, nome: 'Lucas Prado', posicao: 'Atacante', gols: 5, desde: '2026' },
  { id: 7, nome: 'Vitor Nunes', posicao: 'Volante', gols: 1, desde: '2024' },
];

const nomesPorTime: Record<number, string[]> = {
  2: ['Henrique Alves', 'Matheus Costa', 'Caio Martins'],
  3: ['André Pereira', 'Renan Gomes', 'Igor Freitas'],
  4: ['Samuel Duarte', 'Gustavo Melo', 'Daniel Ribeiro'],
  5: ['Eduardo Nunes', 'Thiago Lopes', 'Murilo Reis'],
  6: ['Leonardo Paiva', 'Vinícius Teles', 'Fábio Moura'],
};

export function getElencoDoTime(id: string | number): Jogador[] {
  const timeId = Number(id);
  if (timeId === 1) return elenco;
  const nomes = nomesPorTime[timeId] ?? [];
  return nomes.map((nome, indice) => ({
    ...elenco[indice]!,
    id: timeId * 100 + indice,
    nome,
    capitao: indice === 0,
  }));
}

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

export const classificacao: LinhaClassificacao[] = [
  { time: 'Time A', p: 10, j: 4, v: 3, e: 1, d: 0, gp: 12, gc: 4, sg: 8 },
  { time: 'Leões FC', p: 9, j: 4, v: 3, e: 0, d: 1, gp: 10, gc: 5, sg: 5 },
  { time: 'Estrela Azul', p: 7, j: 4, v: 2, e: 1, d: 1, gp: 8, gc: 6, sg: 2 },
  { time: 'Unidos do Vale', p: 6, j: 4, v: 2, e: 0, d: 2, gp: 7, gc: 7, sg: 0 },
  { time: 'Bairro Sul FC', p: 4, j: 4, v: 1, e: 1, d: 2, gp: 5, gc: 8, sg: -3 },
  {
    time: 'Real Aeroporto',
    p: 3,
    j: 4,
    v: 1,
    e: 0,
    d: 3,
    gp: 4,
    gc: 9,
    sg: -5,
  },
  { time: 'Vila Nova AC', p: 2, j: 4, v: 0, e: 2, d: 2, gp: 3, gc: 8, sg: -5 },
  { time: 'Juventude FC', p: 1, j: 4, v: 0, e: 1, d: 3, gp: 2, gc: 8, sg: -6 },
];

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

export const partidas: Partida[] = [
  {
    id: 1,
    rodada: 'Rodada 4',
    casa: 'Time A',
    fora: 'Leões FC',
    data: '14/08/2026',
    hora: '15:00',
    campo: 'Campo Vera Cruz',
    concluida: false,
    agendada: true,
  },
  {
    id: 2,
    rodada: 'Rodada 4',
    casa: 'Estrela Azul',
    fora: 'Unidos do Vale',
    data: '14/08/2026',
    hora: '17:00',
    campo: 'Campo Santa Rita',
    concluida: false,
    agendada: true,
  },
  {
    id: 3,
    rodada: 'Rodada 3',
    casa: 'Time A',
    fora: 'Bairro Sul FC',
    data: '07/08/2026',
    hora: '15:00',
    campo: 'Campo Vera Cruz',
    golsCasa: 3,
    golsFora: 1,
    concluida: true,
    agendada: true,
  },
  {
    id: 4,
    rodada: 'Rodada 3',
    casa: 'Leões FC',
    fora: 'Real Aeroporto',
    data: '07/08/2026',
    hora: '17:00',
    campo: 'Campo Aeroporto',
    golsCasa: 2,
    golsFora: 0,
    concluida: true,
    agendada: true,
  },
  {
    id: 5,
    rodada: 'Rodada 5',
    casa: 'Juventude FC',
    fora: 'Time A',
    data: '—',
    hora: '—',
    campo: 'A definir',
    concluida: false,
    agendada: false,
  },
  {
    id: 6,
    rodada: 'Rodada 5',
    casa: 'Vila Nova AC',
    fora: 'Leões FC',
    data: '—',
    hora: '—',
    campo: 'A definir',
    concluida: false,
    agendada: false,
  },
];

export const proximoJogo = partidas[0]!;

export const bracket = {
  quartas: [
    { a: 'Time A', b: 'Juventude FC', placar: '3 x 0' },
    { a: 'Leões FC', b: 'Vila Nova AC', placar: '2 x 1' },
    { a: 'Estrela Azul', b: 'Real Aeroporto', placar: '1 x 0' },
    { a: 'Unidos do Vale', b: 'Bairro Sul FC', placar: '2 x 2 (4x3)' },
  ],
  semis: [
    { a: 'Time A', b: 'Leões FC', placar: '—' },
    { a: 'Estrela Azul', b: 'Unidos do Vale', placar: '—' },
  ],
  final: [{ a: 'A definir', b: 'A definir', placar: '—' }],
};

export const historicoAtleta = [
  {
    campeonato: 'Copa Franca 2025',
    resultado: 'Campeão',
    placar: '3 x 1',
    ano: '2025',
  },
  {
    campeonato: 'Liga Municipal 2025',
    resultado: 'Semifinalista',
    placar: '1 x 2',
    ano: '2025',
  },
  {
    campeonato: 'Torneio Amigos 2024',
    resultado: 'Vice-campeão',
    placar: '0 x 1',
    ano: '2024',
  },
];

export const conquistas = [
  { titulo: 'Campeão Copa Franca', ano: '2025' },
  { titulo: 'Artilheiro Liga Bairro Sul', ano: '2024' },
  { titulo: 'Vice Torneio Amigos', ano: '2024' },
];

export const prefeituraStats = {
  eventosRealizados: 56,
  eventosAgendados: 18,
  disponiveis: 2,
  reprovados: 2,
  camposCadastrados: 32,
  jogosReservadosMes: 89,
  organizadores: 12,
  eventosReservados: 7,
};

export const campos = [
  {
    id: 1,
    nome: 'Campo Vera Cruz',
    endereco: 'Rua das Palmeiras, 120 — Vera Cruz',
  },
  {
    id: 2,
    nome: 'Campo Santa Rita',
    endereco: 'Av. Santa Rita, 890 — Santa Rita',
  },
  {
    id: 3,
    nome: 'Campo Aeroporto',
    endereco: 'Rua do Aeroporto, 55 — Aeroporto',
  },
  {
    id: 4,
    nome: 'Campo Palmeiras',
    endereco: 'Rua Ipê, 340 — Jardim Palmeiras',
  },
  { id: 5, nome: 'Campo São José', endereco: 'Rua Bahia, 700 — São José' },
  {
    id: 6,
    nome: 'Campo Parque Moema',
    endereco: 'Av. Moema, 1200 — Parque Moema',
  },
];

export const organizadores = [
  { id: 1, nome: 'João Silva', eventos: 12 },
  { id: 2, nome: 'Carlos Mota', eventos: 7 },
  { id: 3, nome: 'Pedro Nunes', eventos: 5 },
  { id: 4, nome: 'Maria Costa', eventos: 9 },
  { id: 5, nome: 'Ana Ribeiro', eventos: 3 },
];

export const reservas = [
  {
    id: 1,
    campo: 'Campo Municipal Vera Cruz',
    data: '07/08/2026',
    horario: '14:00 – 16:00',
    campeonato: 'Copa Franca 2026',
  },
  {
    id: 2,
    campo: 'Campo Municipal Santa Rita',
    data: '07/08/2026',
    horario: '16:00 – 18:00',
    campeonato: 'Liga Bairro Sul',
  },
  {
    id: 3,
    campo: 'Campo Municipal Aeroporto',
    data: '07/08/2026',
    horario: '18:00 – 20:00',
    campeonato: 'Torneio Amigos 2025',
  },
];

export const aprovacoesPendentes = [
  {
    id: 1,
    campeonato: 'Copa Verão 2026',
    organizador: 'Carlos Mota',
    campo: 'Campo Vera Cruz',
    horario: '14:00 – 16:00',
    vagas: 12,
  },
  {
    id: 2,
    campeonato: 'Liga Bairro Norte',
    organizador: 'Pedro Nunes',
    campo: 'Campo Santa Rita',
    horario: '09:00 – 11:00',
    vagas: 8,
  },
  {
    id: 3,
    campeonato: 'Torneio da Amizade',
    organizador: 'Maria Costa',
    campo: 'Campo Palmeiras',
    horario: '17:00 – 19:00',
    vagas: 10,
  },
];

export const aprovacoesRecentes = [
  { id: 1, campeonato: 'Copa Franca 2026', organizador: 'João Silva' },
  { id: 2, campeonato: 'Liga Bairro Sul', organizador: 'Carlos Mota' },
];

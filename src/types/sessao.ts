import type { MinhaConta } from '@/types/api/autenticacao';

export type ContextoPessoal = 'atleta' | 'organizador';

export type VinculoTimeCriado = {
  id: string;
  name: string;
  city: string;
  modality: 'Society' | 'Campo';
  description: string;
  role: 'CAPITAO';
};

export type SessaoPessoal = {
  sessionId: string;
  prototipo: boolean;
  account: {
    id: string;
    name: string;
    email: string;
    city?: string;
    type: 'pessoa';
  };
  minhaConta: MinhaConta;
  capabilities: ContextoPessoal[];
  activeContext: ContextoPessoal | null;
  organizerEnabledAt?: string;
  links: {
    teamIds: string[];
    captainTeamIds: string[];
    createdTeams: VinculoTimeCriado[];
    organizedChampionshipIds: string[];
    institutionalOrganizationIds: string[];
  };
};

export type ContaMockRegistrada = { name: string; city: string; email: string };

export type StatusSessao =
  'carregando' | 'visitante' | 'autenticando' | 'autenticado' | 'indisponivel';

export type ValorContextoSessao = {
  status: StatusSessao;
  session: SessaoPessoal | null;
  hydrated: boolean;
  erroSessao: string | null;
  signIn: (email: string, senha: string) => Promise<SessaoPessoal>;
  signOut: () => Promise<void>;
  executarAutenticado: <T>(
    request: (accessToken: string) => Promise<T>,
  ) => Promise<T>;
  registerMockAccount: (account: ContaMockRegistrada) => void;
  linkTeam: (teamId: string) => void;
  createTeam: (input: Omit<VinculoTimeCriado, 'id' | 'role'>) => string;
  enableOrganizer: () => void;
  switchContext: (context: ContextoPessoal) => void;
};

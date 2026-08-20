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
  account: { id: string; name: string; city?: string; type: 'pessoa' };
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

export type ValorContextoSessao = {
  session: SessaoPessoal | null;
  hydrated: boolean;
  registerMockAccount: (account: ContaMockRegistrada) => void;
  signInWithMock: (email?: string) => SessaoPessoal;
  linkTeam: (teamId: string) => void;
  createTeam: (input: Omit<VinculoTimeCriado, 'id' | 'role'>) => string;
  signOut: () => void;
  enableOrganizer: () => void;
  switchContext: (context: ContextoPessoal) => void;
};

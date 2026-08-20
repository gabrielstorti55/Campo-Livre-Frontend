'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

export type PersonalContext = 'atleta' | 'organizador';

export type CreatedTeamLink = {
  id: string;
  name: string;
  city: string;
  modality: 'Society' | 'Campo';
  description: string;
  role: 'CAPITAO';
};

export type PersonalSession = {
  sessionId: string;
  account: {
    id: string;
    name: string;
    city?: string;
    type: 'pessoa';
  };
  capabilities: PersonalContext[];
  activeContext: PersonalContext | null;
  organizerEnabledAt?: string;
  links: {
    teamIds: string[];
    captainTeamIds: string[];
    createdTeams: CreatedTeamLink[];
    organizedChampionshipIds: string[];
    institutionalOrganizationIds: string[];
  };
};

type MockRegisteredAccount = {
  name: string;
  city: string;
  email: string;
};

type SessionContextValue = {
  session: PersonalSession | null;
  hydrated: boolean;
  registerMockAccount: (account: MockRegisteredAccount) => void;
  signInWithMock: (email?: string) => PersonalSession;
  linkTeam: (teamId: string) => void;
  createTeam: (input: Omit<CreatedTeamLink, 'id' | 'role'>) => string;
  signOut: () => void;
  enableOrganizer: () => void;
  switchContext: (context: PersonalContext) => void;
};

const STORAGE_KEY = 'campo-livre:mock-personal-session';
export const MOCK_ACTIVE_ACCOUNT_KEY = 'campo-livre:mock-active-account-id';
export const MOCK_ACTIVE_CHAMPIONSHIPS_KEY =
  'campo-livre:mock-active-organized-championship-ids';
export const MOCK_SESSION_CHANGED_EVENT = 'campo-livre:mock-session-changed';
const REGISTERED_ACCOUNT_KEY = 'campo-livre:mock-registered-account';

const mockPersonalSession: PersonalSession = {
  sessionId: 'mock-session-personal-1',
  account: {
    id: 'mock-person-1',
    name: 'Marcos Oliveira',
    city: 'Franca, SP',
    type: 'pessoa',
  },
  capabilities: ['atleta', 'organizador'],
  activeContext: 'atleta',
  organizerEnabledAt: '2026-08-01T12:00:00.000Z',
  links: {
    teamIds: ['1'],
    captainTeamIds: ['1'],
    createdTeams: [],
    organizedChampionshipIds: ['1', '2', '4', '5', '7'],
    institutionalOrganizationIds: [],
  },
};

const mockUnlinkedPersonalSession: PersonalSession = {
  sessionId: 'mock-session-unlinked-personal-1',
  account: {
    id: 'mock-person-unlinked-1',
    name: 'Lucas Ferreira',
    city: 'Franca, SP',
    type: 'pessoa',
  },
  capabilities: [],
  activeContext: null,
  links: {
    teamIds: [],
    captainTeamIds: [],
    createdTeams: [],
    organizedChampionshipIds: [],
    institutionalOrganizationIds: [],
  },
};

const mockCollaboratorSession: PersonalSession = {
  sessionId: 'mock-session-collaborator-1',
  account: {
    id: 'mock-person-collaborator-1',
    name: 'Juliana Lopes',
    city: 'Franca, SP',
    type: 'pessoa',
  },
  capabilities: ['atleta', 'organizador'],
  activeContext: 'organizador',
  organizerEnabledAt: '2026-08-05T12:00:00.000Z',
  links: {
    teamIds: [],
    captainTeamIds: [],
    createdTeams: [],
    organizedChampionshipIds: ['4'],
    institutionalOrganizationIds: [],
  },
};

const mockMunicipalSession: PersonalSession = {
  sessionId: 'mock-session-municipal-1',
  account: {
    id: 'mock-municipal-manager-1',
    name: 'Gestora Municipal',
    city: 'Franca, SP',
    type: 'pessoa',
  },
  capabilities: [],
  activeContext: null,
  links: {
    teamIds: [],
    captainTeamIds: [],
    createdTeams: [],
    organizedChampionshipIds: [],
    institutionalOrganizationIds: ['prefeitura-franca'],
  },
};

function readStoredSession(): PersonalSession | null {
  if (typeof window === 'undefined') return null;

  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored) as PersonalSession;
    if (parsed.account?.type !== 'pessoa') return null;
    if (!Array.isArray(parsed.capabilities)) return null;
    if (
      parsed.activeContext !== null &&
      !parsed.capabilities.includes(parsed.activeContext)
    ) {
      return null;
    }

    return {
      ...parsed,
      links: {
        teamIds: parsed.links?.teamIds ?? [],
        captainTeamIds:
          parsed.links?.captainTeamIds ??
          Array.from(
            new Set([
              ...(parsed.links?.createdTeams ?? []).map((team) => team.id),
              ...(parsed.account.id === 'mock-person-1' &&
              parsed.links?.teamIds?.includes('1')
                ? ['1']
                : []),
            ]),
          ),
        createdTeams: parsed.links?.createdTeams ?? [],
        organizedChampionshipIds: parsed.links?.organizedChampionshipIds ?? [],
        institutionalOrganizationIds:
          parsed.links?.institutionalOrganizationIds ?? [],
      },
    };
  } catch {
    return null;
  }
}

function readRegisteredAccount(): MockRegisteredAccount | null {
  const stored = sessionStorage.getItem(REGISTERED_ACCOUNT_KEY);
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored) as Partial<MockRegisteredAccount>;
    if (!parsed.name || !parsed.city) return null;

    return {
      name: parsed.name,
      city: parsed.city,
      email: parsed.email ?? '',
    };
  } catch {
    return null;
  }
}

function storeSession(session: PersonalSession) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

function setActiveMockSession(session: PersonalSession) {
  sessionStorage.setItem(MOCK_ACTIVE_ACCOUNT_KEY, session.account.id);
  sessionStorage.setItem(
    MOCK_ACTIVE_CHAMPIONSHIPS_KEY,
    JSON.stringify(session.links.organizedChampionshipIds),
  );
  window.dispatchEvent(new Event(MOCK_SESSION_CHANGED_EVENT));
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<PersonalSession | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;

    queueMicrotask(() => {
      if (!active) return;
      const storedSession = readStoredSession();
      if (storedSession) setActiveMockSession(storedSession);
      setSession(storedSession);
      setHydrated(true);
    });

    return () => {
      active = false;
    };
  }, []);

  function registerMockAccount(account: MockRegisteredAccount) {
    // TODO(auth-api): remover esta persistência quando a API retornar a conta criada.
    sessionStorage.setItem(REGISTERED_ACCOUNT_KEY, JSON.stringify(account));
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(MOCK_ACTIVE_ACCOUNT_KEY);
    sessionStorage.removeItem(MOCK_ACTIVE_CHAMPIONSHIPS_KEY);
    window.dispatchEvent(new Event(MOCK_SESSION_CHANGED_EVENT));
    setSession(null);
    setHydrated(true);
  }

  function signInWithMock(email = '') {
    // TODO(auth-api): substituir este adapter pela sessão retornada pelo contrato
    // oficial de autenticação. O mock existe apenas para validar o fluxo do frontend.
    const normalizedEmail = email.trim().toLowerCase();
    const registeredAccount = readRegisteredAccount();
    const isRegisteredAccount =
      registeredAccount &&
      (!registeredAccount.email ||
        registeredAccount.email.toLowerCase() === normalizedEmail);

    const nextSession = isRegisteredAccount
      ? {
          ...mockUnlinkedPersonalSession,
          sessionId: 'mock-session-registered-personal',
          account: {
            ...mockUnlinkedPersonalSession.account,
            id: 'mock-registered-person',
            name: registeredAccount.name,
            city: registeredAccount.city,
          },
        }
      : normalizedEmail === 'prefeitura@campolivre.test'
        ? mockMunicipalSession
        : normalizedEmail === 'sem-time@campolivre.test'
          ? mockUnlinkedPersonalSession
          : normalizedEmail === 'colaborador@campolivre.test'
            ? mockCollaboratorSession
            : mockPersonalSession;

    setActiveMockSession(nextSession);
    setSession(nextSession);
    setHydrated(true);
    storeSession(nextSession);
    return nextSession;
  }

  function switchContext(context: PersonalContext) {
    setSession((current) => {
      if (!current || !current.capabilities.includes(context)) return current;
      const nextSession = { ...current, activeContext: context };
      storeSession(nextSession);
      return nextSession;
    });
  }

  function linkTeam(teamId: string) {
    setSession((current) => {
      if (!current) return current;
      const nextSession: PersonalSession = {
        ...current,
        capabilities: current.capabilities.includes('atleta')
          ? current.capabilities
          : [...current.capabilities, 'atleta'],
        activeContext: 'atleta',
        links: {
          ...current.links,
          teamIds: current.links.teamIds.includes(teamId)
            ? current.links.teamIds
            : [...current.links.teamIds, teamId],
        },
      };
      storeSession(nextSession);
      setActiveMockSession(nextSession);
      return nextSession;
    });
  }

  function createTeam(input: Omit<CreatedTeamLink, 'id' | 'role'>) {
    const teamId = `local-${Date.now()}`;
    setSession((current) => {
      if (!current) return current;
      const createdTeam: CreatedTeamLink = {
        ...input,
        id: teamId,
        role: 'CAPITAO',
      };
      const nextSession: PersonalSession = {
        ...current,
        capabilities: current.capabilities.includes('atleta')
          ? current.capabilities
          : [...current.capabilities, 'atleta'],
        activeContext: 'atleta',
        links: {
          ...current.links,
          teamIds: [...current.links.teamIds, teamId],
          captainTeamIds: [...current.links.captainTeamIds, teamId],
          createdTeams: [...current.links.createdTeams, createdTeam],
        },
      };
      storeSession(nextSession);
      setActiveMockSession(nextSession);
      return nextSession;
    });
    return teamId;
  }

  function signOut() {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(MOCK_ACTIVE_ACCOUNT_KEY);
    sessionStorage.removeItem(MOCK_ACTIVE_CHAMPIONSHIPS_KEY);
    setSession(null);
    window.dispatchEvent(new Event(MOCK_SESSION_CHANGED_EVENT));
  }

  function enableOrganizer() {
    setSession((current) => {
      if (!current) return current;
      const nextSession: PersonalSession = {
        ...current,
        capabilities: current.capabilities.includes('organizador')
          ? current.capabilities
          : [...current.capabilities, 'organizador'],
        activeContext: 'organizador',
        organizerEnabledAt:
          current.organizerEnabledAt ?? new Date().toISOString(),
      };
      storeSession(nextSession);
      return nextSession;
    });
  }

  return (
    <SessionContext.Provider
      value={{
        session,
        hydrated,
        registerMockAccount,
        signInWithMock,
        linkTeam,
        createTeam,
        signOut,
        enableOrganizer,
        switchContext,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession deve ser usado dentro de SessionProvider');
  }
  return context;
}

export function getContextHome(context: PersonalContext) {
  return context === 'organizador' ? '/organizador/inicio' : '/atleta/inicio';
}

export function getSessionHome(session: PersonalSession) {
  return session.activeContext
    ? getContextHome(session.activeContext)
    : '/minha-area';
}

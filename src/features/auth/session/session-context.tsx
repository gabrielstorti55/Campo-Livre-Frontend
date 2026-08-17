import { createContext, useContext, useState, type ReactNode } from 'react';

export type PersonalContext = 'atleta' | 'organizador';

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
  links: {
    teamIds: string[];
    organizedChampionshipIds: string[];
  };
};

type MockRegisteredAccount = {
  name: string;
  city: string;
  email: string;
};

type SessionContextValue = {
  session: PersonalSession | null;
  registerMockAccount: (account: MockRegisteredAccount) => void;
  signInWithMock: (email?: string) => PersonalSession;
  switchContext: (context: PersonalContext) => void;
};

const STORAGE_KEY = 'campo-livre:mock-personal-session';
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
  links: {
    teamIds: ['1'],
    organizedChampionshipIds: ['1'],
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
    organizedChampionshipIds: [],
  },
};

function readStoredSession(): PersonalSession | null {
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
      links: parsed.links ?? {
        teamIds: [],
        organizedChampionshipIds: [],
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

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<PersonalSession | null>(() =>
    readStoredSession(),
  );

  function registerMockAccount(account: MockRegisteredAccount) {
    // TODO(auth-api): remover esta persistência quando a API retornar a conta criada.
    sessionStorage.setItem(REGISTERED_ACCOUNT_KEY, JSON.stringify(account));
    sessionStorage.removeItem(STORAGE_KEY);
    setSession(null);
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
      : normalizedEmail === 'sem-time@campolivre.test'
        ? mockUnlinkedPersonalSession
        : mockPersonalSession;

    setSession(nextSession);
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

  return (
    <SessionContext.Provider
      value={{ session, registerMockAccount, signInWithMock, switchContext }}
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

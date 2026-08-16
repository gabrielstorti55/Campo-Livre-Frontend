import { createContext, useContext, useState, type ReactNode } from 'react';

export type PersonalContext = 'atleta' | 'organizador';

export type PersonalSession = {
  sessionId: string;
  account: {
    id: string;
    name: string;
    type: 'pessoa';
  };
  capabilities: PersonalContext[];
  activeContext: PersonalContext;
};

type SessionContextValue = {
  session: PersonalSession | null;
  signInWithMock: () => PersonalSession;
  switchContext: (context: PersonalContext) => void;
};

const STORAGE_KEY = 'campo-livre:mock-personal-session';

const mockPersonalSession: PersonalSession = {
  sessionId: 'mock-session-personal-1',
  account: {
    id: 'mock-person-1',
    name: 'Marcos Oliveira',
    type: 'pessoa',
  },
  capabilities: ['atleta', 'organizador'],
  activeContext: 'atleta',
};

function readStoredSession(): PersonalSession | null {
  const stored = sessionStorage.getItem(STORAGE_KEY);

  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored) as PersonalSession;

    if (parsed.account?.type !== 'pessoa') return null;
    if (!parsed.capabilities?.includes(parsed.activeContext)) return null;

    return parsed;
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

  function signInWithMock() {
    // TODO(auth-api): substituir este adapter pela sessão retornada pelo contrato
    // oficial de autenticação. O mock existe apenas para validar o fluxo do frontend.
    const nextSession = session ?? mockPersonalSession;

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
      value={{ session, signInWithMock, switchContext }}
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

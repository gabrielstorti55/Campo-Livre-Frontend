'use client';

import { createContext, useEffect, useState, type ReactNode } from 'react';

import {
  CHAVE_CAMPEONATOS_ATIVOS_MOCK,
  CHAVE_CONTA_ATIVA_MOCK,
  CHAVE_CONTA_CADASTRADA_MOCK,
  CHAVE_SESSAO_MOCK,
  EVENTO_SESSAO_MOCK_ALTERADA,
} from '@/constants/sessao';
import type {
  ContaMockRegistrada,
  ContextoPessoal,
  SessaoPessoal,
  ValorContextoSessao,
  VinculoTimeCriado,
} from '@/types/sessao';

const mockPersonalSession: SessaoPessoal = {
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

const mockUnlinkedPersonalSession: SessaoPessoal = {
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

const mockCollaboratorSession: SessaoPessoal = {
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

const mockMunicipalSession: SessaoPessoal = {
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

function readStoredSession(): SessaoPessoal | null {
  if (typeof window === 'undefined') return null;

  const stored = sessionStorage.getItem(CHAVE_SESSAO_MOCK);
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored) as SessaoPessoal;
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

function readRegisteredAccount(): ContaMockRegistrada | null {
  const stored = sessionStorage.getItem(CHAVE_CONTA_CADASTRADA_MOCK);
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored) as Partial<ContaMockRegistrada>;
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

function storeSession(session: SessaoPessoal) {
  sessionStorage.setItem(CHAVE_SESSAO_MOCK, JSON.stringify(session));
}

function setActiveMockSession(session: SessaoPessoal) {
  sessionStorage.setItem(CHAVE_CONTA_ATIVA_MOCK, session.account.id);
  sessionStorage.setItem(
    CHAVE_CAMPEONATOS_ATIVOS_MOCK,
    JSON.stringify(session.links.organizedChampionshipIds),
  );
  window.dispatchEvent(new Event(EVENTO_SESSAO_MOCK_ALTERADA));
}

export const ContextoSessao = createContext<ValorContextoSessao | null>(null);

export function ProvedorSessao({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessaoPessoal | null>(null);
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

  function registerMockAccount(account: ContaMockRegistrada) {
    // TODO(auth-api): remover esta persistência quando a API retornar a conta criada.
    sessionStorage.setItem(
      CHAVE_CONTA_CADASTRADA_MOCK,
      JSON.stringify(account),
    );
    sessionStorage.removeItem(CHAVE_SESSAO_MOCK);
    sessionStorage.removeItem(CHAVE_CONTA_ATIVA_MOCK);
    sessionStorage.removeItem(CHAVE_CAMPEONATOS_ATIVOS_MOCK);
    window.dispatchEvent(new Event(EVENTO_SESSAO_MOCK_ALTERADA));
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

  function switchContext(context: ContextoPessoal) {
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
      const nextSession: SessaoPessoal = {
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

  function createTeam(input: Omit<VinculoTimeCriado, 'id' | 'role'>) {
    const teamId = `local-${Date.now()}`;
    setSession((current) => {
      if (!current) return current;
      const createdTeam: VinculoTimeCriado = {
        ...input,
        id: teamId,
        role: 'CAPITAO',
      };
      const nextSession: SessaoPessoal = {
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
    sessionStorage.removeItem(CHAVE_SESSAO_MOCK);
    sessionStorage.removeItem(CHAVE_CONTA_ATIVA_MOCK);
    sessionStorage.removeItem(CHAVE_CAMPEONATOS_ATIVOS_MOCK);
    setSession(null);
    window.dispatchEvent(new Event(EVENTO_SESSAO_MOCK_ALTERADA));
  }

  function enableOrganizer() {
    setSession((current) => {
      if (!current) return current;
      const nextSession: SessaoPessoal = {
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
    <ContextoSessao.Provider
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
    </ContextoSessao.Provider>
  );
}

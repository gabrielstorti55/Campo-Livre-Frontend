'use client';

import {
  createContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { ClienteApi, obterUrlApi } from '@/services/api/cliente-api';
import { ErroApi } from '@/services/api/problem-details';
import type { AutenticacaoApi } from '@/services/autenticacao/autenticacao-api';
import { AutenticacaoFake } from '@/services/autenticacao/autenticacao-fake';
import { AutenticacaoHttp } from '@/services/autenticacao/autenticacao-http';
import { CoordenadorRefresh } from '@/services/autenticacao/coordenador-refresh';
import type { MinhaConta } from '@/types/api/autenticacao';
import type {
  ContaMockRegistrada,
  ContextoPessoal,
  SessaoPessoal,
  StatusSessao,
  ValorContextoSessao,
  VinculoTimeCriado,
} from '@/types/sessao';

const fakeApi = new AutenticacaoFake();
const httpApi = new AutenticacaoHttp(new ClienteApi(obterUrlApi()));

function obterApiPadrao(): AutenticacaoApi {
  if (process.env.NODE_ENV === 'production') return httpApi;
  if (process.env['NEXT_PUBLIC_AUTH_ADAPTER'] === 'fake') return fakeApi;
  if (process.env['NEXT_PUBLIC_AUTH_ADAPTER'] === 'http') return httpApi;
  return fakeApi;
}

const emptyLinks: SessaoPessoal['links'] = {
  teamIds: [],
  captainTeamIds: [],
  createdTeams: [],
  organizedChampionshipIds: [],
  institutionalOrganizationIds: [],
};

function linksOperacionaisMock(account: MinhaConta): SessaoPessoal['links'] {
  // TODO(domain-api): estes vínculos sustentam apenas as telas protótipo dos
  // outros domínios. Eles não são inferidos de /minha-conta nem autorizam APIs.
  if (account.id === 'conta-marcos') {
    return {
      ...emptyLinks,
      teamIds: ['1'],
      captainTeamIds: ['1'],
      organizedChampionshipIds: ['1', '2', '4', '5', '7'],
    };
  }
  if (account.id === 'conta-prefeitura') {
    return {
      ...emptyLinks,
      institutionalOrganizationIds: ['prefeitura-franca'],
    };
  }
  if (account.id === 'conta-atleta-cancelado') {
    return { ...emptyLinks, teamIds: ['5'] };
  }
  if (account.id === 'conta-colaboradora') {
    return { ...emptyLinks, organizedChampionshipIds: ['4'] };
  }
  return { ...emptyLinks };
}

function criarSessao(
  account: MinhaConta,
  permitirMocksDominio: boolean,
): SessaoPessoal {
  const links = permitirMocksDominio
    ? linksOperacionaisMock(account)
    : { ...emptyLinks };
  const capabilities: ContextoPessoal[] = [
    ...(links.teamIds.length ? (['atleta'] as const) : []),
    ...(account.organizadorHabilitado ? (['organizador'] as const) : []),
  ];
  const activeContext: ContextoPessoal | null = links
    .institutionalOrganizationIds.length
    ? null
    : capabilities.includes('atleta')
      ? 'atleta'
      : null;

  return {
    sessionId: account.id,
    prototipo: permitirMocksDominio,
    account: {
      id: account.id,
      name: account.nome,
      email: account.email,
      city: `${account.municipio.nome}, ${account.municipio.uf}`,
      type: 'pessoa',
    },
    minhaConta: account,
    capabilities,
    activeContext,
    ...(account.organizadorHabilitado
      ? { organizerEnabledAt: 'habilitado-pelo-backend' }
      : {}),
    links,
  };
}

export const ContextoSessao = createContext<ValorContextoSessao | null>(null);

export function ProvedorSessao({
  children,
  api = obterApiPadrao(),
}: {
  children: ReactNode;
  api?: AutenticacaoApi;
}) {
  const refreshCoordinator = useMemo(() => new CoordenadorRefresh(api), [api]);
  const [status, setStatus] = useState<StatusSessao>('carregando');
  const [session, setSession] = useState<SessaoPessoal | null>(null);
  const credentialRef = useRef<{
    accessToken: string;
    expiresAt: number;
  } | null>(null);
  const setCredential = (next: typeof credentialRef.current) => {
    credentialRef.current = next;
  };
  const [erroSessao, setErroSessao] = useState<string | null>(null);
  const permitirMocksDominio = api instanceof AutenticacaoFake;
  const operacaoAtual = useRef(0);
  const renovacaoCompleta = useRef<Promise<string> | null>(null);

  function renovarEReconciliar(): Promise<string> {
    if (renovacaoCompleta.current) return renovacaoCompleta.current;
    const operacao = operacaoAtual.current;
    const promise = (async () => {
      try {
        const renewal = await refreshCoordinator.renovar();
        const account = await api.consultarMinhaConta(renewal.accessToken);
        if (operacao !== operacaoAtual.current) {
          throw new Error('Renovação substituída por outra operação.');
        }
        setCredential({
          accessToken: renewal.accessToken,
          expiresAt: Date.parse(renewal.accessTokenExpiraEm),
        });
        setSession(criarSessao(account, permitirMocksDominio));
        setStatus('autenticado');
        return renewal.accessToken;
      } catch (error) {
        if (operacao === operacaoAtual.current && error instanceof ErroApi) {
          if (
            ['RENOVACAO_INVALIDA', 'RENOVACAO_EXPIRADA'].includes(
              error.problem.codigo ?? '',
            )
          ) {
            setCredential(null);
            setSession(null);
            setStatus('visitante');
          } else if (error.problem.codigo === 'REUTILIZACAO_DETECTADA') {
            setCredential(null);
            setSession(null);
            setErroSessao(
              'Sua sessão foi encerrada por segurança. Entre novamente.',
            );
            setStatus('visitante');
          }
        }
        throw error;
      }
    })();
    renovacaoCompleta.current = promise;
    void promise.then(
      () => {
        if (renovacaoCompleta.current === promise)
          renovacaoCompleta.current = null;
      },
      () => {
        if (renovacaoCompleta.current === promise)
          renovacaoCompleta.current = null;
      },
    );
    return promise;
  }

  async function executarAutenticado<T>(
    request: (accessToken: string) => Promise<T>,
  ): Promise<T> {
    let credential = credentialRef.current;
    if (!credential) throw new Error('Sessão autenticada indisponível.');
    if (credential.expiresAt - Date.now() <= 30_000) {
      const accessToken = await renovarEReconciliar();
      credential = credentialRef.current;
      if (!credential) throw new Error('Sessão autenticada indisponível.');
      credential = { ...credential, accessToken };
    }

    try {
      return await request(credential.accessToken);
    } catch (error) {
      const deveRenovar =
        error instanceof ErroApi &&
        error.problem.status === 401 &&
        ['ACCESS_TOKEN_EXPIRADO', 'ACCESS_TOKEN_INVALIDO'].includes(
          error.problem.codigo ?? '',
        );
      if (!deveRenovar) throw error;
      const accessToken = await renovarEReconciliar();
      return request(accessToken);
    }
  }

  useEffect(() => {
    let active = true;
    const operacao = ++operacaoAtual.current;

    async function bootstrap() {
      try {
        const renewal = await refreshCoordinator.renovar();
        const account = await api.consultarMinhaConta(renewal.accessToken);
        if (!active || operacao !== operacaoAtual.current) return;
        setCredential({
          accessToken: renewal.accessToken,
          expiresAt: Date.parse(renewal.accessTokenExpiraEm),
        });
        setSession(criarSessao(account, permitirMocksDominio));
        setStatus('autenticado');
      } catch (error) {
        if (!active || operacao !== operacaoAtual.current) return;
        setCredential(null);
        setSession(null);
        if (
          error instanceof ErroApi &&
          ['RENOVACAO_INVALIDA', 'RENOVACAO_EXPIRADA'].includes(
            error.problem.codigo ?? '',
          )
        ) {
          setStatus('visitante');
        } else if (
          error instanceof ErroApi &&
          error.problem.codigo === 'REUTILIZACAO_DETECTADA'
        ) {
          setErroSessao(
            'Sua sessão foi encerrada por segurança. Entre novamente.',
          );
          setStatus('visitante');
        } else {
          setErroSessao(
            'Não foi possível validar sua sessão agora. Recarregue a página para tentar novamente.',
          );
          setStatus('indisponivel');
        }
      }
    }

    void bootstrap();
    return () => {
      active = false;
    };
  }, [api, permitirMocksDominio, refreshCoordinator]);

  async function signIn(email: string, senha: string): Promise<SessaoPessoal> {
    const operacao = ++operacaoAtual.current;
    let sessaoCriada = false;
    setStatus('autenticando');
    setErroSessao(null);

    try {
      const login = await api.login({
        email: email.trim().toLowerCase(),
        senha,
        plataforma: 'WEB',
      });
      sessaoCriada = true;
      if (operacao !== operacaoAtual.current) {
        throw new Error('Operação de login substituída.');
      }

      const account = await api.consultarMinhaConta(login.accessToken);
      if (operacao !== operacaoAtual.current) {
        throw new Error('Operação de login substituída.');
      }

      const nextSession = criarSessao(account, permitirMocksDominio);
      setCredential({
        accessToken: login.accessToken,
        expiresAt: Date.parse(login.accessTokenExpiraEm),
      });
      setSession(nextSession);
      setStatus('autenticado');
      return nextSession;
    } catch (error) {
      if (sessaoCriada) await api.logout().catch(() => undefined);
      if (operacao !== operacaoAtual.current) throw error;
      setCredential(null);
      setSession(null);
      setStatus('visitante');
      throw error;
    }
  }

  async function signOut(): Promise<void> {
    ++operacaoAtual.current;
    setCredential(null);
    setSession(null);
    setStatus('visitante');
    setErroSessao(null);

    try {
      await api.logout();
    } catch {
      // A revogação é best-effort quando a sessão já expirou ou a rede falha.
    }
  }

  function registerMockAccount(account: ContaMockRegistrada) {
    ++operacaoAtual.current;
    // TODO(auth-cadastro): removido o armazenamento local. O cadastro completo
    // será conectado ao adapter canônico em uma fatia posterior.
    if (api instanceof AutenticacaoFake) {
      api.registrarContaPrototipo(account);
    }
    setCredential(null);
    setSession(null);
    setStatus('visitante');
  }

  function switchContext(context: ContextoPessoal) {
    setSession((current) => {
      if (!current || !current.capabilities.includes(context)) return current;
      return { ...current, activeContext: context };
    });
  }

  function linkTeam(teamId: string) {
    if (!permitirMocksDominio) return;
    setSession((current) => {
      if (!current) return current;
      return {
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
    });
  }

  function createTeam(input: Omit<VinculoTimeCriado, 'id' | 'role'>) {
    if (!permitirMocksDominio) return '';
    const teamId = `local-${Date.now()}`;
    setSession((current) => {
      if (!current) return current;
      const createdTeam: VinculoTimeCriado = {
        ...input,
        id: teamId,
        role: 'CAPITAO',
      };
      return {
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
    });
    return teamId;
  }

  function enableOrganizer() {
    if (!permitirMocksDominio) return;
    setSession((current) => {
      if (!current) return current;
      return {
        ...current,
        minhaConta: {
          ...current.minhaConta,
          organizadorHabilitado: true,
        },
        capabilities: current.capabilities.includes('organizador')
          ? current.capabilities
          : [...current.capabilities, 'organizador'],
        activeContext: 'organizador',
      };
    });
  }

  return (
    <ContextoSessao.Provider
      value={{
        status,
        session,
        hydrated: status !== 'carregando',
        erroSessao,
        signIn,
        signOut,
        executarAutenticado,
        registerMockAccount,
        linkTeam,
        createTeam,
        enableOrganizer,
        switchContext,
      }}
    >
      {children}
    </ContextoSessao.Provider>
  );
}

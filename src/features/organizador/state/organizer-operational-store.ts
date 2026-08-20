'use client';

import { useSyncExternalStore } from 'react';

import {
  MOCK_ACTIVE_ACCOUNT_KEY,
  MOCK_ACTIVE_CHAMPIONSHIPS_KEY,
  MOCK_SESSION_CHANGED_EVENT,
} from '@/features/auth/session/session-context';
import {
  campeonatosOrganizadorMock,
  convitesColaboradorMock,
  reservasOrganizadorMock,
  vinculosCampeonatoOrganizadorMock,
} from '@/features/organizador/mocks/organizer-fixtures';
import type {
  ConviteColaborador,
  EstadoCampeonatoOperacional,
  ReservaCampeonatoOrganizador,
} from '@/features/organizador/model/organizer-models';
import { partidasPublicasMock } from '@/features/publico/mocks/public-fixtures';
import type { PartidaEstadoPublico } from '@/features/publico/model/public-models';

const STORAGE_KEY = 'campo-livre:organizer-operational-state:v2';
const RESPONSIBILITY_KEY = 'campo-livre:organizer-responsibilities:v1';

export type FatoDefinitivoPartida =
  | { tipo: 'WO'; vencedorTimeId: number; justificativa: string }
  | {
      tipo: 'SUMULA_PENDENTE_PUBLICACAO';
      placarCasa: number;
      placarFora: number;
    }
  | {
      tipo: 'SUMULA';
      placarCasa: number;
      placarFora: number;
      arbitragem: string[];
      gols: string[];
      cartoes: string[];
      substituicoes: string[];
      relatorio: string;
    };

type EstadoOperacionalMock = {
  estado: EstadoCampeonatoOperacional;
  pendencias: string[];
  validado: boolean;
  inscricoesAbertas: boolean;
  programacaoGerada: boolean;
  convitesTimePendentes: string[];
  fatosDefinitivos: Record<number, FatoDefinitivoPartida>;
  partidaEstados: Record<number, PartidaEstadoPublico>;
  colaboradores: ConviteColaborador[];
  responsavelAtual: string;
  responsavelContaId: string;
  reservas: ReservaCampeonatoOrganizador[];
};

type OrganizerOperationalSnapshot = Record<number, EstadoOperacionalMock>;

const estadoInicial: OrganizerOperationalSnapshot = Object.fromEntries(
  campeonatosOrganizadorMock.map((campeonato) => [
    campeonato.id,
    {
      estado: campeonato.estado,
      pendencias: [...campeonato.pendencias],
      validado: false,
      inscricoesAbertas: Boolean(campeonato.inscricoesAbertasEm),
      programacaoGerada: false,
      fatosDefinitivos: Object.fromEntries(
        partidasPublicasMock
          .filter(
            (partida) =>
              partida.campeonatoId === campeonato.id &&
              partida.estado === 'AGUARDANDO_PUBLICACAO',
          )
          .map((partida) => [
            partida.id,
            {
              tipo: 'SUMULA_PENDENTE_PUBLICACAO',
              placarCasa: partida.golsCasa ?? 0,
              placarFora: partida.golsFora ?? 0,
            } satisfies FatoDefinitivoPartida,
          ]),
      ),
      partidaEstados: Object.fromEntries(
        partidasPublicasMock
          .filter((partida) => partida.campeonatoId === campeonato.id)
          .map((partida) => [partida.id, partida.estado]),
      ),
      colaboradores: convitesColaboradorMock
        .filter((convite) => convite.campeonatoId === campeonato.id)
        .map((convite) => ({ ...convite })),
      responsavelAtual: campeonato.responsavel,
      responsavelContaId:
        vinculosCampeonatoOrganizadorMock.find(
          (vinculo) =>
            vinculo.campeonatoId === campeonato.id &&
            vinculo.papel === 'RESPONSAVEL',
        )?.contaId ?? '',
      reservas: reservasOrganizadorMock
        .filter((reserva) => reserva.campeonatoId === campeonato.id)
        .map((reserva) => ({ ...reserva })),
      convitesTimePendentes: campeonato.pendencias.includes(
        'Resolver convites pendentes',
      )
        ? ['Estrela Azul']
        : [],
    },
  ]),
);

let snapshot = estadoInicial;
let storageCarregado = false;
let sessionListenerRegistrado = false;
const listeners = new Set<() => void>();

function idsAtivos() {
  try {
    const raw = window.sessionStorage.getItem(MOCK_ACTIVE_CHAMPIONSHIPS_KEY);
    const ids = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(ids)
      ? ids.map(Number).filter((id) => Number.isInteger(id))
      : [];
  } catch {
    return [];
  }
}

function somenteCampeonatosAtivos(
  origem: OrganizerOperationalSnapshot,
): OrganizerOperationalSnapshot {
  const ativo: OrganizerOperationalSnapshot = {};
  for (const id of idsAtivos()) {
    const estado = origem[id] ?? estadoInicial[id];
    if (estado) ativo[id] = estado;
  }
  return ativo;
}

function aplicarResponsabilidadesPersistidas() {
  try {
    const raw = window.sessionStorage.getItem(RESPONSIBILITY_KEY);
    const responsabilidades = raw
      ? (JSON.parse(raw) as Record<number, { contaId: string; nome: string }>)
      : {};
    for (const [idTexto, responsavel] of Object.entries(responsabilidades)) {
      const id = Number(idTexto);
      const atual = snapshot[id];
      if (!atual || !responsavel?.contaId || !responsavel.nome) continue;
      snapshot = {
        ...snapshot,
        [id]: {
          ...atual,
          responsavelContaId: responsavel.contaId,
          responsavelAtual: responsavel.nome,
        },
      };
    }
  } catch {
    // Registro compartilhado inválido não impede o uso do protótipo.
  }
}

function carregarStorage() {
  if (storageCarregado || typeof window === 'undefined') return;
  storageCarregado = true;
  if (!sessionListenerRegistrado) {
    sessionListenerRegistrado = true;
    window.addEventListener(MOCK_SESSION_CHANGED_EVENT, () => {
      snapshot = somenteCampeonatosAtivos(estadoInicial);
      aplicarResponsabilidadesPersistidas();
      try {
        window.sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        // O protótipo continua em memória quando o storage não está disponível.
      }
      listeners.forEach((listener) => listener());
    });
  }

  let salvo: string | null = null;
  try {
    salvo = window.sessionStorage.getItem(STORAGE_KEY);
  } catch {
    snapshot = somenteCampeonatosAtivos(estadoInicial);
    return;
  }
  if (!salvo) {
    snapshot = somenteCampeonatosAtivos(snapshot);
    aplicarResponsabilidadesPersistidas();
    return;
  }

  try {
    const envelope = JSON.parse(salvo) as {
      accountId: string | null;
      state: OrganizerOperationalSnapshot;
    };
    const accountId = window.sessionStorage.getItem(MOCK_ACTIVE_ACCOUNT_KEY);
    if (!accountId || envelope.accountId !== accountId) {
      window.sessionStorage.removeItem(STORAGE_KEY);
      snapshot = somenteCampeonatosAtivos(snapshot);
      aplicarResponsabilidadesPersistidas();
      return;
    }
    const persistido = envelope.state;
    const hidratado: OrganizerOperationalSnapshot = {};
    for (const [idTexto, anterior] of Object.entries(persistido)) {
      const id = Number(idTexto);
      const inicial = estadoInicial[id];
      if (!inicial || !anterior || !Array.isArray(anterior.pendencias))
        continue;
      hidratado[id] = {
        ...inicial,
        ...anterior,
        partidaEstados: {
          ...inicial.partidaEstados,
          ...(anterior.partidaEstados ?? {}),
        },
        fatosDefinitivos: anterior.fatosDefinitivos ?? {},
      };
    }
    snapshot = somenteCampeonatosAtivos(hidratado);
    aplicarResponsabilidadesPersistidas();
  } catch {
    snapshot = somenteCampeonatosAtivos(estadoInicial);
    aplicarResponsabilidadesPersistidas();
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // O protótipo continua em memória quando o storage não está disponível.
    }
  }
}

function getSnapshot() {
  carregarStorage();
  return snapshot;
}

function getServerSnapshot() {
  return estadoInicial;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function atualizar(
  campeonatoId: number,
  produtor: (estado: EstadoOperacionalMock) => EstadoOperacionalMock,
) {
  carregarStorage();
  const atual = snapshot[campeonatoId];
  if (!atual) return;
  snapshot = { ...snapshot, [campeonatoId]: produtor(atual) };
  if (typeof window !== 'undefined') {
    try {
      window.sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          accountId: window.sessionStorage.getItem(MOCK_ACTIVE_ACCOUNT_KEY),
          state: snapshot,
        }),
      );
    } catch {
      // O protótipo continua funcional em memória quando a quota falha.
    }
  }
  listeners.forEach((listener) => listener());
}

function removerPendencias(estado: EstadoOperacionalMock, itens: string[]) {
  return {
    ...estado,
    pendencias: estado.pendencias.filter((item) => !itens.includes(item)),
    validado: false,
  };
}

export function useOrganizerOperationalState(campeonatoId: number) {
  const todos = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const estado = todos[campeonatoId];

  return {
    estado,
    publicarRegulamento() {
      atualizar(campeonatoId, (atual) =>
        removerPendencias(atual, ['Publicar regulamento']),
      );
    },
    salvarCriterios() {
      atualizar(campeonatoId, (atual) =>
        removerPendencias(atual, ['Configurar critérios de desempate']),
      );
    },
    validarElencos() {
      atualizar(campeonatoId, (atual) =>
        removerPendencias(atual, ['Validar elencos inscritos']),
      );
    },
    gerarProgramacao() {
      atualizar(campeonatoId, (atual) => ({
        ...removerPendencias(atual, [
          'Distribuir times nos grupos',
          'Gerar programação completa',
        ]),
        programacaoGerada: true,
      }));
    },
    registrarPartidaDefinitiva(partidaId: number, fato: FatoDefinitivoPartida) {
      atualizar(campeonatoId, (atual) => ({
        ...atual,
        fatosDefinitivos: atual.fatosDefinitivos[partidaId]
          ? atual.fatosDefinitivos
          : { ...atual.fatosDefinitivos, [partidaId]: fato },
      }));
    },
    atualizarEstadoPartida(
      partidaId: number,
      estadoPartida: PartidaEstadoPublico,
    ) {
      atualizar(campeonatoId, (atual) => ({
        ...atual,
        partidaEstados: {
          ...atual.partidaEstados,
          [partidaId]: estadoPartida,
        },
      }));
    },
    solicitarReserva(
      dados: Omit<
        ReservaCampeonatoOrganizador,
        'id' | 'campeonatoId' | 'estado'
      >,
    ) {
      atualizar(campeonatoId, (atual) => ({
        ...atual,
        reservas: [
          ...atual.reservas,
          {
            ...dados,
            id: Math.max(0, ...atual.reservas.map((item) => item.id)) + 1,
            campeonatoId,
            estado: 'PENDENTE',
          },
        ],
      }));
    },
    cancelarReserva(reservaId: number) {
      atualizar(campeonatoId, (atual) => ({
        ...atual,
        reservas: atual.reservas.map((item) =>
          item.id === reservaId ? { ...item, estado: 'CANCELADA' } : item,
        ),
      }));
    },
    convidarOrganizador(conta: string, contexto: string) {
      atualizar(campeonatoId, (atual) => ({
        ...atual,
        colaboradores: [
          ...atual.colaboradores,
          {
            id: Math.max(0, ...atual.colaboradores.map((item) => item.id)) + 1,
            campeonatoId,
            conta,
            contexto,
            estado: 'PENDENTE',
          },
        ],
      }));
    },
    cancelarConviteOrganizador(conviteId: number) {
      atualizar(campeonatoId, (atual) => ({
        ...atual,
        colaboradores: atual.colaboradores.map((item) =>
          item.id === conviteId ? { ...item, estado: 'CANCELADO' } : item,
        ),
      }));
    },
    removerColaborador(conviteId: number) {
      atualizar(campeonatoId, (atual) => ({
        ...atual,
        colaboradores: atual.colaboradores.filter(
          (item) => item.id !== conviteId,
        ),
      }));
    },
    transferirResponsabilidade(
      novoResponsavelContaId: string,
      novoResponsavel: string,
    ) {
      atualizar(campeonatoId, (atual) => ({
        ...atual,
        responsavelAtual: novoResponsavel,
        responsavelContaId: novoResponsavelContaId,
      }));
      try {
        const raw = window.sessionStorage.getItem(RESPONSIBILITY_KEY);
        const responsabilidades = raw
          ? (JSON.parse(raw) as Record<
              number,
              { contaId: string; nome: string }
            >)
          : {};
        window.sessionStorage.setItem(
          RESPONSIBILITY_KEY,
          JSON.stringify({
            ...responsabilidades,
            [campeonatoId]: {
              contaId: novoResponsavelContaId,
              nome: novoResponsavel,
            },
          }),
        );
      } catch {
        // A transferência continua válida em memória nesta sessão.
      }
    },
    convidarTime(time: string) {
      atualizar(campeonatoId, (atual) => ({
        ...atual,
        pendencias: atual.pendencias.includes('Resolver convites pendentes')
          ? atual.pendencias
          : [...atual.pendencias, 'Resolver convites pendentes'],
        convitesTimePendentes: atual.convitesTimePendentes.includes(time)
          ? atual.convitesTimePendentes
          : [...atual.convitesTimePendentes, time],
        validado: false,
      }));
    },
    cancelarConviteTime(time: string) {
      atualizar(campeonatoId, (atual) => {
        const convitesTimePendentes = atual.convitesTimePendentes.filter(
          (item) => item !== time,
        );
        return {
          ...atual,
          convitesTimePendentes,
          pendencias:
            convitesTimePendentes.length === 0
              ? atual.pendencias.filter(
                  (item) => item !== 'Resolver convites pendentes',
                )
              : atual.pendencias,
          validado: false,
        };
      });
    },
    validarConfiguracao() {
      atualizar(campeonatoId, (atual) =>
        atual.pendencias.length === 0 ? { ...atual, validado: true } : atual,
      );
    },
    abrirInscricoes() {
      atualizar(campeonatoId, (atual) =>
        atual.validado ? { ...atual, inscricoesAbertas: true } : atual,
      );
    },
    iniciarCampeonato() {
      atualizar(campeonatoId, (atual) =>
        atual.validado && atual.inscricoesAbertas
          ? { ...atual, estado: 'EM_ANDAMENTO' }
          : atual,
      );
    },
    cancelarCampeonato() {
      atualizar(campeonatoId, (atual) => ({
        ...atual,
        estado: 'CANCELADO',
      }));
    },
    encerrarCampeonato() {
      atualizar(campeonatoId, (atual) => ({
        ...atual,
        estado: 'ENCERRADO',
      }));
    },
  };
}

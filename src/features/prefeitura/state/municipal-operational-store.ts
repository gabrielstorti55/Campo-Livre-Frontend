'use client';

import { useSyncExternalStore } from 'react';

export type MunicipalField = {
  id: string;
  name: string;
  address: string;
  neighborhood: string;
  turf: 'Natural' | 'Sintético' | 'Terra';
  notes: string;
  status: 'AVAILABLE' | 'MAINTENANCE';
};

export type MunicipalReservation = {
  id: string;
  localReservationId?: number;
  championshipId: number;
  championship: string;
  organizerAccountId: string;
  organizer: string;
  fieldId: string;
  field: string;
  date: string;
  start: string;
  end: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  reason?: string;
};

export type MunicipalOrganizer = {
  id: number;
  accountId: string;
  name: string;
  events: number;
  status: 'ACTIVE' | 'SUSPENDED';
};

type MunicipalSnapshot = {
  fields: MunicipalField[];
  reservations: MunicipalReservation[];
  organizers: MunicipalOrganizer[];
};

const STORAGE_KEY = 'campo-livre:municipal-operational-state:v2';

const initialState: MunicipalSnapshot = {
  fields: [
    ['1', 'Campo Vera Cruz', 'Rua das Palmeiras, 120 — Vera Cruz', 'Vera Cruz'],
    ['2', 'Campo Santa Rita', 'Av. Santa Rita, 890 — Santa Rita', 'Santa Rita'],
    ['3', 'Campo Aeroporto', 'Rua do Aeroporto, 55 — Aeroporto', 'Aeroporto'],
    [
      '4',
      'Campo Palmeiras',
      'Rua Ipê, 340 — Jardim Palmeiras',
      'Jardim Palmeiras',
    ],
    ['5', 'Campo São José', 'Rua Bahia, 700 — São José', 'São José'],
    [
      '6',
      'Campo Parque Moema',
      'Av. Moema, 1200 — Parque Moema',
      'Parque Moema',
    ],
  ].map(([id, name, address, neighborhood]) => ({
    id: id!,
    name: name!,
    address: address!,
    neighborhood: neighborhood!,
    turf: 'Natural' as const,
    notes: '',
    status: 'AVAILABLE' as const,
  })),
  reservations: [
    {
      id: 'legacy-1',
      championshipId: 4,
      championship: 'Copa Verão 2026',
      organizerAccountId: 'mock-organizer-carlos',
      organizer: 'Carlos Mota',
      fieldId: '3',
      field: 'Campo Aeroporto',
      date: '2026-08-21',
      start: '14:00',
      end: '16:00',
      status: 'PENDING',
    },
    {
      id: 'legacy-2',
      championshipId: 8,
      championship: 'Liga Bairro Norte',
      organizerAccountId: 'mock-organizer-pedro',
      organizer: 'Pedro Nunes',
      fieldId: '2',
      field: 'Campo Santa Rita',
      date: '2026-08-24',
      start: '09:00',
      end: '11:00',
      status: 'PENDING',
    },
    {
      id: 'legacy-3',
      championshipId: 9,
      championship: 'Torneio da Amizade',
      organizerAccountId: 'mock-organizer-maria',
      organizer: 'Maria Costa',
      fieldId: '4',
      field: 'Campo Palmeiras',
      date: '2026-08-28',
      start: '17:00',
      end: '19:00',
      status: 'PENDING',
    },
    {
      id: 'legacy-approved-1',
      championshipId: 1,
      championship: 'Copa Franca 2026',
      organizerAccountId: 'mock-person-1',
      organizer: 'Marcos Oliveira',
      fieldId: '1',
      field: 'Campo Vera Cruz',
      date: '2026-08-07',
      start: '14:00',
      end: '16:00',
      status: 'APPROVED',
    },
  ],
  organizers: [
    {
      id: 1,
      accountId: 'mock-person-1',
      name: 'Marcos Oliveira',
      events: 5,
      status: 'ACTIVE',
    },
    {
      id: 2,
      accountId: 'mock-person-collaborator-1',
      name: 'Juliana Lopes',
      events: 1,
      status: 'ACTIVE',
    },
    {
      id: 3,
      accountId: 'mock-organizer-carlos',
      name: 'Carlos Mota',
      events: 7,
      status: 'ACTIVE',
    },
    {
      id: 4,
      accountId: 'mock-organizer-pedro',
      name: 'Pedro Nunes',
      events: 5,
      status: 'ACTIVE',
    },
    {
      id: 5,
      accountId: 'mock-organizer-maria',
      name: 'Maria Costa',
      events: 9,
      status: 'ACTIVE',
    },
  ],
};

let snapshot = initialState;
let hydrated = false;
const listeners = new Set<() => void>();

function load() {
  if (hydrated || typeof window === 'undefined') return;
  hydrated = true;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Partial<MunicipalSnapshot>;
    if (
      Array.isArray(parsed.fields) &&
      Array.isArray(parsed.reservations) &&
      Array.isArray(parsed.organizers)
    ) {
      snapshot = parsed as MunicipalSnapshot;
    }
  } catch {
    snapshot = initialState;
  }
}

function persist(next: MunicipalSnapshot) {
  snapshot = next;
  if (typeof window !== 'undefined') {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  listeners.forEach((listener) => listener());
}

function getSnapshot() {
  load();
  return snapshot;
}

function getServerSnapshot() {
  return initialState;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function overlaps(a: MunicipalReservation, b: MunicipalReservation) {
  return a.start < b.end && b.start < a.end;
}

export function registerMunicipalReservation(
  reservation: Omit<MunicipalReservation, 'status' | 'reason'>,
) {
  load();
  if (snapshot.reservations.some((item) => item.id === reservation.id)) {
    return false;
  }
  const nextReservation: MunicipalReservation = {
    ...reservation,
    status: 'PENDING',
  };
  persist({
    ...snapshot,
    reservations: [...snapshot.reservations, nextReservation],
  });
  return true;
}

export function cancelMunicipalReservation(id: string) {
  load();
  persist({
    ...snapshot,
    reservations: snapshot.reservations.map((item) =>
      item.id === id ? { ...item, status: 'CANCELLED' as const } : item,
    ),
  });
}

export function useMunicipalOperationalState() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return {
    state,
    createField(input: Omit<MunicipalField, 'id' | 'status'>) {
      const field: MunicipalField = {
        ...input,
        id: `local-field-${Date.now()}`,
        status: 'AVAILABLE',
      };
      persist({ ...state, fields: [...state.fields, field] });
      return field.id;
    },
    toggleFieldStatus(id: string) {
      const field = state.fields.find((item) => item.id === id);
      const hasApprovedReservation = state.reservations.some(
        (reservation) =>
          reservation.fieldId === id && reservation.status === 'APPROVED',
      );
      if (field?.status === 'AVAILABLE' && hasApprovedReservation) {
        return 'APPROVED_RESERVATIONS' as const;
      }
      persist({
        ...state,
        fields: state.fields.map((field) =>
          field.id === id
            ? {
                ...field,
                status:
                  field.status === 'AVAILABLE' ? 'MAINTENANCE' : 'AVAILABLE',
              }
            : field,
        ),
      });
      return 'OK' as const;
    },
    decideReservation(
      id: string,
      decision: 'APPROVED' | 'REJECTED',
      reason?: string,
    ) {
      const target = state.reservations.find((item) => item.id === id);
      if (!target || target.status !== 'PENDING') return 'NOT_PENDING' as const;
      if (decision === 'REJECTED' && !reason?.trim())
        return 'REASON_REQUIRED' as const;
      if (decision === 'APPROVED') {
        const field = state.fields.find((item) => item.id === target.fieldId);
        if (!field || field.status !== 'AVAILABLE')
          return 'FIELD_UNAVAILABLE' as const;
        const conflict = state.reservations.some(
          (item) =>
            item.id !== target.id &&
            item.status === 'APPROVED' &&
            item.fieldId === target.fieldId &&
            item.date === target.date &&
            overlaps(item, target),
        );
        if (conflict) return 'CONFLICT' as const;
      }
      persist({
        ...state,
        reservations: state.reservations.map((item) => {
          if (item.id !== id) return item;
          if (decision === 'REJECTED') {
            return { ...item, status: decision, reason: reason!.trim() };
          }
          const { reason: _reason, ...withoutReason } = item;
          return { ...withoutReason, status: decision };
        }),
      });
      return 'OK' as const;
    },
    toggleOrganizer(id: number) {
      persist({
        ...state,
        organizers: state.organizers.map((organizer) =>
          organizer.id === id
            ? {
                ...organizer,
                status: organizer.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE',
              }
            : organizer,
        ),
      });
    },
  };
}

export function formatMunicipalDate(date: string) {
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
}

'use client';

import {
  CalendarDays,
  CheckSquare,
  Home,
  MapPinned,
  Trophy,
  User,
  Users,
} from 'lucide-react';
import type { ReactNode } from 'react';

import { useSession } from '@/features/auth/session/session-context';
import { atletaLogado, organizadorLogado } from '@/mocks/data';
import { ProfileShell } from '@/shared/components/profile-shell';

export function AtletaLayout({ children }: { children: ReactNode }) {
  const { session } = useSession();
  const items = [
    { label: 'Início', to: '/atleta/inicio', icon: Home },
    { label: 'Campeonatos', to: '/atleta/campeonatos', icon: Trophy },
    { label: 'Meus Eventos', to: '/atleta/meus-eventos', icon: CalendarDays },
    { label: 'Perfil', to: '/atleta/perfil', icon: User },
  ];

  return (
    <ProfileShell
      items={items}
      tone="green"
      userName={session?.account.name ?? atletaLogado.nome}
      userRole="Atleta / Capitão"
    >
      {children}
    </ProfileShell>
  );
}

export function OrganizadorLayout({ children }: { children: ReactNode }) {
  const { session } = useSession();
  const items = [
    { label: 'Início', to: '/organizador/inicio', icon: Home },
    { label: 'Meus Campeonatos', to: '/organizador/campeonatos', icon: Trophy },
    { label: 'Perfil', to: '/organizador/perfil', icon: User },
  ];

  return (
    <ProfileShell
      items={items}
      tone="green"
      userName={session?.account.name ?? organizadorLogado.nome}
      userRole="Organizador"
    >
      {children}
    </ProfileShell>
  );
}

export function PrefeituraLayout({ children }: { children: ReactNode }) {
  const items = [
    { label: 'Início', to: '/prefeitura/painel', icon: Home },
    { label: 'Campos', to: '/prefeitura/campos', icon: MapPinned },
    { label: 'Organizadores', to: '/prefeitura/organizadores', icon: Users },
    { label: 'Calendário', to: '/prefeitura/calendario', icon: CalendarDays },
    { label: 'Aprovações', to: '/prefeitura/aprovacoes', icon: CheckSquare },
  ];

  return (
    <ProfileShell
      items={items}
      tone="navy"
      userName="Prefeitura Franca"
      userRole="Gestão pública"
    >
      {children}
    </ProfileShell>
  );
}

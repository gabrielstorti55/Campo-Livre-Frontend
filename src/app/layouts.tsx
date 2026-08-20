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
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

import { useSession } from '@/features/auth/session/session-context';
import { atletaLogado, organizadorLogado } from '@/mocks/data';
import { ProfileShell } from '@/shared/components/profile-shell';

export function AtletaLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { session, signOut } = useSession();
  const items = [
    { label: 'Início', to: '/atleta/inicio', icon: Home },
    { label: 'Campeonatos', to: '/atleta/campeonatos', icon: Trophy },
    { label: 'Times e convites', to: '/atleta/time/buscar', icon: Users },
    { label: 'Meus Eventos', to: '/atleta/meus-eventos', icon: CalendarDays },
    { label: 'Perfil', to: '/atleta/perfil', icon: User },
  ];

  return (
    <ProfileShell
      items={items}
      tone="green"
      userName={session?.account.name ?? atletaLogado.nome}
      userRole="Conta pessoal"
      onSignOut={() => {
        signOut();
        router.replace('/login');
      }}
    >
      {children}
    </ProfileShell>
  );
}

export function OrganizadorLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { session, signOut } = useSession();
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
      onSignOut={() => {
        signOut();
        router.replace('/login');
      }}
    >
      {children}
    </ProfileShell>
  );
}

export function PrefeituraLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { session, signOut } = useSession();
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
      userName={session?.account.name ?? 'Prefeitura de Franca'}
      userRole="Gestão pública municipal"
      onSignOut={() => {
        signOut();
        router.replace('/login');
      }}
    >
      {children}
    </ProfileShell>
  );
}

'use client';

import {
  CalendarDays,
  Home,
  MapPinned,
  Trophy,
  User,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

import { useSessao } from '@/hooks/use-sessao';
import { LayoutAreaAutenticada } from '@/layouts/area-autenticada';

const itensPublicos = [
  { label: 'Início', to: '/', icon: Home },
  { label: 'Campeonatos', to: '/campeonatos', icon: Trophy },
  { label: 'Times', to: '/times', icon: Users },
  { label: 'Campos', to: '/campos', icon: MapPinned },
  { label: 'Partidas', to: '/partidas', icon: CalendarDays },
  { label: 'Atletas', to: '/atletas', icon: User },
];

const itemMinhaArea = { label: 'Minha área', to: '/minha-area', icon: User };

export function LayoutAtleta({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { session, signOut } = useSessao();
  const items = [
    { label: 'Campeonatos', to: '/atleta/campeonatos', icon: Trophy },
    { label: 'Times e convites', to: '/atleta/time/buscar', icon: Users },
    { label: 'Meus Eventos', to: '/atleta/meus-eventos', icon: CalendarDays },
    { label: 'Perfil', to: '/atleta/perfil', icon: User },
  ];

  return (
    <LayoutAreaAutenticada
      publicItems={itensPublicos}
      accountItem={itemMinhaArea}
      items={items}
      tone="green"
      userName={session?.account.name ?? 'Atleta'}
      userRole="Conta pessoal"
      onSignOut={() => {
        signOut();
        router.replace('/login');
      }}
    >
      {children}
    </LayoutAreaAutenticada>
  );
}

export function LayoutOrganizador({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { session, signOut } = useSessao();
  const items = [
    { label: 'Meus Campeonatos', to: '/organizador/campeonatos', icon: Trophy },
    { label: 'Histórico', to: '/organizador/perfil', icon: CalendarDays },
  ];

  return (
    <LayoutAreaAutenticada
      publicItems={itensPublicos}
      accountItem={itemMinhaArea}
      items={items}
      tone="green"
      userName={session?.account.name ?? 'Organizador'}
      userRole="Organizador"
      onSignOut={() => {
        signOut();
        router.replace('/login');
      }}
    >
      {children}
    </LayoutAreaAutenticada>
  );
}

export function LayoutPrefeitura({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { session, signOut } = useSessao();
  const items = [
    { label: 'Início', to: '/prefeitura/painel', icon: Home },
    {
      label: 'Campos',
      to: '/prefeitura/campos',
      icon: MapPinned,
    },
  ];

  return (
    <LayoutAreaAutenticada
      publicItems={itensPublicos}
      accountItem={itemMinhaArea}
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
    </LayoutAreaAutenticada>
  );
}

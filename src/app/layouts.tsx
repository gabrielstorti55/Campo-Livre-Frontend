import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  CalendarDays,
  CheckSquare,
  Home,
  MapPinned,
  Trophy,
  User,
  Users,
} from 'lucide-react';
import { Outlet } from 'react-router-dom';

import { atletaLogado, organizadorLogado } from '@/mocks/data';
import { ProfileShell } from '@/shared/components/profile-shell';

const queryClient = new QueryClient();

export function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}

export function AtletaLayout() {
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
      userName={atletaLogado.nome}
      userRole="Atleta / Capitão"
    >
      <Outlet />
    </ProfileShell>
  );
}

export function OrganizadorLayout() {
  const items = [
    { label: 'Início', to: '/organizador/inicio', icon: Home },
    { label: 'Meus Campeonatos', to: '/organizador/campeonatos', icon: Trophy },
    { label: 'Perfil', to: '/organizador/perfil', icon: User },
  ];

  return (
    <ProfileShell
      items={items}
      tone="green"
      userName={organizadorLogado.nome}
      userRole="Organizador"
    >
      <Outlet />
    </ProfileShell>
  );
}

export function PrefeituraLayout() {
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
      <Outlet />
    </ProfileShell>
  );
}

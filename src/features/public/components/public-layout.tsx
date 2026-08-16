import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Home,
  LogIn,
  Menu,
  Trophy,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigation } from 'react-router-dom';

import { cn } from '@/shared/lib/utils';

const navigationItems = [
  { label: 'Início', to: '/', icon: Home },
  { label: 'Campeonatos', to: '/campeonatos', icon: Trophy },
  { label: 'Times', to: '/times', icon: Users },
  { label: 'Partidas', to: '/partidas', icon: CalendarDays },
] as const;

function PublicNavigation({
  collapsed = false,
  onNavigate,
  label = 'Navegação pública',
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
  label?: string;
}) {
  return (
    <nav className="space-y-1" aria-label={label}>
      {navigationItems.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              cn(
                'group flex h-11 items-center rounded-xl text-sm font-semibold transition-colors',
                collapsed ? 'justify-center px-0' : 'gap-3 px-3',
                isActive
                  ? 'bg-white/12 text-white'
                  : 'text-white/65 hover:bg-white/8 hover:text-white',
              )
            }
          >
            <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
            {!collapsed ? <span>{item.label}</span> : null}
          </NavLink>
        );
      })}
    </nav>
  );
}

export function PublicLayout() {
  const navigation = useNavigation();
  const loading = navigation.state !== 'idle';
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface text-foreground lg:flex">
      <a
        href="#conteudo-publico"
        className="sr-only z-[70] rounded-md bg-white px-4 py-2 font-semibold text-green-dark focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
      >
        Ir para o conteúdo público
      </a>

      <aside
        className={cn(
          'sticky top-0 hidden h-screen shrink-0 flex-col bg-green-dark text-white transition-[width] duration-200 lg:flex',
          collapsed ? 'w-20' : 'w-72',
        )}
      >
        <div
          className={cn(
            'flex h-20 items-center border-b border-white/10',
            collapsed ? 'justify-center px-3' : 'justify-between px-5',
          )}
        >
          <Link to="/" className="min-w-0">
            {collapsed ? (
              <span className="font-display text-xl font-bold">C</span>
            ) : (
              <div>
                <p className="font-display text-xl font-bold tracking-[-0.025em]">
                  CampoLivre
                </p>
                <p className="mt-0.5 text-[11px] font-medium tracking-[0.12em] text-white/50 uppercase">
                  LigaPro
                </p>
              </div>
            )}
          </Link>

          {!collapsed ? (
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Recolher menu lateral"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <div className="flex-1 px-3 py-5">
          <PublicNavigation collapsed={collapsed} />
        </div>

        <div className="border-t border-white/10 p-3">
          {collapsed ? (
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              className="mb-2 flex h-10 w-full items-center justify-center rounded-xl text-white/60 hover:bg-white/10 hover:text-white"
              aria-label="Expandir menu lateral"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : null}

          <Link
            to="/login"
            className={cn(
              'flex h-10 items-center rounded-xl text-sm font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white',
              collapsed ? 'justify-center' : 'gap-3 px-3',
            )}
            title={collapsed ? 'Entrar' : undefined}
          >
            <LogIn className="h-4 w-4" />
            {!collapsed ? 'Entrar' : null}
          </Link>
          <Link
            to="/cadastro"
            className={cn(
              'mt-1 flex h-10 items-center rounded-xl bg-white text-sm font-semibold text-green-dark transition-opacity hover:opacity-90',
              collapsed ? 'justify-center' : 'gap-3 px-3',
            )}
            title={collapsed ? 'Criar conta' : undefined}
          >
            <UserPlus className="h-4 w-4" />
            {!collapsed ? 'Criar conta' : null}
          </Link>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border/70 bg-white/90 px-4 backdrop-blur-md lg:hidden">
          <Link to="/" className="font-display text-lg font-bold text-green-dark">
            CampoLivre
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white text-green-dark"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        {mobileOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
              onClick={() => setMobileOpen(false)}
              aria-label="Fechar menu"
            />
            <aside className="relative flex h-full w-[min(84vw,320px)] flex-col bg-green-dark p-4 text-white shadow-2xl">
              <div className="mb-6 flex items-center justify-between px-2 pt-1">
                <div>
                  <p className="font-display text-xl font-bold">CampoLivre</p>
                  <p className="text-[11px] tracking-[0.12em] text-white/50 uppercase">
                    LigaPro
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-white/70 hover:bg-white/10"
                  aria-label="Fechar menu lateral"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <PublicNavigation
                onNavigate={() => setMobileOpen(false)}
                label="Navegação pública móvel"
              />

              <div className="mt-auto space-y-2 border-t border-white/10 pt-4">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-white/75 hover:bg-white/10"
                >
                  <LogIn className="h-4 w-4" /> Entrar
                </Link>
                <Link
                  to="/cadastro"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-11 items-center gap-3 rounded-xl bg-white px-3 text-sm font-semibold text-green-dark"
                >
                  <UserPlus className="h-4 w-4" /> Criar conta
                </Link>
              </div>
            </aside>
          </div>
        ) : null}

        {loading ? (
          <div className="fixed top-0 right-0 left-0 z-[60] h-0.5 overflow-hidden bg-green-pale lg:left-auto">
            <div className="h-full w-1/2 animate-pulse bg-green-mid" />
          </div>
        ) : null}

        <main id="conteudo-publico" aria-busy={loading} className="min-h-[calc(100vh-4rem)] lg:min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

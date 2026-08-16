import {
  CalendarDays,
  Home,
  LogIn,
  Menu,
  Trophy,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigation } from 'react-router-dom';

import { cn } from '@/shared/lib/utils';

const navigationItems = [
  { label: 'Início', to: '/', icon: Home },
  { label: 'Campeonatos', to: '/campeonatos', icon: Trophy },
  { label: 'Times', to: '/times', icon: Users },
  { label: 'Partidas', to: '/partidas', icon: CalendarDays },
] as const;

function PublicNavigation({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="space-y-1" aria-label="Navegação pública">
      {navigationItems.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors',
                isActive
                  ? 'bg-white text-green-dark'
                  : 'text-white/72 hover:bg-white/10 hover:text-white',
              )
            }
          >
            <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

export function PublicLayout() {
  const navigation = useNavigation();
  const loading = navigation.state !== 'idle';
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);

  return (
    <div className="min-h-screen bg-[#f7f8f6] text-foreground">
      <a
        href="#conteudo-publico"
        className="sr-only z-[80] rounded-md bg-white px-4 py-2 font-semibold text-green-dark shadow-lg focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
      >
        Ir para o conteúdo público
      </a>

      <header className="sticky top-0 z-40 border-b border-black/5 bg-[#f7f8f6]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-[1480px] items-center gap-3 px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-black/8 bg-white px-3 text-sm font-semibold text-green-dark shadow-sm transition hover:-translate-y-px hover:shadow-md"
            aria-label="Abrir menu público"
            aria-expanded={menuOpen}
            aria-controls="public-sidebar"
          >
            <Menu className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Menu</span>
          </button>

          <Link to="/" className="ml-1 min-w-0">
            <p className="truncate font-display text-lg font-bold tracking-[-0.025em] text-green-dark">
              CampoLivre
            </p>
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/login"
              className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-green-dark transition-colors hover:bg-green-pale sm:inline-flex"
            >
              Entrar
            </Link>
            <Link
              to="/cadastro"
              className="inline-flex rounded-xl bg-green-dark px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-px hover:shadow-md"
            >
              Criar conta
            </Link>
          </div>
        </div>
      </header>

      {menuOpen ? (
        <div className="fixed inset-0 z-[70]">
          <button
            type="button"
            className="absolute inset-0 bg-black/35 backdrop-blur-[2px]"
            onClick={() => setMenuOpen(false)}
            aria-label="Fechar menu público"
          />

          <aside
            id="public-sidebar"
            className="relative flex h-full w-[min(88vw,340px)] flex-col overflow-hidden text-white shadow-2xl"
            aria-label="Menu público"
          >
            <img
              src="./public/soccer-field.jpg"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-green-dark/90" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />

            <div className="relative z-10 flex h-full flex-col p-4 sm:p-5">
              <div className="mb-8 flex items-start justify-between gap-4 px-1 pt-1">
                <Link to="/" onClick={() => setMenuOpen(false)}>
                  <p className="font-display text-xl font-bold tracking-[-0.03em]">CampoLivre</p>
                  <p className="mt-1 text-[11px] font-semibold tracking-[0.16em] text-white/55 uppercase">
                    LigaPro
                  </p>
                </Link>

                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white/80 transition hover:bg-white/15 hover:text-white"
                  aria-label="Fechar menu lateral"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <PublicNavigation onNavigate={() => setMenuOpen(false)} />

              <div className="mt-auto rounded-2xl border border-white/12 bg-black/15 p-3 backdrop-blur-sm">
                <p className="px-2 pb-2 text-xs leading-5 text-white/55">
                  Navegue sem cadastro. Entre apenas quando precisar realizar uma ação pessoal.
                </p>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-white"
                >
                  <LogIn className="h-4 w-4" /> Entrar
                </Link>
                <Link
                  to="/cadastro"
                  onClick={() => setMenuOpen(false)}
                  className="mt-1 flex h-11 items-center gap-3 rounded-xl bg-white px-3 text-sm font-semibold text-green-dark"
                >
                  <UserPlus className="h-4 w-4" /> Criar conta
                </Link>
              </div>
            </div>
          </aside>
        </div>
      ) : null}

      {loading ? (
        <div className="fixed top-16 right-0 left-0 z-50 h-0.5 overflow-hidden bg-green-pale">
          <div className="h-full w-1/2 animate-pulse bg-green-mid" />
        </div>
      ) : null}

      <main id="conteudo-publico" aria-busy={loading} className="min-h-[calc(100vh-4rem)]">
        <Outlet />
      </main>
    </div>
  );
}

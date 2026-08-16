import { Link, NavLink, Outlet, useNavigation } from 'react-router-dom';

import { cn } from '@/shared/lib/utils';

const navigationItems = [
  { label: 'Campeonatos', to: '/campeonatos' },
  { label: 'Times', to: '/times' },
  { label: 'Partidas', to: '/partidas' },
] as const;

export function PublicLayout() {
  const navigation = useNavigation();
  const loading = navigation.state !== 'idle';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#conteudo-publico"
        className="sr-only z-50 rounded-md bg-white px-4 py-2 font-semibold text-green-dark focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Ir para o conteúdo público
      </a>

      <header className="border-b border-border bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link
            to="/"
            className="font-display text-xl font-semibold tracking-[-0.02em] text-green-dark"
          >
            CampoLivre
          </Link>

          <nav
            className="order-3 flex w-full items-center gap-1 overflow-x-auto sm:order-2 sm:w-auto"
            aria-label="Navegação pública"
          >
            {navigationItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'shrink-0 rounded-md px-3 py-2 text-sm font-semibold transition-colors',
                    isActive
                      ? 'bg-green-pale text-green-dark'
                      : 'text-muted-foreground hover:bg-surface hover:text-foreground',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="order-2 flex items-center gap-2 sm:order-3">
            <Link
              to="/login"
              className="rounded-md px-3 py-2 text-sm font-semibold text-green-dark transition-colors hover:bg-green-pale"
            >
              Entrar
            </Link>
            <Link
              to="/cadastro"
              className="rounded-md bg-green-dark px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Criar conta
            </Link>
          </div>
        </div>
      </header>

      {loading ? (
        <div
          className="border-b border-border bg-green-pale px-5 py-2 text-center text-xs font-semibold text-green-dark"
          role="status"
        >
          Carregando conteúdo público…
        </div>
      ) : null}

      <main id="conteudo-publico" aria-busy={loading}>
        <Outlet />
      </main>

      <footer className="mt-12 border-t border-border bg-white">
        <div className="mx-auto w-full max-w-6xl px-5 py-6 text-sm text-muted-foreground sm:px-8">
          Conteúdo público do CampoLivre. Ações pessoais exigem autenticação.
        </div>
      </footer>
    </div>
  );
}

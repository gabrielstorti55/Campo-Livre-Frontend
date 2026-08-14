import { Link, useLocation } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Initials } from '@/shared/components/campo-livre-ui';
import { cn } from '@/shared/lib/utils';

export type NavItem = { label: string; to: string; icon: LucideIcon };

type ShellTone = 'green' | 'navy';

function isItemActive(pathname: string, to: string) {
  return pathname === to || (to !== '/' && pathname.startsWith(`${to}/`));
}

export function ProfileShell({
  items,
  tone,
  userName,
  userRole,
  children,
}: {
  items: NavItem[];
  tone: ShellTone;
  userName: string;
  userRole: string;
  children: ReactNode;
}) {
  const { pathname } = useLocation();
  const shellColor = tone === 'navy' ? 'bg-navy-dark' : 'bg-green-dark';

  return (
    <div className="min-h-screen w-full bg-surface lg:flex">
      <a
        href="#conteudo-principal"
        className="fixed top-3 left-3 z-50 -translate-y-20 bg-white px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition-transform focus:translate-y-0"
      >
        Ir para o conteúdo principal
      </a>

      <aside
        className={cn(
          'sticky top-0 hidden h-screen w-64 shrink-0 flex-col lg:flex',
          shellColor,
        )}
      >
        <div className="border-b border-white/10 px-7 py-7">
          <span className="block font-display text-xl font-bold tracking-[-0.04em] text-white">
            CampoLivre
          </span>
          <span className="mt-1 block text-xs text-white/90">
            LigaPro · Franca, SP
          </span>
        </div>

        <nav aria-label="Navegação principal" className="flex-1 px-4 py-6">
          <p className="mb-3 px-3 text-[10px] font-bold tracking-[0.16em] text-white/90 uppercase">
            Área de trabalho
          </p>
          <div className="space-y-1">
            {items.map((item) => {
              const active = isItemActive(pathname, item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-3 border-l-2 border-transparent px-3 py-2.5 text-sm font-medium text-white/90 transition-colors hover:bg-white/5 hover:text-white',
                    active && 'border-white bg-white/10 text-white',
                  )}
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-white/10 px-5 py-5">
          <div className="flex items-center gap-3">
            <Initials
              name={userName}
              tone={tone === 'navy' ? 'navy' : 'light'}
              className="h-9 w-9 text-xs"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {userName}
              </p>
              <p className="truncate text-xs text-white/90">{userRole}</p>
            </div>
          </div>
        </div>
      </aside>

      <main
        id="conteudo-principal"
        tabIndex={-1}
        className="min-w-0 flex-1 pb-24 outline-none lg:pb-0"
      >
        <div className="mx-auto max-w-7xl space-y-10 px-5 py-7 sm:px-7 md:py-9 lg:px-10 lg:py-10">
          {children}
        </div>
      </main>

      <nav
        aria-label="Navegação principal"
        className={cn(
          'fixed inset-x-0 bottom-0 z-40 grid border-t border-white/10 px-1 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] text-white shadow-[0_-2px_12px_rgba(15,23,42,0.12)] lg:hidden',
          shellColor,
        )}
        style={{
          gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`,
        }}
      >
        {items.map((item) => {
          const active = isItemActive(pathname, item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex min-w-0 flex-col items-center gap-1 border-t-2 border-transparent px-1 py-1 text-white/90',
                active && 'border-white text-white',
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="w-full whitespace-nowrap text-center text-[9px] font-medium sm:text-[10px]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function ProfileHeroHeader({
  name,
  subtitle,
  meta,
  tone = 'green',
}: {
  name: string;
  subtitle: string;
  meta: string;
  tone?: ShellTone;
}) {
  return (
    <header className="flex items-end justify-between gap-5 border-b border-border pb-6">
      <div className="min-w-0">
        <p
          className={cn(
            'mb-2 text-[11px] font-bold tracking-[0.15em] uppercase',
            tone === 'navy' ? 'text-navy-mid' : 'text-green-dark',
          )}
        >
          Visão geral
        </p>
        <h1 className="text-balance font-display text-2xl font-semibold tracking-[-0.03em] text-foreground sm:text-3xl">
          {name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        <p className="mt-2 text-xs text-muted-foreground">{meta}</p>
      </div>
      <Initials
        name={name}
        tone={tone === 'navy' ? 'navy' : 'green'}
        className="hidden h-12 w-12 text-sm sm:flex"
      />
    </header>
  );
}

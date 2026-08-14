import { Link, useLocation } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Initials } from '@/shared/components/campo-livre-ui';
import { cn } from '@/shared/lib/utils';

export type NavItem = { label: string; to: string; icon: LucideIcon };

export function ProfileShell({
  items,
  tone,
  userName,
  userRole,
  children,
}: {
  items: NavItem[];
  tone: 'green' | 'navy';
  userName: string;
  userRole: string;
  children: ReactNode;
}) {
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-screen w-full bg-surface">
      <aside
        className={cn(
          'sticky top-0 flex h-screen w-16 shrink-0 flex-col md:w-60',
          tone === 'navy' ? 'bg-navy-dark' : 'bg-green-dark',
        )}
      >
        <div className="flex h-16 items-center justify-center gap-2 px-3 md:justify-start">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/15 font-display text-sm font-bold text-white">
            CL
          </span>
          <span className="hidden min-w-0 md:block">
            <span className="block truncate font-display text-sm font-bold text-white">
              CampoLivre
            </span>
            <span className="block text-[11px] text-white/60">LigaPro</span>
          </span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-2">
          {items.map((item) => {
            const active =
              pathname === item.to ||
              (item.to !== '/' && pathname.startsWith(item.to + '/'));
            return (
              <Link
                key={item.to}
                to={item.to}
                title={item.label}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 font-display text-sm font-medium text-white/80 transition-colors hover:bg-white/10',
                  active && 'bg-white/15 text-white',
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="hidden truncate md:block">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 border-t border-white/10 p-3">
          <Initials
            name={userName}
            tone={tone === 'navy' ? 'navy' : 'light'}
            className="h-9 w-9 text-xs"
          />
          <div className="hidden min-w-0 md:block">
            <p className="truncate font-display text-sm font-semibold text-white">
              {userName}
            </p>
            <p className="truncate text-[11px] text-white/60">{userRole}</p>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">{children}</div>
      </main>
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
  tone?: 'green' | 'navy';
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-2xl p-5 text-white',
        tone === 'navy' ? 'bg-navy-dark' : 'bg-green-dark',
      )}
    >
      <Initials
        name={name}
        tone={tone === 'navy' ? 'navy' : 'light'}
        className="h-14 w-14 text-lg"
      />
      <div className="min-w-0">
        <h2 className="truncate font-display text-lg font-bold">{name}</h2>
        <p className="truncate text-sm text-white/70">{subtitle}</p>
        <p className="mt-1 text-xs text-white/60">{meta}</p>
      </div>
    </div>
  );
}

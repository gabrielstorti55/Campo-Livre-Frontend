'use client';

import { LogOut, Menu, X } from 'lucide-react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';

import { Iniciais } from '@/components/layout/iniciais';
import { cn } from '@/utils/classes';

export type ItemNavegacao = { label: string; to: string; icon: LucideIcon };

type ShellTone = 'green' | 'navy';

const interactiveFocus =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

function isItemActive(pathname: string, to: string) {
  return pathname === to || (to !== '/' && pathname.startsWith(`${to}/`));
}

export function LayoutAreaAutenticada({
  items,
  tone,
  userName,
  userRole,
  onSignOut,
  children,
}: {
  items: ItemNavegacao[];
  tone: ShellTone;
  userName: string;
  userRole: string;
  onSignOut?: () => void;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const isNavy = tone === 'navy';
  const accentText = isNavy ? 'text-navy-dark' : 'text-green-dark';
  const activeDrawerText = isNavy ? 'text-navy-dark' : 'text-green-dark';
  const drawerOverlay = isNavy ? 'bg-navy-dark/94' : 'bg-green-dark/92';
  const drawerRingOffset = isNavy
    ? 'focus-visible:ring-offset-navy-dark'
    : 'focus-visible:ring-offset-green-dark';

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  return (
    <div className="min-h-screen w-full bg-surface text-foreground">
      <a
        href="#conteudo-principal"
        className="sr-only z-[80] rounded-md bg-white px-4 py-2 font-semibold text-foreground shadow-lg focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
      >
        Ir para o conteúdo principal
      </a>

      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 w-full max-w-[1380px] items-center gap-3 px-4 py-2 sm:px-6 lg:px-8">
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMenuOpen(true)}
            className={cn(
              'inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-semibold shadow-sm transition-[background-color,border-color,box-shadow] duration-150 hover:bg-muted hover:shadow-md',
              accentText,
              interactiveFocus,
            )}
            aria-label="Abrir menu"
            aria-expanded={menuOpen}
            aria-controls="profile-sidebar"
          >
            <Menu className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Menu</span>
          </button>

          <Link
            href={items[0]?.to ?? '/'}
            className={cn(
              'ml-1 min-h-11 rounded-lg px-2 py-2',
              interactiveFocus,
            )}
          >
            <p
              className={cn(
                'font-display text-lg font-bold tracking-[-0.025em]',
                accentText,
              )}
            >
              CampoLivre
            </p>
          </Link>

          <div className="ml-auto flex min-w-0 items-center gap-3 rounded-xl bg-card px-3 py-2 shadow-sm">
            <Iniciais
              name={userName}
              tone={isNavy ? 'navy' : 'green'}
              className="h-8 w-8 text-[11px]"
            />
            <div className="hidden min-w-0 sm:block">
              <p className="max-w-44 truncate text-sm font-semibold text-foreground">
                {userName}
              </p>
              <p className="max-w-44 truncate text-xs text-muted-foreground">
                {userRole}
              </p>
            </div>
          </div>
        </div>
      </header>

      <DialogPrimitive.Root open={menuOpen} onOpenChange={setMenuOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-[70] bg-black/45 backdrop-blur-[2px] motion-reduce:backdrop-blur-none" />
          <DialogPrimitive.Content
            id="profile-sidebar"
            className="fixed inset-y-0 left-0 z-[71] flex h-full w-[min(88vw,360px)] flex-col overflow-hidden text-white shadow-2xl outline-none"
            aria-label="Menu principal"
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              menuButtonRef.current?.focus();
            }}
          >
            <DialogPrimitive.Title className="sr-only">
              Menu principal
            </DialogPrimitive.Title>
            <img
              src="/soccer-field.jpg"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className={cn('absolute inset-0', drawerOverlay)} />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/35" />

            <div className="relative z-10 flex h-full flex-col p-4 sm:p-5">
              <div className="mb-8 flex items-start justify-between gap-4 px-1 pt-1">
                <Link
                  href={items[0]?.to ?? '/'}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <p className="font-display text-xl font-bold tracking-[-0.03em]">
                    CampoLivre
                  </p>
                  <p className="mt-1 text-xs font-semibold tracking-[0.16em] text-white/70 uppercase">
                    LigaPro
                  </p>
                </Link>

                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    'flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition-colors duration-150 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2',
                    drawerRingOffset,
                  )}
                  aria-label="Fechar menu lateral"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <nav className="space-y-1.5" aria-label="Navegação principal">
                {items.map((item) => {
                  const active = isItemActive(pathname, item.to);

                  return (
                    <Link
                      key={item.to}
                      href={item.to}
                      onClick={() => setMenuOpen(false)}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex min-h-12 items-center gap-3 rounded-xl px-3.5 text-sm font-semibold transition-[background-color,color,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white',
                        active
                          ? cn('bg-white shadow-sm', activeDrawerText)
                          : 'text-white/80 hover:bg-white/10 hover:text-white',
                      )}
                    >
                      <item.icon
                        className="h-[18px] w-[18px] shrink-0"
                        aria-hidden="true"
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-auto rounded-2xl border border-white/15 bg-black/20 p-3 backdrop-blur-sm motion-reduce:backdrop-blur-none">
                <div className="flex items-center gap-3 rounded-xl px-2 py-2">
                  <Iniciais
                    name={userName}
                    tone={isNavy ? 'navy' : 'light'}
                    className="h-10 w-10 text-xs"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {userName}
                    </p>
                    <p className="truncate text-xs text-white/75">{userRole}</p>
                  </div>
                </div>
                {onSignOut ? (
                  <button
                    type="button"
                    onClick={onSignOut}
                    className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/20 px-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Sair da conta
                  </button>
                ) : null}
              </div>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      <main id="conteudo-principal" tabIndex={-1} className="outline-none">
        <div className="mx-auto w-full max-w-[1380px] space-y-10 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}

export function CabecalhoPerfil({
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
  const isNavy = tone === 'navy';

  return (
    <header
      className={cn(
        'mb-2 overflow-hidden rounded-3xl text-white shadow-sm',
        isNavy ? 'bg-navy-dark' : 'bg-green-dark',
      )}
    >
      <div className="relative px-5 py-7 sm:px-8 sm:py-9 lg:px-10">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10" />
        <div className="relative flex items-end justify-between gap-5">
          <div className="min-w-0">
            <p className="mb-2 text-xs font-semibold tracking-[0.16em] text-white/75 uppercase">
              Visão geral
            </p>
            <h1 className="text-balance font-display text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              {name}
            </h1>
            <p className="mt-2 text-sm text-white/80 sm:text-base">
              {subtitle}
            </p>
            <p className="mt-2 text-xs text-white/70">{meta}</p>
          </div>
          <Iniciais
            name={name}
            tone={isNavy ? 'navy' : 'light'}
            className="hidden h-12 w-12 text-sm sm:flex"
          />
        </div>
      </div>
    </header>
  );
}

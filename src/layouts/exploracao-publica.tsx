'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import {
  CalendarDays,
  Home,
  LogIn,
  Menu,
  Trophy,
  User,
  UserRoundSearch,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef, useState, type ReactNode } from 'react';

import { obterInicioSessao } from '@/services/autenticacao/navegacao-sessao';
import { useSessao } from '@/hooks/use-sessao';
import { cn } from '@/utils/classes';

const navigationItems = [
  { label: 'Inicio', to: '/', icon: Home },
  { label: 'Campeonatos', to: '/campeonatos', icon: Trophy },
  { label: 'Times', to: '/times', icon: Users },
  { label: 'Partidas', to: '/partidas', icon: CalendarDays },
  { label: 'Atletas', to: '/atletas', icon: UserRoundSearch },
] as const;

const interactiveFocus =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

function ExploreNavigation({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1" aria-label="Navegação pública">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.to ||
          (item.to !== '/' && pathname.startsWith(`${item.to}/`));

        return (
          <Link
            key={item.to}
            href={item.to}
            {...(onNavigate ? { onClick: onNavigate } : {})}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex min-h-12 items-center gap-3 rounded-md border border-transparent px-3.5 text-sm font-semibold transition-[background-color,color,border-color] duration-150',
              interactiveFocus,
              isActive
                ? 'border-accent bg-accent text-accent-foreground'
                : 'text-white/80 hover:border-white/15 hover:bg-white/8 hover:text-white',
            )}
          >
            <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function LayoutExploracao({ children }: { children: ReactNode }) {
  const { session } = useSessao();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenuRef = useRef<HTMLButtonElement>(null);
  const accountHome = session ? obterInicioSessao(session) : null;

  return (
    <DialogPrimitive.Root open={menuOpen} onOpenChange={setMenuOpen}>
      <div className="identidade-publica campo-canvas min-h-screen text-foreground">
        <a
          href="#conteudo-publico"
          className="sr-only z-[80] rounded-md bg-white px-4 py-2 font-semibold text-green-dark shadow-lg focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
        >
          Ir para o conteúdo público
        </a>

        <header className="sticky top-0 z-40 border-b-2 border-green-dark bg-background">
          <div className="mx-auto flex min-h-[4.5rem] w-full max-w-[1380px] items-center gap-3 px-4 py-2 sm:px-6 lg:px-8">
            <DialogPrimitive.Trigger asChild>
              <button
                type="button"
                className={cn(
                  'inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-md border border-green-dark bg-transparent px-3 text-sm font-semibold text-green-dark transition-colors duration-150 hover:bg-green-dark hover:text-white',
                  interactiveFocus,
                )}
                aria-label="Abrir menu público"
                aria-controls="public-sidebar"
              >
                <Menu className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Menu</span>
              </button>
            </DialogPrimitive.Trigger>

            <Link
              href="/"
              className={cn(
                'ml-1 min-h-11 rounded-sm px-2 py-1.5',
                interactiveFocus,
              )}
            >
              <p className="font-display text-2xl leading-none font-extrabold tracking-[0.015em] text-green-dark uppercase">
                CampoLivre
              </p>
              <p className="mt-0.5 text-[0.6rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                Futebol local, jogo aberto
              </p>
            </Link>

            <div className="ml-auto flex items-center gap-2">
              {accountHome ? (
                <Link
                  href={accountHome}
                  className={cn(
                    'inline-flex min-h-11 items-center rounded-md bg-green-dark px-4 text-sm font-semibold text-white transition-colors duration-150 hover:bg-navy-dark',
                    interactiveFocus,
                  )}
                >
                  Minha área
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className={cn(
                      'hidden min-h-11 items-center rounded-md px-4 text-sm font-semibold text-green-dark transition-colors duration-150 hover:bg-green-pale sm:inline-flex',
                      interactiveFocus,
                    )}
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/cadastro"
                    className={cn(
                      'inline-flex min-h-11 items-center rounded-md bg-green-dark px-4 text-sm font-semibold text-white transition-colors duration-150 hover:bg-navy-dark',
                      interactiveFocus,
                    )}
                  >
                    Criar conta
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>

        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-[70] bg-black/45 backdrop-blur-[2px] motion-reduce:backdrop-blur-none" />
          <DialogPrimitive.Content
            id="public-sidebar"
            className="identidade-publica campo-lines fixed inset-y-0 left-0 z-[71] flex h-full w-[min(88vw,360px)] flex-col overflow-hidden bg-navy-dark text-white shadow-2xl focus:outline-none"
            aria-describedby={undefined}
            onOpenAutoFocus={(event) => {
              event.preventDefault();
              closeMenuRef.current?.focus();
            }}
          >
            <DialogPrimitive.Title className="sr-only">
              Menu público
            </DialogPrimitive.Title>
            <div className="relative z-10 flex h-full flex-col p-4 sm:p-5">
              <div className="mb-8 flex items-start justify-between gap-4 px-1 pt-1">
                <Link
                  href="/"
                  onClick={() => setMenuOpen(false)}
                  className={cn('rounded-lg px-1 py-1', interactiveFocus)}
                >
                  <p className="font-display text-2xl font-extrabold tracking-[0.02em] uppercase">
                    CampoLivre
                  </p>
                  <p className="mt-1 text-[0.65rem] font-semibold tracking-[0.18em] text-white/65 uppercase">
                    Futebol local, jogo aberto
                  </p>
                </Link>

                <DialogPrimitive.Close asChild>
                  <button
                    ref={closeMenuRef}
                    type="button"
                    className={cn(
                      'flex min-h-11 min-w-11 items-center justify-center rounded-md border border-white/20 bg-white/8 text-white transition-colors duration-150 hover:bg-white/15',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-green-dark',
                    )}
                    aria-label="Fechar menu lateral"
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                </DialogPrimitive.Close>
              </div>

              <ExploreNavigation onNavigate={() => setMenuOpen(false)} />

              <div className="mt-auto border-t border-white/20 pt-4">
                {accountHome ? (
                  <>
                    <p className="px-2 pb-2 text-xs leading-5 text-white/75">
                      Continue consultando ou volte para as ações da sua conta.
                    </p>
                    <Link
                      href={accountHome}
                      onClick={() => setMenuOpen(false)}
                      className="flex min-h-12 items-center gap-3 rounded-md bg-accent px-3 text-sm font-semibold text-accent-foreground transition-colors duration-150 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      <User className="h-4 w-4" aria-hidden="true" /> Minha área
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="px-2 pb-2 text-xs leading-5 text-white/75">
                      Navegue sem cadastro. Entre apenas quando precisar
                      realizar uma ação pessoal.
                    </p>
                    <Link
                      href="/login"
                      onClick={() => setMenuOpen(false)}
                      className="flex min-h-12 items-center gap-3 rounded-md px-3 text-sm font-semibold text-white/85 transition-colors duration-150 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      <LogIn className="h-4 w-4" aria-hidden="true" /> Entrar
                    </Link>
                    <Link
                      href="/cadastro"
                      onClick={() => setMenuOpen(false)}
                      className="mt-1 flex min-h-12 items-center gap-3 rounded-md bg-accent px-3 text-sm font-semibold text-accent-foreground transition-colors duration-150 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      <UserPlus className="h-4 w-4" aria-hidden="true" /> Criar
                      conta
                    </Link>
                  </>
                )}
              </div>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>

        <main
          id="conteudo-publico"
          className="min-h-[calc(100vh-4.5rem)] bg-background"
        >
          {children}
        </main>
      </div>
    </DialogPrimitive.Root>
  );
}

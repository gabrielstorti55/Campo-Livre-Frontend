'use client';

import {
  MapPin,
  Search,
  ShieldCheck,
  Trophy,
  UserRound,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { useSession } from '@/features/auth/session/session-context';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function MinhaAreaPage() {
  const { session, hydrated } = useSession();

  if (!hydrated) {
    return (
      <p
        className="px-4 py-10 text-center text-sm text-muted-foreground"
        role="status"
      >
        Carregando sua conta...
      </p>
    );
  }

  if (!session) redirect('/login');

  const hasTeam = session.links.teamIds.length > 0;
  const organizesChampionship =
    session.links.organizedChampionshipIds.length > 0;
  const city = session.account.city || 'Cidade não informada';

  return (
    <div className="mx-auto w-full max-w-[1180px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <section className="overflow-hidden rounded-[28px] border border-green-light/60 bg-gradient-to-br from-green-pale via-white to-white p-6 shadow-[0_18px_50px_rgba(20,63,45,0.09)] sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-4 sm:gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-green-dark font-display text-lg font-bold text-white shadow-lg sm:h-20 sm:w-20 sm:text-xl">
              {getInitials(session.account.name) || (
                <UserRound className="h-8 w-8" aria-hidden="true" />
              )}
            </div>

            <div className="min-w-0">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold tracking-[0.08em] text-green-dark uppercase shadow-sm">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                Conta pessoal
              </div>
              <h1 className="truncate font-display text-3xl font-semibold tracking-[-0.035em] text-green-dark sm:text-4xl">
                {session.account.name}
              </h1>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground sm:text-base">
                <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                {city}
              </p>
            </div>
          </div>

          <div className="max-w-md rounded-2xl border border-white/80 bg-white/70 px-4 py-3 text-sm leading-6 text-muted-foreground shadow-sm backdrop-blur-sm">
            Este é o perfil da conta criada. Times, campeonatos e outras
            capacidades aparecem conforme seus vínculos no CampoLivre.
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Card className="rounded-[24px] border-border/70 shadow-[0_8px_28px_rgba(30,54,43,0.06)]">
          <CardHeader>
            <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-green-pale text-green-dark">
              <Users className="h-5 w-5" aria-hidden="true" />
            </div>
            <CardTitle className="font-display text-xl text-green-dark">
              {hasTeam
                ? 'Seus times'
                : 'Você ainda não participa de nenhum time'}
            </CardTitle>
            <CardDescription className="leading-6">
              {hasTeam
                ? 'Acompanhe os times vinculados à sua conta.'
                : 'Entre em uma equipe existente ou crie seu próprio time para começar a participar.'}
            </CardDescription>
          </CardHeader>
          {!hasTeam ? (
            <CardContent className="flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="campo" tone="green">
                <Link href="/times">
                  <Search aria-hidden="true" /> Entrar em um time
                </Link>
              </Button>
              <Button asChild variant="campoOutline" tone="green">
                <Link href="/times/criar">Criar um time</Link>
              </Button>
            </CardContent>
          ) : null}
        </Card>

        <Card className="rounded-[24px] border-border/70 shadow-[0_8px_28px_rgba(30,54,43,0.06)]">
          <CardHeader>
            <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
              <Trophy className="h-5 w-5" aria-hidden="true" />
            </div>
            <CardTitle className="font-display text-xl text-green-dark">
              {organizesChampionship
                ? 'Campeonatos que você organiza'
                : 'Nenhum campeonato organizado'}
            </CardTitle>
            <CardDescription className="leading-6">
              {organizesChampionship
                ? 'Continue a gestão dos campeonatos vinculados à sua conta.'
                : 'Você ainda não organiza campeonatos, mas pode consultar competições, partidas e classificações.'}
            </CardDescription>
          </CardHeader>
          {!organizesChampionship ? (
            <CardContent>
              <Button asChild variant="campoOutline" tone="green">
                <Link href="/campeonatos">Explorar campeonatos</Link>
              </Button>
            </CardContent>
          ) : null}
        </Card>
      </div>

      <p className="mt-6 rounded-2xl border border-border/70 bg-card px-5 py-4 text-sm leading-6 text-muted-foreground">
        Novas áreas aparecem somente quando sua conta ganha um vínculo com um
        time ou campeonato. Nenhum papel é atribuído automaticamente.
      </p>
    </div>
  );
}

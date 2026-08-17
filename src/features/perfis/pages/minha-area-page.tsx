import { Search, ShieldCheck, Trophy, UserRound, Users } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';

import { useSession } from '@/features/auth/session/session-context';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

export function MinhaAreaPage() {
  const { session } = useSession();

  if (!session) return <Navigate to="/login" replace />;

  const hasTeam = session.links.teamIds.length > 0;
  const organizesChampionship =
    session.links.organizedChampionshipIds.length > 0;

  return (
    <div className="mx-auto w-full max-w-[1180px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <section className="overflow-hidden rounded-[28px] border border-green-light/60 bg-gradient-to-br from-green-pale via-white to-white p-6 shadow-[0_18px_50px_rgba(20,63,45,0.09)] sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold tracking-[0.08em] text-green-dark uppercase shadow-sm">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Conta pessoal
            </div>
            <h1 className="font-display text-3xl font-semibold tracking-[-0.035em] text-green-dark sm:text-4xl">
              Sua conta está pronta
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              Olá, {session.account.name}. Você pode acompanhar o esporte da
              cidade agora e escolher como quer começar a participar.
            </p>
          </div>

          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-green-dark text-white shadow-lg">
            <UserRound className="h-9 w-9" aria-hidden="true" />
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
                : 'Explore os times existentes ou crie um para começar sua jornada no CampoLivre.'}
            </CardDescription>
          </CardHeader>
          {!hasTeam ? (
            <CardContent className="flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="campo" tone="green">
                <Link to="/times">
                  <Search aria-hidden="true" /> Explorar times
                </Link>
              </Button>
              <Button asChild variant="campoOutline" tone="green">
                <Link to="/times/criar">Criar um time</Link>
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
                <Link to="/campeonatos">Explorar campeonatos</Link>
              </Button>
            </CardContent>
          ) : null}
        </Card>
      </div>

      <p className="mt-6 rounded-2xl border border-border/70 bg-card px-5 py-4 text-sm leading-6 text-muted-foreground">
        Novas áreas aparecem somente quando sua conta ganha um vínculo com um
        time ou campeonato. Nenhum papel foi atribuído automaticamente.
      </p>
    </div>
  );
}

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
import { redirect, useRouter } from 'next/navigation';
import { useState } from 'react';

import { useSessao } from '@/hooks/use-sessao';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function TelaMinhaArea() {
  const { session, hydrated, enableOrganizer, switchContext } = useSessao();
  const router = useRouter();
  const [activationOpen, setActivationOpen] = useState(false);
  const [ativando, setAtivando] = useState(false);
  const [erroAtivacao, setErroAtivacao] = useState('');

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
  const organizerEnabled = session.capabilities.includes('organizador');
  const prefeituraVinculada = session.capabilities.includes('prefeitura');
  const isAdministrator = session.minhaConta.administrador;
  const city = session.account.city || 'Cidade não informada';

  function escolherContexto(
    context: 'atleta' | 'organizador' | 'prefeitura',
    destino: string,
  ) {
    switchContext(context);
    router.push(destino);
  }

  return (
    <div className="mx-auto w-full max-w-[1180px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <section className="campo-lines overflow-hidden border-y-2 border-green-dark bg-green-dark p-6 text-white sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-4 sm:gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-green-dark font-display text-lg font-bold text-white shadow-none sm:h-20 sm:w-20 sm:text-xl">
              {getInitials(session.account.name) || (
                <UserRound className="h-8 w-8" aria-hidden="true" />
              )}
            </div>

            <div className="min-w-0">
              <div className="mb-2 inline-flex items-center gap-2 border-l-2 border-accent pl-3 text-xs font-semibold tracking-[0.08em] text-white/80 uppercase">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                Conta pessoal
              </div>
              <h1 className="truncate font-display text-4xl leading-none font-bold tracking-[0.01em] text-white uppercase sm:text-5xl">
                {session.account.name}
              </h1>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-white/75 sm:text-base">
                <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                {city}
              </p>
            </div>
          </div>

          <div className="max-w-md border-l border-white/25 px-4 py-3 text-sm leading-6 text-white/75">
            Este é o perfil da conta criada. Times, campeonatos e outras
            capacidades aparecem conforme seus vínculos no CampoLivre.
            <Link
              href="/minha-conta"
              className="mt-3 block font-semibold text-white underline underline-offset-4"
            >
              Consultar dados da conta
            </Link>
            {!prefeituraVinculada && !organizerEnabled ? (
              <Link
                href="/minha-conta/convites-prefeitura"
                className="mt-2 block font-semibold text-white underline underline-offset-4"
              >
                Consultar convites de Prefeitura
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {!prefeituraVinculada ? (
          <Card className="rounded-md border-border/70 border-t-2 border-t-green-dark">
          <CardHeader>
            <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-md bg-green-pale text-green-dark">
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
          {hasTeam ? (
            <CardContent>
              <Button asChild variant="campo" tone="green">
                <Link href="/atleta/inicio">Abrir área esportiva</Link>
              </Button>
            </CardContent>
          ) : (
            <CardContent className="flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="campo" tone="green">
                <Link href="/atleta/time/buscar">
                  <Search aria-hidden="true" /> Entrar em um time
                </Link>
              </Button>
              <Button asChild variant="campoOutline" tone="green">
                <Link href="/atleta/time/criar">Criar um time</Link>
              </Button>
            </CardContent>
          )}
          </Card>
        ) : null}

        <Card className="rounded-md border-border/70 border-t-2 border-t-green-dark">
          <CardHeader>
            <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-md bg-amber-100 text-amber-800">
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
            <CardContent className="flex flex-wrap gap-3">
              {organizerEnabled ? (
                <Button asChild variant="campo" tone="green">
                  <Link href="/organizador/novo">Criar campeonato</Link>
                </Button>
              ) : (
                <Button
                  variant="campo"
                  tone="green"
                  onClick={() => {
                    setErroAtivacao('');
                    setActivationOpen(true);
                  }}
                >
                  Ativar painel de organizador
                </Button>
              )}
              <Button asChild variant="campoOutline" tone="green">
                <Link href="/campeonatos">Explorar campeonatos</Link>
              </Button>
            </CardContent>
          ) : null}
        </Card>
      </div>

      {session.capabilities.length > 0 ? (
        <section
          className="mt-6 border-y border-border bg-card px-5 py-5"
          aria-labelledby="escolher-contexto"
        >
          <h2
            id="escolher-contexto"
            className="font-display text-xl font-semibold text-green-dark"
          >
            Escolher contexto
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            A navegação permanece neste contexto até você escolher outra área.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {session.capabilities.includes('atleta') ? (
              <Button
                variant="campoOutline"
                tone="green"
                onClick={() => escolherContexto('atleta', '/atleta/inicio')}
              >
                Área esportiva
              </Button>
            ) : null}
            {session.capabilities.includes('organizador') ? (
              <Button
                variant="campo"
                tone="green"
                onClick={() =>
                  escolherContexto('organizador', '/organizador/inicio')
                }
              >
                Área do organizador
              </Button>
            ) : null}
            {session.capabilities.includes('prefeitura') ? (
              <Button
                variant="campoOutline"
                tone="navy"
                onClick={() =>
                  escolherContexto('prefeitura', '/prefeitura/painel')
                }
              >
                Área da Prefeitura
              </Button>
            ) : null}
          </div>
        </section>
      ) : null}

      {isAdministrator ? (
        <div className="mt-6 border-y border-border bg-card px-5 py-4">
          <p className="font-display text-lg font-semibold text-green-dark">
            Administração Global
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie contas e autoridades administrativas do CampoLivre.
          </p>
          <Button asChild className="mt-3" tone="navy">
            <Link href="/administracao/administradores">
              Abrir Administração Global
            </Link>
          </Button>
        </div>
      ) : null}

      <p className="mt-6 rounded-md border border-border/70 bg-card px-5 py-4 text-sm leading-6 text-muted-foreground">
        Novas áreas aparecem somente quando sua conta ganha um vínculo com um
        time ou campeonato. Nenhum papel é atribuído automaticamente.
      </p>

      <Dialog open={activationOpen} onOpenChange={setActivationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ativar painel de organizador</DialogTitle>
            <DialogDescription>
              Você poderá criar e administrar campeonatos conforme seus
              vínculos. A ativação não concede acesso a campeonatos de terceiros
              nem cria autoridade global. Esta habilitação não pode ser desfeita
              no MVP.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md bg-muted p-4 text-sm text-muted-foreground">
            Cada campeonato terá exatamente um responsável ativo. Operações em
            nome de Prefeitura exigirão vínculo institucional próprio.
          </div>
          {erroAtivacao ? (
            <p role="alert" className="text-sm text-danger">
              {erroAtivacao}
            </p>
          ) : null}
          <DialogFooter>
            <Button
              variant="campoOutline"
              disabled={ativando}
              onClick={() => setActivationOpen(false)}
            >
              Agora não
            </Button>
            <Button
              variant="campo"
              disabled={ativando}
              onClick={async () => {
                setAtivando(true);
                setErroAtivacao('');
                try {
                  await enableOrganizer();
                  setActivationOpen(false);
                  router.push('/organizador/inicio');
                } catch {
                  setErroAtivacao(
                    'Não foi possível ativar o painel. Confirme que sua conta está ativa e o e-mail foi validado.',
                  );
                } finally {
                  setAtivando(false);
                }
              }}
            >
              {ativando ? 'Ativando...' : 'Confirmar ativação do painel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

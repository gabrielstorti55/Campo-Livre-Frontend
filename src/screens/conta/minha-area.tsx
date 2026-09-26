'use client';

import {
  ArrowRight,
  CheckCircle2,
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
  const organizerEnabled = session.capabilities.includes('organizador');
  const prefeituraVinculada = session.capabilities.includes('prefeitura');
  const isAdministrator = session.minhaConta.administrador;
  const city = session.account.city || 'Cidade não informada';
  const contextoAtivo = session.activeContext;
  const colunasContexto =
    session.capabilities.length >= 3
      ? 'md:grid-cols-3'
      : session.capabilities.length === 2
        ? 'md:grid-cols-2'
        : 'md:grid-cols-1';

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
          </div>
        </div>
      </section>

      {(!prefeituraVinculada && !hasTeam) || !organizerEnabled ? (
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {!prefeituraVinculada && !hasTeam ? (
            <Card className="rounded-md border-border/70 border-t-2 border-t-green-dark">
              <CardHeader>
                <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-md bg-green-pale text-green-dark">
                  <Users className="h-5 w-5" aria-hidden="true" />
                </div>
                <CardTitle className="font-display text-xl text-green-dark">
                  Você ainda não participa de nenhum time
                </CardTitle>
                <CardDescription className="leading-6">
                  Entre em uma equipe existente ou crie seu próprio time para
                  liberar a área de atleta.
                </CardDescription>
              </CardHeader>
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
            </Card>
          ) : null}

          {!organizerEnabled ? (
            <Card className="rounded-md border-border/70 border-t-2 border-t-green-dark">
              <CardHeader>
                <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-md bg-amber-100 text-amber-800">
                  <Trophy className="h-5 w-5" aria-hidden="true" />
                </div>
                <CardTitle className="font-display text-xl text-green-dark">
                  Ative a área de organizador
                </CardTitle>
                <CardDescription className="leading-6">
                  Habilite esse contexto para criar e administrar seus próprios
                  campeonatos.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
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
                <Button asChild variant="campoOutline" tone="green">
                  <Link href="/campeonatos">Explorar campeonatos</Link>
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </div>
      ) : null}

      {session.capabilities.length > 0 ? (
        <section
          className="mt-6 border-y-2 border-green-dark bg-card"
          aria-labelledby="escolher-contexto"
        >
          <div className="border-b border-border bg-green-dark px-5 py-5 text-white sm:flex sm:items-end sm:justify-between sm:gap-6">
            <div>
              <p className="text-xs font-semibold tracking-[0.12em] text-accent uppercase">
                Uma conta, diferentes atuações
              </p>
              <h2
                id="escolher-contexto"
                className="mt-1 font-display text-2xl font-semibold uppercase"
              >
                Escolha como deseja acessar o CampoLivre
              </h2>
            </div>
            <p className="mt-3 max-w-md text-sm leading-6 text-white/75 sm:mt-0 sm:text-right">
              A troca altera apenas a área de trabalho e as permissões exibidas.
              Sua conta e seus vínculos permanecem os mesmos.
            </p>
          </div>

          <div className={`grid gap-px bg-border ${colunasContexto}`}>
            {session.capabilities.includes('atleta') ? (
              <article
                className="flex min-h-60 flex-col bg-card p-5"
                aria-label="Contexto de atleta"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center bg-green-pale text-green-dark">
                    <UserRound className="h-5 w-5" aria-hidden="true" />
                  </div>
                  {contextoAtivo === 'atleta' ? (
                    <span className="inline-flex items-center gap-1 bg-green-pale px-2 py-1 text-xs font-semibold text-green-dark">
                      <CheckCircle2
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                      Contexto ativo
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold text-green-dark">
                  Atleta
                </h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">
                  Acompanhe seus times, convites, partidas e campeonatos como
                  participante.
                </p>
                <Button
                  className="mt-5 w-full justify-between"
                  variant={
                    contextoAtivo === 'atleta' ? 'campoOutline' : 'campo'
                  }
                  tone="green"
                  disabled={contextoAtivo === 'atleta'}
                  onClick={() =>
                    escolherContexto('atleta', '/atleta/time/buscar')
                  }
                >
                  {contextoAtivo === 'atleta'
                    ? 'Você está nesta área'
                    : 'Entrar como atleta'}
                  {contextoAtivo !== 'atleta' ? (
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  ) : null}
                </Button>
              </article>
            ) : null}
            {session.capabilities.includes('organizador') ? (
              <article
                className="flex min-h-60 flex-col bg-card p-5"
                aria-label="Contexto de organizador"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center bg-amber-100 text-amber-800">
                    <Trophy className="h-5 w-5" aria-hidden="true" />
                  </div>
                  {contextoAtivo === 'organizador' ? (
                    <span className="inline-flex items-center gap-1 bg-green-pale px-2 py-1 text-xs font-semibold text-green-dark">
                      <CheckCircle2
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                      Contexto ativo
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold text-green-dark">
                  Organizador
                </h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">
                  Crie e administre campeonatos, participantes, partidas e
                  Súmulas.
                </p>
                <Button
                  className="mt-5 w-full justify-between"
                  variant={
                    contextoAtivo === 'organizador' ? 'campoOutline' : 'campo'
                  }
                  tone="green"
                  disabled={contextoAtivo === 'organizador'}
                  onClick={() =>
                    escolherContexto('organizador', '/organizador/campeonatos')
                  }
                >
                  {contextoAtivo === 'organizador'
                    ? 'Você está nesta área'
                    : 'Entrar como organizador'}
                  {contextoAtivo !== 'organizador' ? (
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  ) : null}
                </Button>
              </article>
            ) : null}
            {session.capabilities.includes('prefeitura') ? (
              <article
                className="flex min-h-60 flex-col bg-card p-5"
                aria-label="Contexto de Prefeitura"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center bg-blue-100 text-blue-900">
                    <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                  </div>
                  {contextoAtivo === 'prefeitura' ? (
                    <span className="inline-flex items-center gap-1 bg-green-pale px-2 py-1 text-xs font-semibold text-green-dark">
                      <CheckCircle2
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                      Contexto ativo
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold text-green-dark">
                  Prefeitura
                </h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">
                  Acesse os recursos institucionais vinculados ao município.
                </p>
                <Button
                  className="mt-5 w-full justify-between"
                  variant={
                    contextoAtivo === 'prefeitura' ? 'campoOutline' : 'campo'
                  }
                  tone="navy"
                  disabled={contextoAtivo === 'prefeitura'}
                  onClick={() =>
                    escolherContexto('prefeitura', '/prefeitura/painel')
                  }
                >
                  {contextoAtivo === 'prefeitura'
                    ? 'Você está nesta área'
                    : 'Entrar como Prefeitura'}
                  {contextoAtivo !== 'prefeitura' ? (
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  ) : null}
                </Button>
              </article>
            ) : null}
          </div>

          <p className="border-t border-border bg-muted/40 px-5 py-3 text-xs leading-5 text-muted-foreground">
            O contexto escolhido permanece ativo até uma nova troca explícita.
            Abrir páginas públicas não altera essa seleção.
          </p>
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
                  switchContext('organizador');
                  setActivationOpen(false);
                  router.push('/organizador/campeonatos');
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

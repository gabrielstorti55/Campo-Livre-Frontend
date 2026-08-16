import { CalendarDays, Trophy, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const publicAreas = [
  {
    title: 'Campeonatos',
    description: 'Consulte competições, classificações e informações públicas.',
    icon: Trophy,
  },
  {
    title: 'Times',
    description:
      'Acompanhe times e os dados que estiverem disponíveis ao público.',
    icon: Users,
  },
  {
    title: 'Partidas',
    description: 'Veja agenda, placares e resultados publicados.',
    icon: CalendarDays,
  },
] as const;

// TODO(product): esta landing é provisória e será refinada em uma tarefa própria.
export function PublicHomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link
            to="/"
            className="font-display text-xl font-semibold tracking-[-0.02em] text-green-dark"
          >
            CampoLivre
          </Link>

          <nav className="flex items-center gap-2" aria-label="Acesso à conta">
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
          </nav>
        </div>
      </header>

      <section className="border-b border-border bg-green-pale/40">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <p className="text-xs font-semibold tracking-[0.14em] text-green-dark uppercase">
            Esporte amador da sua região
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl">
            Acompanhe o CampoLivre sem precisar criar uma conta.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Navegue pelo conteúdo público. Login ou cadastro só serão necessários
            quando uma ação depender da sua identidade.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="mb-7">
          <h2 className="font-display text-2xl font-semibold tracking-[-0.025em]">
            Explore o conteúdo público
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            A exposição de dados pessoais e informações sensíveis continuará
            dependendo das regras de privacidade definidas pelo produto e pela API.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {publicAreas.map((area) => {
            const Icon = area.icon;

            return (
              <article
                key={area.title}
                className="rounded-xl border border-border bg-white p-6 shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-pale text-green-dark">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold">
                  {area.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {area.description}
                </p>
              </article>
            );
          })}
        </div>

        <div className="mt-10 rounded-xl border border-border bg-white p-6 sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div>
            <h2 className="font-display text-xl font-semibold">
              Quer participar ou realizar uma ação no CampoLivre?
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Crie uma conta pessoal. Atleta, capitão e organizador não são
              escolhidos como um perfil global no cadastro.
            </p>
          </div>

          <div className="mt-5 flex shrink-0 gap-3 sm:mt-0">
            <Link
              to="/login"
              className="rounded-md border border-green-dark px-4 py-2.5 text-sm font-semibold text-green-dark"
            >
              Entrar
            </Link>
            <Link
              to="/cadastro"
              className="rounded-md bg-green-dark px-4 py-2.5 text-sm font-semibold text-white"
            >
              Criar conta
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

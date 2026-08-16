import { ArrowRight, CalendarDays, Trophy, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

import { campeonatos, partidas, times } from '@/mocks/data';

const publicAreas = [
  {
    title: 'Campeonatos',
    description: 'Classificações, formato, situação e resultados.',
    icon: Trophy,
    to: '/campeonatos',
  },
  {
    title: 'Times',
    description: 'Clubes participantes e informações públicas.',
    icon: Users,
    to: '/times',
  },
  {
    title: 'Partidas',
    description: 'Agenda, locais e placares já publicados.',
    icon: CalendarDays,
    to: '/partidas',
  },
] as const;

export function PublicHomePage() {
  const jogosConcluidos = partidas.filter((partida) => partida.concluida).length;

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-6 sm:px-8 sm:py-10 lg:px-10">
      <section className="overflow-hidden rounded-[28px] bg-green-dark text-white shadow-sm">
        <div className="grid min-h-[360px] gap-8 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:px-14">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.18em] text-white/55 uppercase">
              CampoLivre · LigaPro
            </p>
            <h1 className="mt-4 font-display text-4xl leading-[1.05] font-semibold tracking-[-0.045em] text-balance sm:text-5xl lg:text-[3.6rem]">
              O futebol da sua cidade, sem barreira para acompanhar.
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-6 text-white/70 sm:text-base sm:leading-7">
              Veja campeonatos, times, jogos e resultados sem precisar entrar na sua conta.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/campeonatos"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-green-dark transition-transform hover:-translate-y-0.5"
              >
                Explorar campeonatos <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex h-11 items-center rounded-xl border border-white/20 px-5 text-sm font-semibold text-white hover:bg-white/10"
              >
                Entrar na minha conta
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-black/10 p-2 backdrop-blur-sm sm:gap-3 sm:p-3">
            {[
              ['Campeonatos', campeonatos.length],
              ['Times', times.length],
              ['Resultados', jogosConcluidos],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-white/8 px-3 py-4 sm:px-4">
                <p className="font-display text-2xl font-semibold sm:text-3xl">{value}</p>
                <p className="mt-1 text-[11px] text-white/55 sm:text-xs">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.15em] text-green-dark uppercase">
              Navegação pública
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
              O que você quer acompanhar?
            </h2>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {publicAreas.map((area) => {
            const Icon = area.icon;
            return (
              <Link
                key={area.to}
                to={area.to}
                className="group flex min-h-44 flex-col justify-between rounded-2xl border border-border/80 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all hover:-translate-y-0.5 hover:border-green-light hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-pale text-green-dark">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-display text-lg font-semibold">{area.title}</h3>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-green-dark" />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{area.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

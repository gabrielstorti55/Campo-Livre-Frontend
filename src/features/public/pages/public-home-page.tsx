import { ArrowUpRight, CalendarDays, Trophy, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const publicAreas = [
  {
    title: 'Campeonatos',
    description: 'Classificações, formatos, cidades e resultados publicados.',
    icon: Trophy,
    to: '/campeonatos',
  },
  {
    title: 'Times',
    description: 'Informações públicas das equipes sem expor dados pessoais.',
    icon: Users,
    to: '/times',
  },
  {
    title: 'Partidas',
    description: 'Agenda, locais e placares para acompanhar o jogo.',
    icon: CalendarDays,
    to: '/partidas',
  },
] as const;

export function PublicHomePage() {
  return (
    <div className="mx-auto w-full max-w-[1480px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <section className="relative overflow-hidden rounded-[32px] bg-green-dark text-white shadow-[0_24px_70px_rgba(20,63,45,0.18)]">
        <img
          src="./public/soccer-field.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-green-dark via-green-dark/95 to-green-dark/65" />

        <div className="relative grid min-h-[440px] items-end gap-8 px-5 py-8 sm:px-8 sm:py-10 lg:grid-cols-[1.15fr_0.85fr] lg:px-12 lg:py-12">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.18em] text-white/62 uppercase">
              CampoLivre LigaPro
            </p>
            <h1 className="mt-3 font-display text-4xl leading-[1.02] font-semibold tracking-[-0.045em] text-balance sm:text-5xl lg:text-6xl">
              O esporte da cidade, aberto para quem quer acompanhar.
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/70 sm:text-base lg:text-lg">
              Consulte campeonatos, times e partidas sem criar conta. Entre apenas quando precisar participar ou administrar algo.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/campeonatos"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-green-dark shadow-sm transition hover:-translate-y-px"
              >
                Explorar campeonatos
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center rounded-xl border border-white/16 bg-white/8 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/12"
              >
                Entrar na minha conta
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {publicAreas.map((area) => {
              const Icon = area.icon;
              return (
                <Link
                  key={area.title}
                  to={area.to}
                  className="group flex items-center gap-4 rounded-2xl border border-white/12 bg-black/15 p-4 backdrop-blur-md transition hover:bg-white/10"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-display font-semibold">{area.title}</p>
                    <p className="mt-0.5 text-xs leading-5 text-white/58">{area.description}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-white/45 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-4 py-6 sm:grid-cols-3 sm:py-8">
        {[
          ['Navegação livre', 'Sem cadastro para consultar o que é público.'],
          ['Dados protegidos', 'Informações pessoais continuam fora da área pública.'],
          ['Links diretos', 'Compartilhe campeonatos, times e partidas por URL.'],
        ].map(([title, description]) => (
          <div key={title} className="rounded-2xl bg-white p-5 shadow-[0_10px_30px_rgba(30,54,43,0.05)]">
            <p className="font-display text-base font-semibold tracking-[-0.02em]">{title}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

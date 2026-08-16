import { ArrowUpRight, CalendarDays, Clock, MapPin } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { PublicPageHeader } from '@/features/public/components/public-page-header';
import { PublicState } from '@/features/public/components/public-state';
import { partidas, times } from '@/mocks/data';
import { cn } from '@/shared/lib/utils';

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

function getTimeIdByName(name: string) {
  return times.find((time) => time.nome === name)?.id;
}

function MatchCard({ partida }: { partida: (typeof partidas)[number] }) {
  return (
    <Link
      to={`/partidas/${partida.id}`}
      className={cn(
        'group block rounded-[24px] border border-border/70 bg-card p-5 shadow-[0_10px_30px_rgba(30,54,43,0.06)] transition-[border-color,box-shadow] duration-150 hover:border-green-light hover:shadow-[0_14px_36px_rgba(30,54,43,0.10)] sm:p-6',
        focusRing,
      )}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="rounded-full bg-muted px-3 py-1.5 font-semibold tracking-[0.1em] uppercase">
          {partida.rodada}
        </span>
        <span>{partida.data} · {partida.hora}</span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-5">
        <p className="font-display text-base font-semibold tracking-[-0.02em] sm:text-xl">
          {partida.casa}
        </p>
        <div className="rounded-2xl bg-green-dark px-3 py-2 font-display text-sm font-bold text-white shadow-sm sm:px-4 sm:text-base">
          {partida.concluida ? `${partida.golsCasa} × ${partida.golsFora}` : '×'}
        </div>
        <p className="text-right font-display text-base font-semibold tracking-[-0.02em] sm:text-xl">
          {partida.fora}
        </p>
      </div>

      <div className="mt-6 flex min-h-11 items-center justify-between gap-3 border-t border-border/70 pt-4">
        <p className="flex min-w-0 items-center gap-1.5 truncate text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> {partida.campo}
        </p>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-pale text-green-dark transition-colors duration-150 group-hover:bg-green-light/30">
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

export function PublicPartidasPage() {
  const proximas = partidas.filter((partida) => !partida.concluida);
  const resultados = partidas.filter((partida) => partida.concluida);

  return (
    <div className="mx-auto w-full max-w-[1380px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <PublicPageHeader
        eyebrow="Agenda e placares"
        title="Partidas"
        description="Horários, locais e resultados publicados em uma visão simples para quem só quer acompanhar o jogo."
      />

      <div className="space-y-10 sm:space-y-12">
        <section>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.15em] text-green-dark uppercase">
                Próximos jogos
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
                Agenda
              </h2>
            </div>
            <span className="rounded-full border border-border/70 bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
              {proximas.length} jogos
            </span>
          </div>

          {proximas.length === 0 ? (
            <PublicState
              kind="empty"
              title="Nenhuma partida agendada"
              description="Quando novas partidas forem publicadas, elas aparecerão aqui."
            />
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {proximas.map((partida) => (
                <MatchCard key={partida.id} partida={partida} />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.15em] text-green-dark uppercase">
                Jogos encerrados
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
                Resultados
              </h2>
            </div>
            <span className="rounded-full border border-border/70 bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
              {resultados.length} resultados
            </span>
          </div>

          {resultados.length === 0 ? (
            <PublicState
              kind="empty"
              title="Nenhum resultado publicado"
              description="Os placares públicos aparecerão aqui após a publicação dos jogos."
            />
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {resultados.map((partida) => (
                <MatchCard key={partida.id} partida={partida} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export function PublicPartidaDetailPage() {
  const { id } = useParams();
  const partida = partidas.find((item) => String(item.id) === String(id));

  if (!partida) {
    return (
      <div className="mx-auto w-full max-w-[1100px] px-4 py-10 sm:px-6 lg:px-8">
        <PublicState
          kind="error"
          title="Partida não encontrada"
          description="O link pode estar incorreto ou esta partida pode não estar disponível publicamente."
        />
      </div>
    );
  }

  const casaId = getTimeIdByName(partida.casa);
  const foraId = getTimeIdByName(partida.fora);

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <PublicPageHeader
        eyebrow={partida.rodada}
        title="Detalhes da partida"
        description={`${partida.data} · ${partida.campo}`}
      />

      <section className="overflow-hidden rounded-[30px] border border-border/70 bg-card shadow-[0_16px_44px_rgba(30,54,43,0.08)]">
        <div className="relative bg-green-dark px-4 py-10 text-white sm:px-8 sm:py-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.13),transparent_38%)]" />
          <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center sm:gap-6">
            <div className="min-w-0">
              {casaId ? (
                <Link
                  to={`/times/${casaId}`}
                  className="inline-flex min-h-11 items-center rounded-lg px-2 font-display text-lg font-semibold tracking-[-0.03em] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:text-3xl"
                >
                  {partida.casa}
                </Link>
              ) : (
                <p className="font-display text-lg font-semibold sm:text-3xl">{partida.casa}</p>
              )}
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 font-display text-xl font-bold backdrop-blur-sm sm:px-6 sm:text-3xl motion-reduce:backdrop-blur-none">
              {partida.concluida ? `${partida.golsCasa} × ${partida.golsFora}` : '×'}
            </div>

            <div className="min-w-0">
              {foraId ? (
                <Link
                  to={`/times/${foraId}`}
                  className="inline-flex min-h-11 items-center rounded-lg px-2 font-display text-lg font-semibold tracking-[-0.03em] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:text-3xl"
                >
                  {partida.fora}
                </Link>
              ) : (
                <p className="font-display text-lg font-semibold sm:text-3xl">{partida.fora}</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid bg-card sm:grid-cols-3">
          {[
            { icon: CalendarDays, label: 'Data', value: partida.data },
            { icon: Clock, label: 'Horário', value: partida.hora },
            { icon: MapPin, label: 'Local', value: partida.campo },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex items-start gap-3 border-b border-border/70 p-5 last:border-b-0 sm:border-r sm:border-b-0 sm:last:border-r-0 sm:p-6"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-green-pale text-green-dark">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                  <p className="mt-1 text-sm font-semibold">{item.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="mt-5 rounded-2xl border border-green-light/30 bg-green-pale px-4 py-3 text-sm leading-6 text-foreground/75 sm:px-5">
        Esta página mostra somente informações públicas da partida. Escalações, documentos e dados privados permanecem protegidos.
      </div>
    </div>
  );
}

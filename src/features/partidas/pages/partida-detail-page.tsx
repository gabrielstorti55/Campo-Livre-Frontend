import { CalendarDays, Clock, MapPin } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { partidas, times } from '@/mocks/data';
import { PageHero } from '@/shared/components/page-hero';
import { ResourceState } from '@/shared/components/resource-state';

function getTimeIdByName(name: string) {
  return times.find((time) => time.nome === name)?.id;
}

export function PartidaDetailPage() {
  const { id } = useParams();
  const partida = partidas.find((item) => String(item.id) === String(id));

  if (!partida) {
    return (
      <div className="mx-auto w-full max-w-[1100px] px-4 py-10 sm:px-6 lg:px-8">
        <ResourceState
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
      <PageHero
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
                <p className="font-display text-lg font-semibold sm:text-3xl">
                  {partida.casa}
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 font-display text-xl font-bold backdrop-blur-sm sm:px-6 sm:text-3xl motion-reduce:backdrop-blur-none">
              {partida.concluida
                ? `${partida.golsCasa} × ${partida.golsFora}`
                : '×'}
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
                <p className="font-display text-lg font-semibold sm:text-3xl">
                  {partida.fora}
                </p>
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
                  <p className="text-xs font-medium text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm font-semibold">{item.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="mt-5 rounded-2xl border border-green-light/30 bg-green-pale px-4 py-3 text-sm leading-6 text-foreground/75 sm:px-5">
        Esta página mostra somente informações públicas da partida. Escalações,
        documentos e dados privados permanecem protegidos.
      </div>
    </div>
  );
}

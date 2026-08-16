import { ArrowRight, CalendarDays, Clock, MapPin } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { PublicPageHeader } from '@/features/public/components/public-page-header';
import { PublicState } from '@/features/public/components/public-state';
import { partidas, times } from '@/mocks/data';

function getTimeIdByName(name: string) {
  return times.find((time) => time.nome === name)?.id;
}

function MatchCard({ partida }: { partida: (typeof partidas)[number] }) {
  return (
    <Link
      to={`/partidas/${partida.id}`}
      className="group block rounded-2xl border border-border/80 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all hover:-translate-y-0.5 hover:border-green-light hover:shadow-md"
    >
      <div className="mb-5 flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span className="font-semibold tracking-[0.1em] uppercase">{partida.rodada}</span>
        <span>{partida.data} · {partida.hora}</span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <p className="font-display text-base font-semibold sm:text-lg">{partida.casa}</p>
        <div className="rounded-xl bg-green-pale px-3 py-2 font-display text-sm font-bold text-green-dark">
          {partida.concluida ? `${partida.golsCasa} × ${partida.golsFora}` : '×'}
        </div>
        <p className="text-right font-display text-base font-semibold sm:text-lg">{partida.fora}</p>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-border/70 pt-4">
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" /> {partida.campo}
        </p>
        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-green-dark" />
      </div>
    </Link>
  );
}

export function PublicPartidasPage() {
  const proximas = partidas.filter((partida) => !partida.concluida);
  const resultados = partidas.filter((partida) => partida.concluida);

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-12 lg:px-10">
      <PublicPageHeader
        eyebrow="Agenda pública"
        title="Partidas e resultados"
        description="Consulte horários, locais e placares das partidas publicadas."
      />

      <div className="space-y-12">
        <section>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.12em] text-green-dark uppercase">Agenda</p>
              <h2 className="mt-1 font-display text-xl font-semibold sm:text-2xl">Próximas partidas</h2>
            </div>
            <span className="text-xs text-muted-foreground">{proximas.length} jogos</span>
          </div>
          {proximas.length === 0 ? (
            <PublicState kind="empty" title="Nenhuma partida agendada" description="Quando novas partidas forem publicadas, elas aparecerão aqui." />
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {proximas.map((partida) => <MatchCard key={partida.id} partida={partida} />)}
            </div>
          )}
        </section>

        <section>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.12em] text-green-dark uppercase">Placares</p>
              <h2 className="mt-1 font-display text-xl font-semibold sm:text-2xl">Resultados recentes</h2>
            </div>
            <span className="text-xs text-muted-foreground">{resultados.length} resultados</span>
          </div>
          {resultados.length === 0 ? (
            <PublicState kind="empty" title="Nenhum resultado publicado" description="Os placares públicos aparecerão aqui após a publicação dos jogos." />
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {resultados.map((partida) => <MatchCard key={partida.id} partida={partida} />)}
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
      <div className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
        <PublicState kind="error" title="Partida não encontrada" description="O link pode estar incorreto ou esta partida pode não estar disponível publicamente." />
      </div>
    );
  }

  const casaId = getTimeIdByName(partida.casa);
  const foraId = getTimeIdByName(partida.fora);

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 sm:py-12 lg:px-10">
      <PublicPageHeader eyebrow={partida.rodada} title="Detalhes da partida" description={`${partida.data} · ${partida.campo}`} />

      <section className="overflow-hidden rounded-[28px] border border-border/70 bg-white shadow-sm">
        <div className="bg-green-dark px-5 py-10 text-white sm:px-10 sm:py-14">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-center">
            <div className="min-w-0">
              {casaId ? (
                <Link to={`/times/${casaId}`} className="font-display text-xl font-semibold hover:underline sm:text-3xl">
                  {partida.casa}
                </Link>
              ) : (
                <p className="font-display text-xl font-semibold sm:text-3xl">{partida.casa}</p>
              )}
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3 font-display text-xl font-bold sm:text-3xl">
              {partida.concluida ? `${partida.golsCasa} × ${partida.golsFora}` : '×'}
            </div>
            <div className="min-w-0">
              {foraId ? (
                <Link to={`/times/${foraId}`} className="font-display text-xl font-semibold hover:underline sm:text-3xl">
                  {partida.fora}
                </Link>
              ) : (
                <p className="font-display text-xl font-semibold sm:text-3xl">{partida.fora}</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid divide-y divide-border/70 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            { icon: CalendarDays, label: 'Data', value: partida.data },
            { icon: Clock, label: 'Horário', value: partida.hora },
            { icon: MapPin, label: 'Local', value: partida.campo },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-start gap-3 p-5 sm:p-6">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-pale text-green-dark">
                  <Icon className="h-4 w-4" />
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

      <p className="mt-5 text-sm leading-6 text-muted-foreground">
        Esta página mostra somente informações públicas da partida. Escalações, documentos e dados privados permanecem protegidos.
      </p>
    </div>
  );
}

import { CalendarDays, Clock, MapPin } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { ResumoPartida } from '@/features/partidas/components/resumo-partida';
import { getPublicacaoPartidaMock } from '@/features/partidas/mocks/partida-publicacao.mock';
import { partidas, times } from '@/mocks/data';
import { PageHero } from '@/shared/components/page-hero';
import { ResourceState } from '@/shared/components/resource-state';

function getTimeIdByName(name: string) {
  return times.find((time) => time.nome === name)?.id;
}

function getEstadoPartida({
  concluida,
  agendada,
  resultadoPublicado,
}: {
  concluida: boolean;
  agendada: boolean;
  resultadoPublicado: boolean;
}) {
  if (resultadoPublicado) return 'Resultado publicado';
  if (concluida) return 'Aguardando publicação';
  if (agendada) return 'Agendada';
  return 'A definir';
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

  const publicacao = getPublicacaoPartidaMock(partida.id);
  const casaId = getTimeIdByName(partida.casa);
  const foraId = getTimeIdByName(partida.fora);
  const placarPublicado =
    publicacao.resultadoPublicado &&
    partida.golsCasa !== undefined &&
    partida.golsFora !== undefined
      ? `${partida.golsCasa} × ${partida.golsFora}`
      : null;
  const estado = getEstadoPartida({
    concluida: partida.concluida,
    agendada: partida.agendada,
    resultadoPublicado: publicacao.resultadoPublicado,
  });

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
              {placarPublicado ?? '×'}
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

        <div className="grid bg-card sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: CalendarDays, label: 'Data', value: partida.data },
            { icon: Clock, label: 'Horário', value: partida.hora },
            { icon: MapPin, label: 'Local', value: partida.campo },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex items-start gap-3 border-b border-border/70 p-5 sm:border-r sm:p-6 lg:border-b-0"
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

          <div className="flex items-start gap-3 p-5 sm:p-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-green-pale text-green-dark">
              <span className="h-2.5 w-2.5 rounded-full bg-green-dark" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Estado</p>
              <p className="mt-1 text-sm font-semibold">{estado}</p>
            </div>
          </div>
        </div>
      </section>

      {publicacao.resultadoPublicado && publicacao.sumulaPublica && placarPublicado ? (
        <ResumoPartida placar={placarPublicado} sumula={publicacao.sumulaPublica} />
      ) : (
        <section
          aria-labelledby="resumo-partida-title"
          className="mt-6 rounded-[28px] border border-border/70 bg-card p-5 sm:p-6"
        >
          <p className="text-xs font-semibold tracking-[0.14em] text-green-dark uppercase">
            Súmula
          </p>
          <h2
            id="resumo-partida-title"
            className="mt-1 font-display text-2xl font-semibold tracking-[-0.03em]"
          >
            Resumo da partida
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            O resumo da partida será disponibilizado após a publicação do resultado.
          </p>
        </section>
      )}

      <div className="mt-5 rounded-2xl border border-green-light/30 bg-green-pale px-4 py-3 text-sm leading-6 text-foreground/75 sm:px-5">
        Esta página mostra somente informações esportivas publicáveis da partida.
        Documentos, observações administrativas e dados privados permanecem protegidos.
      </div>
    </div>
  );
}

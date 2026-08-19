'use client';

import { ArrowUpRight, ShieldCheck, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { ResultadoRow } from '@/features/campeonatos/components/campeonato-widgets';
import { partidas, times } from '@/mocks/data';
import { Section } from '@/shared/components/campo-livre-ui';
import { PageHero } from '@/shared/components/page-hero';
import { ResourceState } from '@/shared/components/resource-state';
import { StatusBadge } from '@/shared/components/status-badge';
import { cn } from '@/shared/lib/utils';

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

export function TimeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const time = times.find((item) => String(item.id) === String(id));

  if (!time) {
    return (
      <div className="mx-auto w-full max-w-[1380px] px-4 py-10 sm:px-6 lg:px-8">
        <ResourceState
          kind="error"
          title="Time não encontrado"
          description="O link pode estar incorreto ou este time pode não estar disponível publicamente."
        />
      </div>
    );
  }

  const jogos = partidas.filter(
    (partida) => partida.casa === time.nome || partida.fora === time.nome,
  );
  const resultados = jogos.filter((partida) => partida.concluida);
  const proximos = jogos.filter((partida) => !partida.concluida);

  return (
    <div className="mx-auto w-full max-w-[1380px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <PageHero
        eyebrow="Perfil público do time"
        title={time.nome}
        description={time.cidade}
        action={<StatusBadge status={time.status} />}
      />

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <div className="rounded-[24px] border border-border/70 bg-card p-5 shadow-[0_8px_24px_rgba(30,54,43,0.05)] sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-pale text-green-dark">
              <Trophy className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                Campeonato atual
              </p>
              <p className="mt-2 font-display text-xl font-semibold">
                {time.campeonato ?? 'Sem campeonato público informado'}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-green-light/30 bg-green-pale p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-card text-green-dark shadow-sm">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-[0.14em] text-green-dark uppercase">
                Privacidade
              </p>
              <p className="mt-2 text-sm leading-6 text-foreground/75">
                Elenco e dados pessoais de atletas não são exibidos nesta área
                pública.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-[24px] border border-border/70 bg-card p-4 shadow-[0_8px_24px_rgba(30,54,43,0.05)] sm:p-6">
          <Section title="Próximas partidas">
            {proximos.length === 0 ? (
              <ResourceState
                kind="empty"
                title="Nenhuma partida futura"
                description="Ainda não há uma próxima partida pública para este time."
              />
            ) : (
              <div className="space-y-2">
                {proximos.map((partida) => (
                  <Link
                    key={partida.id}
                    href={`/partidas/${partida.id}`}
                    className={cn(
                      'group flex min-h-20 items-center justify-between gap-4 rounded-2xl bg-muted p-4 transition-colors duration-150 hover:bg-green-pale/60',
                      focusRing,
                    )}
                  >
                    <div>
                      <p className="font-display font-semibold">
                        {partida.casa} vs {partida.fora}
                      </p>
                      <p className="mt-1 text-sm leading-5 text-muted-foreground">
                        {partida.data} · {partida.hora} · {partida.campo}
                      </p>
                    </div>
                    <ArrowUpRight
                      className="h-4 w-4 shrink-0 text-muted-foreground transition-colors duration-150 group-hover:text-green-dark"
                      aria-hidden="true"
                    />
                  </Link>
                ))}
              </div>
            )}
          </Section>
        </section>

        <section className="rounded-[24px] border border-border/70 bg-card p-4 shadow-[0_8px_24px_rgba(30,54,43,0.05)] sm:p-6">
          <Section title="Resultados">
            {resultados.length === 0 ? (
              <ResourceState
                kind="empty"
                title="Nenhum resultado publicado"
                description="Os resultados públicos deste time aparecerão aqui."
              />
            ) : (
              <div>
                {resultados.map((partida) => (
                  <Link
                    key={partida.id}
                    href={`/partidas/${partida.id}`}
                    className={cn('block rounded-lg', focusRing)}
                  >
                    <ResultadoRow
                      casa={partida.casa}
                      fora={partida.fora}
                      placar={`${partida.golsCasa} x ${partida.golsFora}`}
                      subtitle={`${partida.data} · ${partida.campo}`}
                    />
                  </Link>
                ))}
              </div>
            )}
          </Section>
        </section>
      </div>
    </div>
  );
}

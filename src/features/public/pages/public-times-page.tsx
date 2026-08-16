import { ArrowUpRight, MapPin, ShieldCheck, Trophy } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { ResultadoRow } from '@/features/campeonatos/components/campeonato-widgets';
import { PublicPageHeader } from '@/features/public/components/public-page-header';
import { PublicState } from '@/features/public/components/public-state';
import { partidas, times } from '@/mocks/data';
import { SearchBar, Section } from '@/shared/components/campo-livre-ui';
import { StatusBadge } from '@/shared/components/status-badge';
import { cn } from '@/shared/lib/utils';

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

export function PublicTimesPage() {
  const [busca, setBusca] = useState('');
  const lista = times.filter((time) =>
    time.nome.toLowerCase().includes(busca.toLowerCase()),
  );

  return (
    <div className="mx-auto w-full max-w-[1380px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <PublicPageHeader
        eyebrow="Clubes e equipes"
        title="Times"
        description="Consulte equipes participantes sem expor elenco ou dados pessoais dos atletas."
      />

      <div className="mb-7 grid gap-4 rounded-2xl border border-border/70 bg-card p-4 shadow-[0_8px_24px_rgba(30,54,43,0.05)] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-5">
        <div className="max-w-xl">
          <SearchBar placeholder="Buscar times..." value={busca} onChange={setBusca} />
        </div>
        <p className="text-sm text-muted-foreground sm:text-right">
          <span className="font-semibold text-foreground">{lista.length}</span> times públicos
        </p>
      </div>

      {lista.length === 0 ? (
        <PublicState
          kind="empty"
          title="Nenhum time encontrado"
          description="Tente outro nome. Dados de atletas e elenco continuam protegidos enquanto a regra de privacidade não estiver definida."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {lista.map((time) => (
            <Link
              key={time.id}
              to={`/times/${time.id}`}
              className={cn(
                'group rounded-[24px] border border-border/70 bg-card p-5 shadow-[0_10px_30px_rgba(30,54,43,0.06)] transition-[border-color,box-shadow] duration-150 hover:border-green-light hover:shadow-[0_14px_36px_rgba(30,54,43,0.10)] sm:p-6',
                focusRing,
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-dark font-display text-lg font-bold text-white shadow-sm">
                    {time.nome.slice(0, 2).toUpperCase()}
                  </div>
                  <h2 className="font-display text-xl font-semibold tracking-[-0.03em] transition-colors duration-150 group-hover:text-green-dark sm:text-2xl">
                    {time.nome}
                  </h2>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> {time.cidade}
                  </p>
                </div>
                <StatusBadge status={time.status} />
              </div>

              <div className="mt-6 border-t border-border/70 pt-4">
                <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                  Campeonato
                </p>
                <p className="mt-1.5 text-sm font-medium text-foreground">
                  {time.campeonato ?? 'Sem competição pública informada'}
                </p>
              </div>

              <div className="mt-6 flex min-h-11 items-center justify-between text-sm font-semibold text-green-dark">
                Ver time
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-pale transition-colors duration-150 group-hover:bg-green-light/30">
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function PublicTimeDetailPage() {
  const { id } = useParams();
  const time = times.find((item) => String(item.id) === String(id));

  if (!time) {
    return (
      <div className="mx-auto w-full max-w-[1380px] px-4 py-10 sm:px-6 lg:px-8">
        <PublicState
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
      <PublicPageHeader
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
                Elenco e dados pessoais de atletas não são exibidos nesta área pública.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-[24px] border border-border/70 bg-card p-4 shadow-[0_8px_24px_rgba(30,54,43,0.05)] sm:p-6">
          <Section title="Próximas partidas">
            {proximos.length === 0 ? (
              <PublicState
                kind="empty"
                title="Nenhuma partida futura"
                description="Ainda não há uma próxima partida pública para este time."
              />
            ) : (
              <div className="space-y-2">
                {proximos.map((partida) => (
                  <Link
                    key={partida.id}
                    to={`/partidas/${partida.id}`}
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
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors duration-150 group-hover:text-green-dark" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            )}
          </Section>
        </section>

        <section className="rounded-[24px] border border-border/70 bg-card p-4 shadow-[0_8px_24px_rgba(30,54,43,0.05)] sm:p-6">
          <Section title="Resultados">
            {resultados.length === 0 ? (
              <PublicState
                kind="empty"
                title="Nenhum resultado publicado"
                description="Os resultados públicos deste time aparecerão aqui."
              />
            ) : (
              <div>
                {resultados.map((partida) => (
                  <Link
                    key={partida.id}
                    to={`/partidas/${partida.id}`}
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

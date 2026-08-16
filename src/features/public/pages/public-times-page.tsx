import { ArrowRight, MapPin, ShieldCheck, Trophy } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { ResultadoRow } from '@/features/campeonatos/components/campeonato-widgets';
import { PublicPageHeader } from '@/features/public/components/public-page-header';
import { PublicState } from '@/features/public/components/public-state';
import { partidas, times } from '@/mocks/data';
import { SearchBar, Section } from '@/shared/components/campo-livre-ui';
import { StatusBadge } from '@/shared/components/status-badge';

export function PublicTimesPage() {
  const [busca, setBusca] = useState('');
  const lista = times.filter((time) =>
    time.nome.toLowerCase().includes(busca.toLowerCase()),
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-12 lg:px-10">
      <PublicPageHeader
        eyebrow="Clubes"
        title="Times"
        description="Consulte os times participantes e somente as informações liberadas para visualização pública."
      />

      <div className="mb-7 max-w-lg">
        <SearchBar placeholder="Buscar times..." value={busca} onChange={setBusca} />
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
              className="group flex min-h-48 flex-col rounded-2xl border border-border/80 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all hover:-translate-y-0.5 hover:border-green-light hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl font-semibold tracking-[-0.02em] group-hover:text-green-dark">
                    {time.nome}
                  </h2>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {time.cidade}
                  </p>
                </div>
                <StatusBadge status={time.status} />
              </div>

              {time.campeonato ? (
                <div className="mt-6 flex items-center gap-2 border-t border-border/70 pt-4 text-sm text-muted-foreground">
                  <Trophy className="h-4 w-4 text-green-dark" />
                  <span>{time.campeonato}</span>
                </div>
              ) : null}

              <div className="mt-auto flex items-center justify-between pt-5 text-sm font-semibold text-green-dark">
                Ver time
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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
      <div className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
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
    <div className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-12 lg:px-10">
      <PublicPageHeader
        eyebrow="Time"
        title={time.nome}
        description={time.cidade}
        action={<StatusBadge status={time.status} />}
      />

      <div className="mb-10 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-border/80 bg-white p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-pale text-green-dark">
              <Trophy className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">Campeonato</p>
              <p className="mt-1 font-display text-lg font-semibold">
                {time.campeonato ?? 'Sem campeonato público informado'}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border/80 bg-white p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-pale text-green-dark">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">Privacidade</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Elenco e dados pessoais de atletas não são exibidos nesta área pública.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-10 xl:grid-cols-2">
        <Section title="Próximas partidas">
          {proximos.length === 0 ? (
            <PublicState kind="empty" title="Nenhuma partida futura" description="Ainda não há uma próxima partida pública para este time." />
          ) : (
            <div className="space-y-3">
              {proximos.map((partida) => (
                <Link
                  key={partida.id}
                  to={`/partidas/${partida.id}`}
                  className="group flex items-center justify-between gap-4 rounded-2xl border border-border/80 bg-white p-5 transition-colors hover:border-green-light"
                >
                  <div>
                    <p className="font-display font-semibold">{partida.casa} vs {partida.fora}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{partida.data} · {partida.hora} · {partida.campo}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-green-dark" />
                </Link>
              ))}
            </div>
          )}
        </Section>

        <Section title="Resultados">
          {resultados.length === 0 ? (
            <PublicState kind="empty" title="Nenhum resultado publicado" description="Os resultados públicos deste time aparecerão aqui." />
          ) : (
            <div className="rounded-2xl border border-border/80 bg-white px-4">
              {resultados.map((partida) => (
                <Link key={partida.id} to={`/partidas/${partida.id}`}>
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
      </div>
    </div>
  );
}

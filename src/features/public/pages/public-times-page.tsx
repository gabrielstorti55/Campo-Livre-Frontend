import { ArrowUpRight, MapPin, ShieldCheck, Trophy } from 'lucide-react';
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
    <div className="mx-auto w-full max-w-[1380px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <PublicPageHeader
        eyebrow="Clubes e equipes"
        title="Times"
        description="Consulte equipes participantes sem expor elenco ou dados pessoais dos atletas."
      />

      <div className="mb-7 grid gap-4 rounded-2xl bg-white p-4 shadow-[0_12px_36px_rgba(30,54,43,0.06)] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-5">
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
              className="group rounded-[24px] bg-white p-5 shadow-[0_12px_35px_rgba(30,54,43,0.07)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(30,54,43,0.12)] sm:p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-dark font-display text-lg font-bold text-white shadow-sm">
                    {time.nome.slice(0, 2).toUpperCase()}
                  </div>
                  <h2 className="font-display text-xl font-semibold tracking-[-0.03em] transition-colors group-hover:text-green-dark sm:text-2xl">
                    {time.nome}
                  </h2>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {time.cidade}
                  </p>
                </div>
                <StatusBadge status={time.status} />
              </div>

              <div className="mt-6 border-t border-black/6 pt-4">
                <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                  Campeonato
                </p>
                <p className="mt-1.5 text-sm font-medium text-foreground">
                  {time.campeonato ?? 'Sem competição pública informada'}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between text-sm font-semibold text-green-dark">
                Ver time
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-pale transition-transform group-hover:translate-x-1">
                  <ArrowUpRight className="h-4 w-4" />
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

      <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-[24px] bg-white p-5 shadow-[0_12px_35px_rgba(30,54,43,0.06)] sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-pale text-green-dark">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                Campeonato atual
              </p>
              <p className="mt-2 font-display text-xl font-semibold">
                {time.campeonato ?? 'Sem campeonato público informado'}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] bg-[#edf4ef] p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-green-dark shadow-sm">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-[0.14em] text-green-dark uppercase">
                Privacidade
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Elenco e dados pessoais de atletas não são exibidos nesta área pública.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-[24px] bg-white p-4 shadow-[0_12px_35px_rgba(30,54,43,0.06)] sm:p-6">
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
                    className="group flex items-center justify-between gap-4 rounded-2xl bg-[#f7f8f6] p-4 transition hover:bg-green-pale/60"
                  >
                    <div>
                      <p className="font-display font-semibold">
                        {partida.casa} vs {partida.fora}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {partida.data} · {partida.hora} · {partida.campo}
                      </p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-green-dark" />
                  </Link>
                ))}
              </div>
            )}
          </Section>
        </section>

        <section className="rounded-[24px] bg-white p-4 shadow-[0_12px_35px_rgba(30,54,43,0.06)] sm:p-6">
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
        </section>
      </div>
    </div>
  );
}

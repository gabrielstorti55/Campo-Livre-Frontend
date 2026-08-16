import { MapPin, Trophy } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { ResultadoRow } from '@/features/campeonatos/components/campeonato-widgets';
import { PublicState } from '@/features/public/components/public-state';
import { partidas, times } from '@/mocks/data';
import { Card, PageHeader, SearchBar, Section } from '@/shared/components/campo-livre-ui';
import { StatusBadge } from '@/shared/components/status-badge';

export function PublicTimesPage() {
  const [busca, setBusca] = useState('');
  const lista = times.filter((time) =>
    time.nome.toLowerCase().includes(busca.toLowerCase()),
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
      <PageHeader
        title="Times"
        subtitle="Times e informações liberadas para consulta pública"
      />

      <SearchBar placeholder="Buscar times..." value={busca} onChange={setBusca} />

      {lista.length === 0 ? (
        <PublicState
          kind="empty"
          title="Nenhum time encontrado"
          description="Tente outro nome. Dados de atletas e elenco não são exibidos enquanto a regra de privacidade não estiver definida."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lista.map((time) => (
            <Card key={time.id} className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    to={`/times/${time.id}`}
                    className="font-display font-semibold hover:text-green-mid"
                  >
                    {time.nome}
                  </Link>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                    {time.cidade}
                  </p>
                </div>
                <StatusBadge status={time.status} />
              </div>

              {time.campeonato ? (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Trophy className="h-4 w-4" aria-hidden="true" />
                  {time.campeonato}
                </p>
              ) : null}

              <Link
                to={`/times/${time.id}`}
                className="mt-auto rounded-md border border-green-dark px-4 py-2.5 text-center text-sm font-semibold text-green-dark transition-colors hover:bg-green-pale"
              >
                Ver time
              </Link>
            </Card>
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
      <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8">
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
    <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
      <PageHeader
        title={time.nome}
        subtitle={time.cidade}
        actions={<StatusBadge status={time.status} />}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Campeonato
          </p>
          <p className="mt-2 font-display text-lg font-semibold">
            {time.campeonato ?? 'Sem campeonato público informado'}
          </p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Privacidade
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Elenco e dados pessoais de atletas não são exibidos nesta área pública.
          </p>
        </Card>
      </div>

      <Section title="Próximas partidas">
        {proximos.length === 0 ? (
          <PublicState
            kind="empty"
            title="Nenhuma partida futura"
            description="Ainda não há uma próxima partida pública para este time."
          />
        ) : (
          <div className="space-y-3">
            {proximos.map((partida) => (
              <Link
                key={partida.id}
                to={`/partidas/${partida.id}`}
                className="block rounded-xl border border-border bg-white p-4 transition-colors hover:border-green-light"
              >
                <p className="font-display font-semibold">
                  {partida.casa} vs {partida.fora}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {partida.data} · {partida.hora} · {partida.campo}
                </p>
              </Link>
            ))}
          </div>
        )}
      </Section>

      <Section title="Resultados">
        {resultados.length === 0 ? (
          <PublicState
            kind="empty"
            title="Nenhum resultado publicado"
            description="Os resultados públicos deste time aparecerão aqui."
          />
        ) : (
          <div className="rounded-xl border border-border bg-white px-4">
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
  );
}

import { CalendarDays, Clock, MapPin } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { PublicState } from '@/features/public/components/public-state';
import { partidas, times } from '@/mocks/data';
import { Card, PageHeader, Section } from '@/shared/components/campo-livre-ui';

function getTimeIdByName(name: string) {
  return times.find((time) => time.nome === name)?.id;
}

function MatchCard({ partida }: { partida: (typeof partidas)[number] }) {
  const placar = partida.concluida
    ? `${partida.golsCasa} x ${partida.golsFora}`
    : 'vs';

  return (
    <Link
      to={`/partidas/${partida.id}`}
      className="block rounded-xl border border-border bg-white p-4 transition-colors hover:border-green-light"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display font-semibold">
            {partida.casa} <span className="text-green-dark">{placar}</span>{' '}
            {partida.fora}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{partida.rodada}</p>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <p>{partida.data}</p>
          <p>{partida.hora}</p>
        </div>
      </div>
      <p className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
        <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
        {partida.campo}
      </p>
    </Link>
  );
}

export function PublicPartidasPage() {
  const proximas = partidas.filter((partida) => !partida.concluida);
  const resultados = partidas.filter((partida) => partida.concluida);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
      <PageHeader
        title="Partidas e resultados"
        subtitle="Agenda, locais e placares disponíveis para consulta pública"
      />

      <Section title="Próximas partidas">
        {proximas.length === 0 ? (
          <PublicState
            kind="empty"
            title="Nenhuma partida agendada"
            description="Quando novas partidas forem publicadas, elas aparecerão aqui."
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {proximas.map((partida) => (
              <MatchCard key={partida.id} partida={partida} />
            ))}
          </div>
        )}
      </Section>

      <Section title="Resultados">
        {resultados.length === 0 ? (
          <PublicState
            kind="empty"
            title="Nenhum resultado publicado"
            description="Os placares públicos aparecerão aqui após a publicação dos jogos."
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {resultados.map((partida) => (
              <MatchCard key={partida.id} partida={partida} />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

export function PublicPartidaDetailPage() {
  const { id } = useParams();
  const partida = partidas.find((item) => String(item.id) === String(id));

  if (!partida) {
    return (
      <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8">
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
    <div className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-8 sm:py-12">
      <PageHeader title="Detalhes da partida" subtitle={partida.rodada} />

      <Card className="overflow-hidden p-0">
        <div className="bg-green-dark px-5 py-8 text-white sm:px-8">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
            <div className="min-w-0">
              {casaId ? (
                <Link
                  to={`/times/${casaId}`}
                  className="font-display text-lg font-semibold hover:underline sm:text-2xl"
                >
                  {partida.casa}
                </Link>
              ) : (
                <p className="font-display text-lg font-semibold sm:text-2xl">
                  {partida.casa}
                </p>
              )}
            </div>

            <div className="font-display text-xl font-bold sm:text-3xl">
              {partida.concluida
                ? `${partida.golsCasa} × ${partida.golsFora}`
                : '×'}
            </div>

            <div className="min-w-0">
              {foraId ? (
                <Link
                  to={`/times/${foraId}`}
                  className="font-display text-lg font-semibold hover:underline sm:text-2xl"
                >
                  {partida.fora}
                </Link>
              ) : (
                <p className="font-display text-lg font-semibold sm:text-2xl">
                  {partida.fora}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-3 sm:p-8">
          <div className="flex items-start gap-3">
            <CalendarDays className="mt-0.5 h-4 w-4 text-green-dark" aria-hidden="true" />
            <div>
              <p className="text-xs text-muted-foreground">Data</p>
              <p className="mt-1 text-sm font-semibold">{partida.data}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-4 w-4 text-green-dark" aria-hidden="true" />
            <div>
              <p className="text-xs text-muted-foreground">Horário</p>
              <p className="mt-1 text-sm font-semibold">{partida.hora}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-4 w-4 text-green-dark" aria-hidden="true" />
            <div>
              <p className="text-xs text-muted-foreground">Local</p>
              <p className="mt-1 text-sm font-semibold">{partida.campo}</p>
            </div>
          </div>
        </div>
      </Card>

      <p className="mt-5 text-sm leading-6 text-muted-foreground">
        Esta visualização publica apenas informações da partida. Escalações,
        documentos e outros dados privados não são exibidos.
      </p>
    </div>
  );
}

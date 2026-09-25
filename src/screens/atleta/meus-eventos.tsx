'use client';

import { CalendarDays, MapPin } from 'lucide-react';
import Link from 'next/link';

import { CabecalhoPagina } from '@/components/layout/cabecalho-pagina';
import { EstadoRecurso } from '@/components/layout/estado-recurso';
import { Button } from '@/components/ui/button';
import { useSessao } from '@/hooks/use-sessao';
import {
  campeonatosPublicosMock,
  locaisPartidaPublicosMock,
  partidasPublicasMock,
  timesPublicosMock,
} from '@/mocks/publico/dados-publicos';

function formatarData(data?: string, hora?: string) {
  if (!data) return 'Data a definir';
  const valor = new Date(`${data}T${hora ?? '12:00'}:00`);
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    ...(hora ? { timeStyle: 'short' as const } : {}),
  }).format(valor);
}

export function TelaMeusEventos() {
  const { session } = useSessao();
  const partidas = partidasPublicasMock
    .filter((partida) => [partida.timeCasaId, partida.timeForaId].includes(1))
    .sort((a, b) => (a.data ?? '9999').localeCompare(b.data ?? '9999'));

  return (
    <>
      <CabecalhoPagina
        title="Meus eventos"
        subtitle="Agenda esportiva do Vila Nova FC"
      />

      {!session?.prototipo ? (
        <EstadoRecurso
          kind="empty"
          title="Agenda pessoal ainda indisponível"
          description="A área integrada aguarda a projeção que relaciona os vínculos da conta às partidas."
        />
      ) : (
        <div className="divide-y divide-border border-y border-border bg-card">
          {partidas.map((partida) => {
            const campeonato = campeonatosPublicosMock.find(
              (item) => item.id === partida.campeonatoId,
            );
            const mandante = timesPublicosMock.find(
              (item) => item.id === partida.timeCasaId,
            );
            const visitante = timesPublicosMock.find(
              (item) => item.id === partida.timeForaId,
            );
            const campo = locaisPartidaPublicosMock.find(
              (item) => item.id === partida.campoId,
            );
            return (
              <article
                key={partida.id}
                className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-center"
              >
                <div>
                  <p className="text-xs font-semibold tracking-wide text-green-mid uppercase">
                    {campeonato?.nome} · {partida.rodada}
                  </p>
                  <h2 className="mt-2 font-display text-xl font-bold uppercase">
                    {mandante?.nome} × {visitante?.nome}
                  </h2>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" aria-hidden="true" />
                      {formatarData(partida.data, partida.hora)}
                    </span>
                    <span className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" aria-hidden="true" />
                      {campo?.nome ?? 'Campo a definir'}
                    </span>
                  </div>
                </div>
                <Button variant="campoOutline" asChild>
                  <Link href={`/partidas/${partida.id}`}>Ver partida</Link>
                </Button>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}

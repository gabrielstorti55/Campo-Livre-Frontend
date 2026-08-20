'use client';

import { ArrowUpRight, MapPin } from 'lucide-react';
import Link from 'next/link';

import type { PartidaPublica } from '@/types/publico';
import {
  obterNomeCampoPartida,
  obterNomeTimePublico,
  catalogoPublicoMock,
} from '@/services/publico/catalogo-publico.mock';
import { DestaquePagina } from '@/components/layout/destaque-pagina';
import { EstadoRecurso } from '@/components/layout/estado-recurso';

const estadoLabel = {
  A_DEFINIR: 'A definir',
  AGENDADA: 'Agendada',
  ADIADA: 'Adiada',
  CANCELADA: 'Cancelada',
  AGUARDANDO_PUBLICACAO: 'Aguardando publicação',
  RESULTADO_PUBLICADO: 'Resultado publicado',
} as const;

function MatchCard({ partida }: { partida: PartidaPublica }) {
  const placar =
    partida.resultadoPublicado &&
    partida.golsCasa !== undefined &&
    partida.golsFora !== undefined
      ? `${partida.golsCasa} × ${partida.golsFora}`
      : '×';
  return (
    <Link
      href={`/partidas/${partida.id}`}
      className="group block rounded-[24px] border border-border/70 bg-card p-5 shadow-sm transition hover:border-green-light hover:shadow-md sm:p-6"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="rounded-full bg-muted px-3 py-1.5 font-semibold uppercase">
          {partida.rodada}
        </span>
        <span>
          {partida.data
            ? new Date(`${partida.data}T12:00:00`).toLocaleDateString('pt-BR')
            : 'Data a definir'}{' '}
          · {partida.hora ?? 'Horário a definir'}
        </span>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <p className="font-display text-base font-semibold sm:text-xl">
          {obterNomeTimePublico(partida.timeCasaId)}
        </p>
        <div className="rounded-2xl bg-green-dark px-3 py-2 font-display text-sm font-bold text-white">
          {placar}
        </div>
        <p className="text-right font-display text-base font-semibold sm:text-xl">
          {obterNomeTimePublico(partida.timeForaId)}
        </p>
      </div>
      <div className="mt-6 flex min-h-11 items-center justify-between gap-3 border-t border-border/70 pt-4">
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
          {obterNomeCampoPartida(partida.campoId)} ·{' '}
          {estadoLabel[partida.estado]}
        </p>
        <ArrowUpRight className="h-4 w-4 text-green-dark" aria-hidden="true" />
      </div>
    </Link>
  );
}

export function TelaPartidas() {
  const partidas = catalogoPublicoMock.listarPartidas();
  const agenda = partidas.filter(
    (partida) =>
      !['RESULTADO_PUBLICADO', 'AGUARDANDO_PUBLICACAO', 'CANCELADA'].includes(
        partida.estado,
      ),
  );
  const resultados = partidas.filter((partida) => partida.resultadoPublicado);
  return (
    <div className="mx-auto w-full max-w-[1380px] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <DestaquePagina
        eyebrow="Agenda e placares"
        title="Partidas"
        description="Agendamentos, estados públicos e resultados definitivos, sem simulação de acompanhamento ao vivo."
      />
      <div className="space-y-10">
        <section>
          <h2 className="mb-5 font-display text-2xl font-semibold">Agenda</h2>
          {agenda.length === 0 ? (
            <EstadoRecurso
              kind="empty"
              title="Nenhuma partida agendada"
              description="Quando novas partidas forem publicadas, elas aparecerão aqui."
            />
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {agenda.map((partida) => (
                <MatchCard key={partida.id} partida={partida} />
              ))}
            </div>
          )}
        </section>
        <section>
          <h2 className="mb-5 font-display text-2xl font-semibold">
            Resultados
          </h2>
          {resultados.length === 0 ? (
            <EstadoRecurso
              kind="empty"
              title="Nenhum resultado publicado"
              description="Os placares públicos aparecerão após a publicação definitiva."
            />
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {resultados.map((partida) => (
                <MatchCard key={partida.id} partida={partida} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

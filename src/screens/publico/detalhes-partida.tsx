'use client';

import { CalendarDays, Clock as Relogio, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { ResumoPartida } from '@/components/modules/partidas/resumo-partida';
import { obterPublicacaoPartidaMock } from '@/mocks/partidas/publicacao-partida.mock';
import { atletasPublicosMock } from '@/mocks/publico/dados-publicos';
import {
  obterNomeCampeonatoPublico,
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

function nomesAtletas(ids: number[] = []) {
  return ids
    .map((id) => atletasPublicosMock.find((atleta) => atleta.id === id))
    .filter((atleta) => atleta?.perfilPublico)
    .map((atleta) => atleta!.nome);
}

export function TelaDetalhesPartida() {
  const { id } = useParams<{ id: string }>();
  const partida = catalogoPublicoMock.obterPartida(id);
  if (!partida)
    return (
      <div className="mx-auto w-full max-w-[1100px] px-4 py-10 sm:px-6 lg:px-8">
        <EstadoRecurso
          kind="error"
          title="Partida não encontrada"
          description="O link pode estar incorreto ou esta partida não está disponível publicamente."
        />
      </div>
    );

  const casa = obterNomeTimePublico(partida.timeCasaId);
  const fora = obterNomeTimePublico(partida.timeForaId);
  const publicacao = obterPublicacaoPartidaMock(partida.id);
  const placarPublicado =
    partida.resultadoPublicado &&
    partida.golsCasa !== undefined &&
    partida.golsFora !== undefined
      ? `${partida.golsCasa} × ${partida.golsFora}`
      : null;
  const escalaCasa = nomesAtletas(partida.escalacaoCasaAtletaIds);
  const escalaFora = nomesAtletas(partida.escalacaoForaAtletaIds);

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <DestaquePagina
        eyebrow={`${obterNomeCampeonatoPublico(partida.campeonatoId)} · ${partida.fase}${partida.grupo ? ` · ${partida.grupo}` : ''} · ${partida.rodada}`}
        title="Detalhes da partida"
        description={`${partida.data ? new Date(`${partida.data}T12:00:00`).toLocaleDateString('pt-BR') : 'Data a definir'} · ${obterNomeCampoPartida(partida.campoId)}`}
      />
      <section className="overflow-hidden rounded-[30px] border border-border/70 bg-card shadow-sm">
        <div className="bg-green-dark px-4 py-10 text-white sm:px-8">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
            <Link
              href={`/times/${partida.timeCasaId}`}
              className="font-display text-lg font-semibold sm:text-3xl"
            >
              {casa}
            </Link>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 font-display text-xl font-bold sm:text-3xl">
              {placarPublicado ?? '×'}
            </div>
            <Link
              href={`/times/${partida.timeForaId}`}
              className="font-display text-lg font-semibold sm:text-3xl"
            >
              {fora}
            </Link>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4">
          {[
            [
              CalendarDays,
              'Data',
              partida.data
                ? new Date(`${partida.data}T12:00:00`).toLocaleDateString(
                    'pt-BR',
                  )
                : 'A definir',
            ],
            [Relogio, 'Horário', partida.hora ?? 'A definir'],
            [MapPin, 'Local', obterNomeCampoPartida(partida.campoId)],
          ].map(([Icon, label, value]) => {
            const ItemIcon = Icon as typeof CalendarDays;
            return (
              <div
                key={String(label)}
                className="flex items-start gap-3 border-b border-border/70 p-5 sm:border-r"
              >
                <ItemIcon
                  className="h-4 w-4 text-green-dark"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-xs text-muted-foreground">
                    {String(label)}
                  </p>
                  <p className="mt-1 text-sm font-semibold">{String(value)}</p>
                </div>
              </div>
            );
          })}
          <div className="p-5">
            <p className="text-xs text-muted-foreground">Estado</p>
            <p className="mt-1 text-sm font-semibold">
              {estadoLabel[partida.estado]}
            </p>
            {partida.motivoPublico ? (
              <p className="mt-1 text-xs text-muted-foreground">
                {partida.motivoPublico}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      {(escalaCasa.length > 0 || escalaFora.length > 0) &&
      partida.estado === 'RESULTADO_PUBLICADO' ? (
        <section className="mt-6 rounded-3xl border border-border/70 bg-card p-5">
          <h2 className="font-display text-xl font-semibold">
            Escalações publicadas
          </h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <div>
              <h3 className="font-semibold">{casa}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {escalaCasa.join(' · ')}
              </p>
            </div>
            <div>
              <h3 className="font-semibold">{fora}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {escalaFora.join(' · ')}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {partida.resultadoPublicado &&
      publicacao.sumulaPublica &&
      placarPublicado ? (
        <>
          <ResumoPartida
            placar={placarPublicado}
            sumula={publicacao.sumulaPublica}
          />
          {partida.pdfSumula ? (
            <a
              href={partida.pdfSumula}
              className="mt-4 inline-flex min-h-11 items-center rounded-xl border border-border bg-card px-4 text-sm font-semibold text-green-dark"
            >
              Consultar referência da súmula em PDF
            </a>
          ) : null}
        </>
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
            className="mt-1 font-display text-2xl font-semibold"
          >
            Resumo da partida
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            O resumo da partida será disponibilizado após a publicação do
            resultado.
          </p>
        </section>
      )}
      <div className="mt-5 rounded-2xl border border-green-light/30 bg-green-pale px-4 py-3 text-sm">
        Esta página mostra somente informações esportivas publicáveis. Motivos
        detalhados, observações administrativas e dados privados permanecem
        protegidos.
      </div>
    </div>
  );
}

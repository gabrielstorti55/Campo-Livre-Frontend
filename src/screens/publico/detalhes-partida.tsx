'use client';

import { CalendarDays, Clock, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { DestaquePagina } from '@/components/layout/destaque-pagina';
import { EstadoRecurso } from '@/components/layout/estado-recurso';
import { Button } from '@/components/ui/button';
import { usePartidasApi } from '@/contexts/partidas-api';
import type { DetalhePublicoPartida } from '@/types/api/partidas';

const estadoLabel: Record<DetalhePublicoPartida['estado'], string> = {
  PENDENTE_AGENDAMENTO: 'Aguardando agendamento',
  AGENDADA: 'Agendada',
  ADIADA: 'Adiada',
  CANCELADA: 'Cancelada',
  ENCERRADA_SUMULA: 'Encerrada com súmula',
  ENCERRADA_WO: 'Encerrada por WO',
};

const motivoLabel: Record<
  NonNullable<DetalhePublicoPartida['motivoPublico']>,
  string
> = {
  CLIMA: 'Condições climáticas',
  CONDICAO_CAMPO: 'Condição do campo',
  INDISPONIBILIDADE_LOGISTICA: 'Indisponibilidade logística',
  DECISAO_ADMINISTRATIVA: 'Decisão administrativa',
  DESISTENCIA: 'Desistência',
  FORCA_MAIOR: 'Força maior',
};

export function TelaDetalhesPartida() {
  const { id } = useParams<{ id: string }>();
  const api = usePartidasApi();
  const [partida, setPartida] = useState<DetalhePublicoPartida | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [falhou, setFalhou] = useState(false);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const carregar = async () => {
      await Promise.resolve();
      if (controller.signal.aborted)
        throw new DOMException('Aborted', 'AbortError');
      setCarregando(true);
      setFalhou(false);
      setPartida(null);
      return api.consultarPartida(id, { signal: controller.signal });
    };
    void carregar().then(
      (resposta) => {
        if (controller.signal.aborted) return;
        setPartida(resposta);
        setCarregando(false);
      },
      (erro: unknown) => {
        if (controller.signal.aborted) return;
        if (erro instanceof DOMException && erro.name === 'AbortError') return;
        setFalhou(true);
        setCarregando(false);
      },
    );
    return () => controller.abort();
  }, [api, id, tentativa]);

  if (carregando) {
    return <p role="status">Carregando partida...</p>;
  }
  if (falhou || !partida) {
    return (
      <div className="mx-auto w-full max-w-[1100px] space-y-4 px-4 py-10 sm:px-6 lg:px-8">
        <EstadoRecurso
          kind="error"
          title="Partida não encontrada"
          description="O link pode estar incorreto, a partida pode não estar publicada ou a API está indisponível."
        />
        <Button
          variant="campoOutline"
          onClick={() => setTentativa((valor) => valor + 1)}
        >
          Tentar novamente
        </Button>
      </div>
    );
  }

  const placar = partida.resultado?.placarRegulamentar;
  const penaltis = partida.resultado?.placarPenaltis;
  const inicio = partida.agendamento.inicioEm
    ? new Date(partida.agendamento.inicioEm)
    : null;

  return (
    <div className="mx-auto w-full max-w-[1180px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
      <DestaquePagina
        eyebrow={`${partida.campeonato.nome} · ${partida.fase.nome}${partida.grupo ? ` · ${partida.grupo.nome}` : ''} · Rodada ${partida.rodada}`}
        title="Detalhes da partida"
        description={`${inicio ? inicio.toLocaleDateString('pt-BR') : 'Data a definir'} · ${partida.agendamento.campo?.nome ?? 'Campo a definir'}`}
      />

      <section
        aria-label="Placar da partida"
        className="overflow-hidden border-y-2 border-green-dark bg-card font-display"
      >
        <div className="campo-lines bg-green-dark px-4 py-10 text-white sm:px-8 sm:py-14">
          <div className="relative z-10 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
            <Link
              href={`/times/${partida.mandante.timeId}`}
              className="text-xl leading-none font-bold uppercase sm:text-4xl lg:text-5xl"
            >
              {partida.mandante.nome}
            </Link>
            <div className="border-x-2 border-accent px-4 py-2 text-3xl leading-none font-extrabold text-accent sm:px-7 sm:text-6xl">
              {placar ? `${placar.mandante} × ${placar.visitante}` : '×'}
            </div>
            <Link
              href={`/times/${partida.visitante.timeId}`}
              className="text-xl leading-none font-bold uppercase sm:text-4xl lg:text-5xl"
            >
              {partida.visitante.nome}
            </Link>
          </div>
        </div>

        <div className="grid font-sans sm:grid-cols-2 lg:grid-cols-4">
          {[
            [
              CalendarDays,
              'Data',
              inicio?.toLocaleDateString('pt-BR') ?? 'A definir',
            ],
            [
              Clock,
              'Horário',
              inicio?.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              }) ?? 'A definir',
            ],
            [MapPin, 'Local', partida.agendamento.campo?.nome ?? 'A definir'],
          ].map(([Icon, label, value]) => {
            const ItemIcon = Icon as typeof CalendarDays;
            return (
              <div
                key={String(label)}
                className="flex gap-3 border-b p-5 sm:border-r"
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
                {motivoLabel[partida.motivoPublico]}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section
        aria-label="Resumo da partida"
        className="mt-8 border-t-2 border-green-dark bg-card/70 p-5 sm:p-6"
      >
        <p className="text-xs font-semibold tracking-[0.14em] text-green-dark uppercase">
          Resultado oficial
        </p>
        <h2 className="mt-1 font-display text-3xl font-bold uppercase">
          Resumo da partida
        </h2>
        <p className="mt-2 text-sm font-semibold">
          {partida.resultado ? 'Resultado publicado' : 'Aguardando publicação'}
        </p>
        {placar ? (
          <p className="mt-2 font-display text-2xl font-bold">
            {penaltis ? 'Placar no jogo' : 'Placar final'}: {placar.mandante} ×{' '}
            {placar.visitante}
          </p>
        ) : null}
        {penaltis ? (
          <p className="mt-2 font-display text-xl font-bold">
            Pênaltis: {penaltis.mandante} × {penaltis.visitante}
          </p>
        ) : null}
        {!partida.resultado ? (
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            O resumo da partida será disponibilizado após a publicação do
            resultado.
          </p>
        ) : null}
        {partida.sumulaPublica ? (
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <section aria-label="Gols" className="border-t border-border pt-4">
              <h3 className="font-display text-2xl font-bold uppercase">
                Gols
              </h3>
              <ul className="mt-3 space-y-2 text-sm">
                {partida.sumulaPublica.gols.map((gol, indice) => (
                  <li key={`${gol.autor}-${gol.minuto}-${indice}`}>
                    <strong>{gol.autor}</strong> · {gol.time} · {gol.minuto}
                    &apos;
                  </li>
                ))}
              </ul>
            </section>
            {partida.sumulaPublica.cartoes?.length ? (
              <section
                aria-label="Cartões"
                className="border-t border-border pt-4"
              >
                <h3 className="font-display text-2xl font-bold uppercase">
                  Cartões
                </h3>
                <ul className="mt-3 space-y-2 text-sm">
                  {partida.sumulaPublica.cartoes.map((cartao, indice) => (
                    <li key={`${cartao.jogador}-${cartao.minuto}-${indice}`}>
                      <strong>{cartao.jogador}</strong> · {cartao.time} ·{' '}
                      {cartao.minuto}&apos; · {cartao.tipo}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            {partida.sumulaPublica.substituicoes?.length ? (
              <section
                aria-label="Substituições"
                className="border-t border-border pt-4"
              >
                <h3 className="font-display text-2xl font-bold uppercase">
                  Substituições
                </h3>
                <ul className="mt-3 space-y-2 text-sm">
                  {partida.sumulaPublica.substituicoes.map(
                    (substituicao, indice) => (
                      <li
                        key={`${substituicao.time}-${substituicao.minuto}-${indice}`}
                      >
                        <strong>{substituicao.time}</strong> ·{' '}
                        {substituicao.sai} → {substituicao.entra} ·{' '}
                        {substituicao.minuto}&apos;
                      </li>
                    ),
                  )}
                </ul>
              </section>
            ) : null}
          </div>
        ) : null}
        <p className="mt-5 text-sm leading-6 text-muted-foreground">
          Esta página mostra apenas fatos esportivos definitivos publicados.
          Escalações e o documento oficial seguem suas rotas e regras próprias.
        </p>
      </section>
    </div>
  );
}

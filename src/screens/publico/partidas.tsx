'use client';

import { ArrowUpRight, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { DestaquePagina } from '@/components/layout/destaque-pagina';
import { EstadoRecurso } from '@/components/layout/estado-recurso';
import { Button } from '@/components/ui/button';
import { usePartidasApi } from '@/contexts/partidas-api';
import type {
  DetalhePublicoPartida,
  ItemAgendaPartida,
  PaginaAgendaPartidas,
} from '@/types/api/partidas';

const estadoLabel: Record<ItemAgendaPartida['estado'], string> = {
  PENDENTE_AGENDAMENTO: 'Aguardando agendamento',
  AGENDADA: 'Agendada',
  ADIADA: 'Adiada',
  CANCELADA: 'Cancelada',
  ENCERRADA_SUMULA: 'Encerrada com súmula',
  ENCERRADA_WO: 'Encerrada por WO',
};

function CartaoPartida({
  partida,
  resultado,
}: {
  partida: ItemAgendaPartida;
  resultado: DetalhePublicoPartida['resultado'] | undefined;
}) {
  const placar =
    partida.estado === 'ENCERRADA_SUMULA' && resultado?.tipo === 'SUMULA'
      ? resultado.placarRegulamentar
      : null;
  return (
    <Link
      href={`/partidas/${partida.partidaId}`}
      className="group block rounded-md border border-border/70 bg-card p-5 transition hover:border-green-light sm:p-6"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="font-semibold text-green-dark">
          {partida.campeonato.nome}
        </span>
        <span>
          Rodada {partida.rodada} ·{' '}
          {partida.inicioEm
            ? new Date(partida.inicioEm).toLocaleString('pt-BR', {
                dateStyle: 'short',
                timeStyle: 'short',
              })
            : 'Data a definir'}
        </span>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <p className="font-display text-lg font-semibold">
          {partida.mandante.nome}
        </p>
        <div className="bg-green-dark px-3 py-2 font-display font-bold text-white">
          {placar ? `${placar.mandante} × ${placar.visitante}` : '×'}
        </div>
        <p className="text-right font-display text-lg font-semibold">
          {partida.visitante.nome}
        </p>
      </div>
      <div className="mt-6 flex min-h-11 items-center justify-between gap-3 border-t border-border/70 pt-4">
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
          {partida.campo?.nome ?? 'Campo a definir'} ·{' '}
          {estadoLabel[partida.estado]}
        </p>
        <ArrowUpRight className="h-4 w-4 text-green-dark" aria-hidden="true" />
      </div>
    </Link>
  );
}

export function TelaPartidas() {
  const api = usePartidasApi();
  const [pagina, setPagina] = useState(1);
  const [tentativa, setTentativa] = useState(0);
  const [resultado, setResultado] = useState<PaginaAgendaPartidas | null>(null);
  const [resultados, setResultados] = useState<
    Record<string, DetalhePublicoPartida['resultado']>
  >({});
  const [carregando, setCarregando] = useState(true);
  const [falhou, setFalhou] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const carregar = async () => {
      await Promise.resolve();
      if (controller.signal.aborted)
        throw new DOMException('Aborted', 'AbortError');
      setCarregando(true);
      setFalhou(false);
      setResultado(null);
      setResultados({});
      const agenda = await api.listarAgenda(
        { pagina, tamanho: 20 },
        { signal: controller.signal },
      );
      const encerradas = agenda.itens.filter(
        (partida) => partida.estado === 'ENCERRADA_SUMULA',
      );
      const detalhes = await Promise.all(
        encerradas.map((partida) =>
          api.consultarPartida(partida.partidaId, {
            signal: controller.signal,
          }),
        ),
      );
      return { agenda, detalhes };
    };
    void carregar().then(
      ({ agenda, detalhes }) => {
        if (controller.signal.aborted) return;
        setResultado(agenda);
        setResultados(
          Object.fromEntries(
            detalhes.map((partida) => [partida.partidaId, partida.resultado]),
          ),
        );
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
  }, [api, pagina, tentativa]);

  return (
    <div className="mx-auto w-full max-w-[1380px] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <DestaquePagina
        eyebrow="Agenda e resultados"
        title="Partidas"
        description="Consulte agendamentos, estados públicos e resultados definitivos, sem simulação de acompanhamento ao vivo."
      />

      {carregando ? <p role="status">Carregando partidas...</p> : null}
      {falhou ? (
        <div className="space-y-4">
          <EstadoRecurso
            kind="error"
            title="Não foi possível consultar as partidas"
            description="Tente novamente. Nenhuma agenda local será usada como substituto."
          />
          <Button
            variant="campoOutline"
            onClick={() => setTentativa((valor) => valor + 1)}
          >
            Tentar novamente
          </Button>
        </div>
      ) : null}
      {!carregando && !falhou && resultado?.itens.length === 0 ? (
        <EstadoRecurso
          kind="empty"
          title="Nenhuma partida encontrada"
          description="A consulta padrão mostra os próximos 30 dias. Partidas históricas podem ser consultadas quando um período for informado."
        />
      ) : null}
      {resultado?.itens.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {resultado.itens.map((partida) => (
            <CartaoPartida
              key={partida.partidaId}
              partida={partida}
              resultado={resultados[partida.partidaId]}
            />
          ))}
        </div>
      ) : null}

      {resultado && resultado.totalPaginas > 1 ? (
        <nav
          aria-label="Paginação das partidas"
          className="mt-7 flex items-center justify-center gap-4"
        >
          <Button
            variant="campoOutline"
            disabled={carregando || resultado.pagina <= 1}
            onClick={() => setPagina((valor) => valor - 1)}
          >
            Anterior
          </Button>
          <span className="text-sm">
            Página {resultado.pagina} de {resultado.totalPaginas}
          </span>
          <Button
            variant="campoOutline"
            disabled={carregando || resultado.pagina >= resultado.totalPaginas}
            onClick={() => setPagina((valor) => valor + 1)}
          >
            Próxima
          </Button>
        </nav>
      ) : null}
    </div>
  );
}

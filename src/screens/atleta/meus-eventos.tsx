'use client';

import { CalendarDays, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { CabecalhoPagina } from '@/components/layout/cabecalho-pagina';
import { EstadoRecurso } from '@/components/layout/estado-recurso';
import { Button } from '@/components/ui/button';
import { usePartidasApi } from '@/contexts/partidas-api';
import { useTimesApi } from '@/contexts/times-api';
import { useSessao } from '@/hooks/use-sessao';
import type { ItemAgendaPartida } from '@/types/api/partidas';

function formatarData(dataIso: string | null) {
  if (!dataIso) return 'Data a definir';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(dataIso));
}

function ordenarPartidas(partidas: ItemAgendaPartida[]) {
  return partidas.sort((a, b) => {
    if (!a.inicioEm) return 1;
    if (!b.inicioEm) return -1;
    return a.inicioEm.localeCompare(b.inicioEm);
  });
}

export function TelaMeusEventos() {
  const timesApi = useTimesApi();
  const partidasApi = usePartidasApi();
  const { executarAutenticado } = useSessao();
  const [partidas, setPartidas] = useState<ItemAgendaPartida[]>([]);
  const [estado, setEstado] = useState<'carregando' | 'pronto' | 'erro'>(
    'carregando',
  );

  useEffect(() => {
    let ativo = true;

    void executarAutenticado(async (token) => {
      const vinculos = await timesApi.listarMeusTimes(token, 1, 100);
      const agendas = await Promise.all(
        vinculos.itens
          .filter((vinculo) => vinculo.time.status === 'ATIVO')
          .map((vinculo) =>
            partidasApi.listarAgenda({
              timeId: vinculo.time.id,
              pagina: 1,
              tamanho: 100,
            }),
          ),
      );

      const unicas = new Map<string, ItemAgendaPartida>();
      for (const agenda of agendas) {
        for (const partida of agenda.itens) {
          unicas.set(partida.partidaId, partida);
        }
      }
      return ordenarPartidas(Array.from(unicas.values()));
    }).then(
      (resultado) => {
        if (!ativo) return;
        setPartidas(resultado);
        setEstado('pronto');
      },
      () => {
        if (!ativo) return;
        setEstado('erro');
      },
    );

    return () => {
      ativo = false;
    };
  }, [executarAutenticado, partidasApi, timesApi]);

  return (
    <>
      <CabecalhoPagina
        title="Meus eventos"
        subtitle="Agenda esportiva dos seus times"
      />

      {estado === 'carregando' ? (
        <p role="status" className="py-8 text-sm text-muted-foreground">
          Carregando seus eventos...
        </p>
      ) : null}

      {estado === 'erro' ? (
        <EstadoRecurso
          kind="error"
          title="Não foi possível carregar a agenda"
          description="Tente novamente mais tarde. Nenhum dado demonstrativo foi usado como substituto."
        />
      ) : null}

      {estado === 'pronto' && partidas.length === 0 ? (
        <EstadoRecurso
          kind="empty"
          title="Nenhum evento encontrado"
          description="Quando um dos seus times tiver uma partida, ela aparecerá aqui."
        />
      ) : null}

      {estado === 'pronto' && partidas.length > 0 ? (
        <div className="divide-y divide-border border-y border-border bg-card">
          {partidas.map((partida) => (
            <article
              key={partida.partidaId}
              className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-center"
            >
              <div>
                <p className="text-xs font-semibold tracking-wide text-green-mid uppercase">
                  {partida.campeonato.nome} · Rodada {partida.rodada}
                </p>
                <h2 className="mt-2 font-display text-xl font-bold uppercase">
                  {partida.mandante.nome} × {partida.visitante.nome}
                </h2>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" aria-hidden="true" />
                    {formatarData(partida.inicioEm)}
                  </span>
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                    {partida.campo?.nome ?? 'Campo a definir'}
                  </span>
                </div>
              </div>
              <Button variant="campoOutline" asChild>
                <Link href={`/partidas/${partida.partidaId}`}>Ver partida</Link>
              </Button>
            </article>
          ))}
        </div>
      ) : null}
    </>
  );
}

'use client';

import { ArrowUpRight, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { DestaquePagina } from '@/components/layout/destaque-pagina';
import { EstadoRecurso } from '@/components/layout/estado-recurso';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCampeonatosApi } from '@/contexts/campeonatos-api';
import { usePartidasApi } from '@/contexts/partidas-api';
import type { CampeonatoConsultado } from '@/types/api/campeonatos';
import type { ItemAgendaPartida } from '@/types/api/partidas';

const estadoLabel: Record<CampeonatoConsultado['status'], string> = {
  EM_INSCRICOES: 'Em inscrições',
  AGUARDANDO_SORTEIO: 'Aguardando sorteio',
  EM_ANDAMENTO: 'Em andamento',
  ENCERRADO: 'Encerrado',
  CANCELADO: 'Cancelado',
};

const formatoLabel: Record<CampeonatoConsultado['formato'], string> = {
  PONTOS_CORRIDOS: 'Pontos corridos',
  MATA_MATA: 'Mata-mata',
  GRUPOS_E_MATA_MATA: 'Grupos e mata-mata',
};

export function TelaDetalhesCampeonato() {
  const { id } = useParams<{ id: string }>();
  const campeonatosApi = useCampeonatosApi();
  const partidasApi = usePartidasApi();
  const [campeonato, setCampeonato] = useState<CampeonatoConsultado | null>(
    null,
  );
  const [partidas, setPartidas] = useState<ItemAgendaPartida[]>([]);
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
      setCampeonato(null);
      setPartidas([]);
      return Promise.all([
        campeonatosApi.consultarCampeonato(id),
        partidasApi.listarAgenda(
          { campeonatoId: id, pagina: 1, tamanho: 20 },
          { signal: controller.signal },
        ),
      ]);
    };
    void carregar().then(
      ([detalhe, agenda]) => {
        if (controller.signal.aborted) return;
        setCampeonato(detalhe);
        setPartidas(agenda.itens);
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
  }, [campeonatosApi, id, partidasApi, tentativa]);

  if (carregando) return <p role="status">Carregando campeonato...</p>;
  if (falhou || !campeonato) {
    return (
      <div className="mx-auto w-full max-w-[1100px] space-y-4 px-4 py-10">
        <EstadoRecurso
          kind="error"
          title="Campeonato não encontrado"
          description="O link pode estar incorreto, a competição pode não estar pública ou a API está indisponível."
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

  return (
    <div className="mx-auto w-full max-w-[1380px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
      <DestaquePagina
        eyebrow={`${formatoLabel[campeonato.formato]} · ${campeonato.municipio.nome}/${campeonato.municipio.uf}`}
        title={campeonato.nome}
        description="Informações e projeções esportivas publicadas pela competição."
        action={
          <span className="border border-accent bg-accent px-3 py-1.5 text-xs font-bold uppercase">
            {estadoLabel[campeonato.status]}
          </span>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          {
            href: `/campeonatos/${id}/participantes`,
            titulo: 'Times participantes',
            descricao: 'Consulte participantes ativos e históricos publicados.',
          },
          {
            href: `/campeonatos/${id}/artilharia`,
            titulo: 'Artilharia',
            descricao:
              'Veja gols derivados exclusivamente de súmulas definitivas.',
          },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group border-t-2 border-green-dark bg-card p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold uppercase">
                  {item.titulo}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.descricao}
                </p>
              </div>
              <ArrowUpRight
                className="h-5 w-5 text-green-dark"
                aria-hidden="true"
              />
            </div>
          </Link>
        ))}
      </div>

      <section className="mt-8" aria-labelledby="agenda-campeonato">
        <h2
          id="agenda-campeonato"
          className="font-display text-3xl font-bold uppercase"
        >
          Agenda publicada
        </h2>
        {partidas.length === 0 ? (
          <EstadoRecurso
            kind="empty"
            title="Nenhuma partida no período padrão"
            description="A agenda pública padrão considera os próximos 30 dias."
          />
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {partidas.map((partida) => (
              <Card key={partida.partidaId} className="p-5">
                <Link href={`/partidas/${partida.partidaId}`} className="block">
                  <p className="font-display text-lg font-semibold">
                    {partida.mandante.nome} × {partida.visitante.nome}
                  </p>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                    {partida.campo?.nome ?? 'Campo a definir'} · Rodada{' '}
                    {partida.rodada}
                  </p>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

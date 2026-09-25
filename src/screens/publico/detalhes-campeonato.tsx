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
import type {
  CampeonatoConsultado,
  FasesPersistidasCampeonato,
} from '@/types/api/campeonatos';
import type {
  ClassificacaoCampeonato,
  DetalhePublicoPartida,
  ItemAgendaPartida,
} from '@/types/api/partidas';

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

const tipoFaseLabel: Record<
  FasesPersistidasCampeonato['fases'][number]['tipo'],
  string
> = {
  PONTOS_CORRIDOS: 'Pontos corridos',
  GRUPOS: 'Fase de grupos',
  MATA_MATA: 'Mata-mata',
};

const estadoPartidaLabel: Record<ItemAgendaPartida['estado'], string> = {
  PENDENTE_AGENDAMENTO: 'A definir',
  AGENDADA: 'Agendada',
  ADIADA: 'Adiada',
  CANCELADA: 'Cancelada',
  ENCERRADA_SUMULA: 'Resultado publicado',
  ENCERRADA_WO: 'Encerrada por W.O.',
};

export function TelaDetalhesCampeonato() {
  const { id } = useParams<{ id: string }>();
  const campeonatosApi = useCampeonatosApi();
  const partidasApi = usePartidasApi();
  const [campeonato, setCampeonato] = useState<CampeonatoConsultado | null>(
    null,
  );
  const [partidas, setPartidas] = useState<ItemAgendaPartida[]>([]);
  const [fases, setFases] = useState<FasesPersistidasCampeonato['fases']>([]);
  const [classificacao, setClassificacao] =
    useState<ClassificacaoCampeonato | null>(null);
  const [resultados, setResultados] = useState<
    Record<string, DetalhePublicoPartida>
  >({});
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
      setFases([]);
      setClassificacao(null);
      setResultados({});

      const [detalhe, agenda, estrutura] = await Promise.all([
        campeonatosApi.consultarCampeonato(id),
        partidasApi.listarAgenda(
          { campeonatoId: id, pagina: 1, tamanho: 20 },
          { signal: controller.signal },
        ),
        campeonatosApi.consultarFases(id),
      ]);
      const fasePrincipal = estrutura.fases[0];
      const encerradas = agenda.itens.filter(
        (partida) =>
          partida.estado === 'ENCERRADA_SUMULA' ||
          partida.estado === 'ENCERRADA_WO',
      );
      const [projecao, detalhesEncerradas] = await Promise.all([
        fasePrincipal
          ? partidasApi.consultarClassificacao(id, fasePrincipal.faseId)
          : Promise.resolve(null),
        Promise.all(
          encerradas.map((partida) =>
            partidasApi.consultarPartida(partida.partidaId, {
              signal: controller.signal,
            }),
          ),
        ),
      ]);
      return { detalhe, agenda, estrutura, projecao, detalhesEncerradas };
    };
    void carregar().then(
      ({ detalhe, agenda, estrutura, projecao, detalhesEncerradas }) => {
        if (controller.signal.aborted) return;
        setCampeonato(detalhe);
        setPartidas(agenda.itens);
        setFases(estrutura.fases);
        setClassificacao(projecao);
        setResultados(
          Object.fromEntries(
            detalhesEncerradas.map((partida) => [partida.partidaId, partida]),
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
        description="Classificação, estrutura e fatos esportivos publicados pela competição."
        action={
          <span className="border border-accent bg-accent px-3 py-1.5 text-xs font-bold uppercase">
            {estadoLabel[campeonato.status]}
          </span>
        }
      />

      <section aria-labelledby="classificacao-campeonato">
        <div className="flex items-end justify-between gap-4 border-b-2 border-green-dark pb-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.15em] text-green-dark uppercase">
              Desempenho oficial
            </p>
            <h2
              id="classificacao-campeonato"
              className="font-display text-3xl font-bold uppercase"
            >
              Classificação
            </h2>
          </div>
          <span className="text-xs font-semibold text-muted-foreground uppercase">
            {classificacao?.estadoProjecao === 'DEFINITIVA'
              ? 'Definitiva'
              : 'Parcial'}
          </span>
        </div>
        {classificacao?.linhas.length ? (
          <div className="mt-3">
            <p className="mb-2 text-xs text-muted-foreground sm:hidden">
              Deslize a tabela para ver todas as estatísticas.
            </p>
            <div className="overflow-x-auto border border-border bg-card">
              <table className="w-full min-w-[680px] border-collapse text-sm">
                <thead className="bg-muted/60 text-xs uppercase">
                  <tr>
                    <th className="px-3 py-3 text-left">Pos.</th>
                    <th className="px-3 py-3 text-left">Time</th>
                    <th className="px-3 py-3 text-center">J</th>
                    <th className="px-3 py-3 text-center">V</th>
                    <th className="px-3 py-3 text-center">E</th>
                    <th className="px-3 py-3 text-center">D</th>
                    <th className="px-3 py-3 text-center">GP</th>
                    <th className="px-3 py-3 text-center">GC</th>
                    <th className="px-3 py-3 text-center">SG</th>
                    <th className="px-3 py-3 text-center">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {classificacao.linhas.map((linha) => (
                    <tr key={linha.timeId} className="border-t border-border">
                      <td className="px-3 py-3 font-display text-lg font-bold">
                        {linha.posicao}º
                      </td>
                      <td className="px-3 py-3 font-semibold">{linha.nome}</td>
                      <td className="px-3 py-3 text-center">{linha.jogos}</td>
                      <td className="px-3 py-3 text-center">
                        {linha.vitorias}
                      </td>
                      <td className="px-3 py-3 text-center">{linha.empates}</td>
                      <td className="px-3 py-3 text-center">
                        {linha.derrotas}
                      </td>
                      <td className="px-3 py-3 text-center">{linha.golsPro}</td>
                      <td className="px-3 py-3 text-center">
                        {linha.golsContra}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {linha.saldoGols}
                      </td>
                      <td className="bg-green-dark px-3 py-3 text-center font-bold text-white">
                        {linha.pontos}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EstadoRecurso
            kind="empty"
            title="Classificação ainda sem resultados"
            description="A tabela será atualizada após a publicação das primeiras súmulas definitivas."
          />
        )}
      </section>

      <section className="mt-10" aria-labelledby="estrutura-campeonato">
        <h2
          id="estrutura-campeonato"
          className="border-b-2 border-green-dark pb-3 font-display text-3xl font-bold uppercase"
        >
          Estrutura da competição
        </h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {fases.map((fase) => (
            <div
              key={fase.faseId}
              className="border-l-4 border-accent bg-card p-5"
            >
              <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                Fase {fase.ordem} · {tipoFaseLabel[fase.tipo]}
              </p>
              <p className="mt-1 font-display text-2xl font-bold uppercase">
                {fase.nome}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {fase.quantidadeTurnos
                  ? `${fase.quantidadeTurnos} turno${fase.quantidadeTurnos > 1 ? 's' : ''}`
                  : 'Confrontos definidos pela organização'}
                {fase.grupos.length > 0
                  ? ` · ${fase.grupos.length} grupo${fase.grupos.length > 1 ? 's' : ''}`
                  : ''}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10" aria-labelledby="partidas-campeonato">
        <h2
          id="partidas-campeonato"
          className="border-b-2 border-green-dark pb-3 font-display text-3xl font-bold uppercase"
        >
          Partidas e resultados
        </h2>
        {partidas.length === 0 ? (
          <EstadoRecurso
            kind="empty"
            title="Nenhuma partida publicada"
            description="Agenda e resultados aparecerão quando forem disponibilizados pela organização."
          />
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {partidas.map((partida) => (
              <Card key={partida.partidaId} className="p-5">
                <Link href={`/partidas/${partida.partidaId}`} className="block">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-display text-lg font-semibold">
                      {partida.mandante.nome} × {partida.visitante.nome}
                    </p>
                    <span className="text-[11px] font-bold text-green-dark uppercase">
                      {estadoPartidaLabel[partida.estado]}
                    </span>
                  </div>
                  {resultados[partida.partidaId]?.resultado ? (
                    <p className="mt-3 font-display text-3xl font-extrabold text-green-dark">
                      {
                        resultados[partida.partidaId]?.resultado
                          ?.placarRegulamentar.mandante
                      }{' '}
                      ×{' '}
                      {
                        resultados[partida.partidaId]?.resultado
                          ?.placarRegulamentar.visitante
                      }
                    </p>
                  ) : null}
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

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {[
          {
            href: `/campeonatos/${id}/participantes`,
            titulo: 'Times participantes',
            descricao: 'Consulte os times e seus elencos publicados.',
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
    </div>
  );
}

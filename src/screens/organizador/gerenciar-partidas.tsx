'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { CabecalhoPagina } from '@/components/layout/cabecalho-pagina';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePartidasApi } from '@/contexts/partidas-api';
import { useSessao } from '@/hooks/use-sessao';
import { carregarPartidasAdministrativas } from '@/services/partidas/carregar-partidas-administrativas';
import type {
  DetalheAdministrativoPartida,
  ItemAgendaPartida,
  RegistroWo,
} from '@/types/api/partidas';

type EstadoCarregamento = 'carregando' | 'pronto' | 'erro';
type Operacao = 'AGENDAR' | 'REAGENDAR' | 'ADIAR' | 'CANCELAR';
type CategoriaCancelamento =
  'DECISAO_ADMINISTRATIVA' | 'DESISTENCIA' | 'FORCA_MAIOR';

const doisDigitos = (valor: number) => String(valor).padStart(2, '0');

function obterDataHoraLocal(dataIso: string | null) {
  if (!dataIso) return { data: '', hora: '' };
  const inicio = new Date(dataIso);
  return {
    data: `${inicio.getFullYear()}-${doisDigitos(inicio.getMonth() + 1)}-${doisDigitos(inicio.getDate())}`,
    hora: `${doisDigitos(inicio.getHours())}:${doisDigitos(inicio.getMinutes())}`,
  };
}

export function TelaGerenciarPartidas({
  campeonatoId,
  incorporada = false,
}: {
  campeonatoId: string;
  incorporada?: boolean;
}) {
  const partidasApi = usePartidasApi();
  const { hydrated, session, executarAutenticado } = useSessao();
  const [agenda, setAgenda] = useState<ItemAgendaPartida[]>([]);
  const [detalhes, setDetalhes] = useState<
    Record<string, DetalheAdministrativoPartida>
  >({});
  const [estadoCarregamento, setEstadoCarregamento] =
    useState<EstadoCarregamento>('carregando');
  const [operacao, setOperacao] = useState<{
    tipo: Operacao;
    partidaId: string;
  } | null>(null);
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [campoId, setCampoId] = useState('');
  const [autorizacaoExternaConfirmada, setAutorizacaoExternaConfirmada] =
    useState(false);
  const [motivo, setMotivo] = useState('');
  const [categoriaCancelamento, setCategoriaCancelamento] =
    useState<CategoriaCancelamento>('DECISAO_ADMINISTRATIVA');
  const [enviando, setEnviando] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [partidaWo, setPartidaWo] = useState<ItemAgendaPartida | null>(null);
  const [vencedorWo, setVencedorWo] = useState('');
  const [justificativaWo, setJustificativaWo] = useState(
    'Ausência da equipe adversária',
  );
  const [revisaoWo, setRevisaoWo] = useState<{
    partidaId: string;
    input: RegistroWo;
  } | null>(null);
  const chaveWo = useRef<string | null>(null);
  const geracaoCarregamento = useRef(0);
  const controleCarregamento = useRef<AbortController | null>(null);
  const identidadeSessao = `${campeonatoId}:${session?.sessionId ?? ''}:${session?.account.id ?? ''}`;
  const identidadeSessaoAtual = useRef(identidadeSessao);
  useLayoutEffect(() => {
    controleCarregamento.current?.abort();
    identidadeSessaoAtual.current = identidadeSessao;
    geracaoCarregamento.current += 1;
  }, [identidadeSessao]);

  const iniciarCarregamento = useCallback(() => {
    controleCarregamento.current?.abort();
    const controller = new AbortController();
    controleCarregamento.current = controller;
    return {
      controller,
      geracao: ++geracaoCarregamento.current,
    };
  }, []);

  const abrirOperacao = (
    tipo: Operacao,
    partida: ItemAgendaPartida,
    detalhe: DetalheAdministrativoPartida,
  ) => {
    const inicioLocal = obterDataHoraLocal(detalhe.agendamento.inicioEm);
    setData(inicioLocal.data);
    setHora(inicioLocal.hora);
    setCampoId(detalhe.agendamento.campoId ?? partida.campo?.id ?? '');
    setAutorizacaoExternaConfirmada(false);
    setMotivo('');
    setCategoriaCancelamento('DECISAO_ADMINISTRATIVA');
    setFeedback('');
    setOperacao({ tipo, partidaId: partida.partidaId });
  };

  const buscarPartidas = useCallback(
    (signal: AbortSignal) =>
      carregarPartidasAdministrativas({
        api: partidasApi,
        campeonatoId,
        executarAutenticado,
        signal,
      }),
    [campeonatoId, executarAutenticado, partidasApi],
  );

  const carregar = useCallback(
    async (identidadeEsperada = identidadeSessao) => {
      const { controller, geracao: geracaoEsperada } = iniciarCarregamento();
      setEstadoCarregamento('carregando');
      try {
        const { partidas, detalhes } = await buscarPartidas(controller.signal);
        if (
          identidadeSessaoAtual.current !== identidadeEsperada ||
          geracaoCarregamento.current !== geracaoEsperada
        )
          return;
        setAgenda(partidas);
        setDetalhes(
          Object.fromEntries(
            detalhes.map((detalhe) => [detalhe.partidaId, detalhe]),
          ),
        );
        setEstadoCarregamento('pronto');
      } catch {
        if (
          identidadeSessaoAtual.current === identidadeEsperada &&
          geracaoCarregamento.current === geracaoEsperada
        )
          setEstadoCarregamento('erro');
      }
    },
    [buscarPartidas, identidadeSessao, iniciarCarregamento],
  );

  const atualizarAposMutacao = useCallback(
    async (identidadeEsperada: string) => {
      const { controller, geracao: geracaoEsperada } = iniciarCarregamento();
      try {
        const { partidas, detalhes } = await buscarPartidas(controller.signal);
        if (
          identidadeSessaoAtual.current !== identidadeEsperada ||
          geracaoCarregamento.current !== geracaoEsperada
        )
          return false;
        setAgenda(partidas);
        setDetalhes(
          Object.fromEntries(
            detalhes.map((detalhe) => [detalhe.partidaId, detalhe]),
          ),
        );
        return true;
      } catch (error) {
        if (
          controller.signal.aborted ||
          identidadeSessaoAtual.current !== identidadeEsperada ||
          geracaoCarregamento.current !== geracaoEsperada
        ) {
          return false;
        }
        throw error;
      }
    },
    [buscarPartidas, iniciarCarregamento],
  );

  useEffect(() => {
    if (!hydrated) return;
    const identidadeEsperada = identidadeSessao;
    const { controller, geracao: geracaoEsperada } = iniciarCarregamento();
    void Promise.resolve().then(() => {
      if (controller.signal.aborted) return;
      setAgenda([]);
      setDetalhes({});
      setEstadoCarregamento('carregando');
      setOperacao(null);
      setData('');
      setHora('');
      setCampoId('');
      setAutorizacaoExternaConfirmada(false);
      setMotivo('');
      setCategoriaCancelamento('DECISAO_ADMINISTRATIVA');
      setEnviando(false);
      setFeedback('');
      setPartidaWo(null);
      setVencedorWo('');
      setJustificativaWo('Ausência da equipe adversária');
      setRevisaoWo(null);
      chaveWo.current = null;
    });
    void buscarPartidas(controller.signal).then(
      ({ partidas, detalhes }) => {
        if (
          controller.signal.aborted ||
          identidadeSessaoAtual.current !== identidadeEsperada ||
          geracaoCarregamento.current !== geracaoEsperada
        )
          return;
        setAgenda(partidas);
        setDetalhes(
          Object.fromEntries(
            detalhes.map((detalhe) => [detalhe.partidaId, detalhe]),
          ),
        );
        setEstadoCarregamento('pronto');
      },
      () => {
        if (
          !controller.signal.aborted &&
          identidadeSessaoAtual.current === identidadeEsperada &&
          geracaoCarregamento.current === geracaoEsperada
        )
          setEstadoCarregamento('erro');
      },
    );
    return () => {
      controller.abort();
    };
  }, [buscarPartidas, hydrated, identidadeSessao, iniciarCarregamento]);

  if (!hydrated || estadoCarregamento === 'carregando') {
    return <p role="status">Carregando partidas...</p>;
  }

  if (estadoCarregamento === 'erro') {
    return (
      <Card className="p-5">
        <h1 className="font-display text-xl font-semibold">
          Não foi possível carregar as partidas
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Confira sua conexão e tente novamente.
        </p>
        <Button
          className="mt-4"
          variant="campoOutline"
          onClick={() => void carregar(identidadeSessao)}
        >
          Tentar novamente
        </Button>
      </Card>
    );
  }

  const nomeCampeonato = agenda[0]?.campeonato.nome ?? 'Campeonato';

  return (
    <>
      {!incorporada ? (
        <CabecalhoPagina
          title={`Partidas · ${nomeCampeonato}`}
          subtitle="Agendamento e exceções conforme as permissões publicadas"
        />
      ) : (
        <div className="mb-6">
          <h2 className="font-display text-2xl font-semibold">Partidas</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Agendamento e exceções conforme as permissões publicadas.
          </p>
        </div>
      )}

      {agenda.length === 0 ? (
        <Card className="p-5">
          <h2 className="font-display text-xl font-semibold">
            Nenhuma partida encontrada
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            A programação aparecerá aqui quando os confrontos forem publicados.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {agenda.map((partida) => {
            const detalhe = detalhes[partida.partidaId];
            if (!detalhe) return null;
            const permite = (operacao: string) =>
              detalhe.operacoesPermitidas.includes(operacao);
            return (
              <Card key={partida.partidaId} className="p-5">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                  <div>
                    <h2 className="font-display text-lg font-semibold">
                      {partida.mandante.nome} × {partida.visitante.nome}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Rodada {partida.rodada} ·{' '}
                      {detalhe?.estado ?? partida.estado}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {partida.inicioEm
                        ? new Date(partida.inicioEm).toLocaleString('pt-BR')
                        : 'Data e horário a definir'}{' '}
                      · {partida.campo?.nome ?? 'Campo a definir'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {permite('AGENDAR') ? (
                      <Button
                        size="sm"
                        variant="campoOutline"
                        aria-label={`Agendar partida ${partida.partidaId}`}
                        onClick={() =>
                          abrirOperacao('AGENDAR', partida, detalhe)
                        }
                      >
                        Agendar
                      </Button>
                    ) : null}
                    {permite('REAGENDAR') ? (
                      <Button
                        size="sm"
                        variant="campoOutline"
                        aria-label={`Reagendar partida ${partida.partidaId}`}
                        onClick={() =>
                          abrirOperacao('REAGENDAR', partida, detalhe)
                        }
                      >
                        Reagendar
                      </Button>
                    ) : null}
                    {permite('ADIAR') ? (
                      <Button
                        size="sm"
                        variant="campoOutline"
                        aria-label={`Adiar partida ${partida.partidaId}`}
                        onClick={() => abrirOperacao('ADIAR', partida, detalhe)}
                      >
                        Adiar
                      </Button>
                    ) : null}
                    {permite('CANCELAR') ? (
                      <Button
                        size="sm"
                        variant="campoOutline"
                        aria-label={`Cancelar partida ${partida.partidaId}`}
                        onClick={() =>
                          abrirOperacao('CANCELAR', partida, detalhe)
                        }
                      >
                        Cancelar
                      </Button>
                    ) : null}
                    {permite('REGISTRAR_WO') ? (
                      <Button
                        size="sm"
                        variant="campo"
                        aria-label={`Registrar WO na partida ${partida.partidaId}`}
                        onClick={() => {
                          chaveWo.current = null;
                          setPartidaWo(partida);
                          setVencedorWo(partida.mandante.timeId);
                          setJustificativaWo('Ausência da equipe adversária');
                          setRevisaoWo(null);
                          setFeedback('');
                        }}
                      >
                        Registrar WO
                      </Button>
                    ) : null}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {operacao ? (
        <Card className="mt-6 p-5">
          <h2 className="font-display text-lg font-semibold">
            {operacao.tipo} · partida {operacao.partidaId}
          </h2>
          {operacao.tipo === 'AGENDAR' || operacao.tipo === 'REAGENDAR' ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Input
                aria-label="Nova data"
                type="date"
                value={data}
                onChange={(event) => setData(event.target.value)}
              />
              <Input
                aria-label="Novo horário"
                type="time"
                value={hora}
                onChange={(event) => setHora(event.target.value)}
              />
              <Input
                aria-label="Campo (UUID)"
                value={campoId}
                onChange={(event) => setCampoId(event.target.value)}
                placeholder="UUID do campo autorizado"
              />
            </div>
          ) : null}
          {operacao.tipo !== 'AGENDAR' ? (
            <label
              className="mt-4 block text-sm font-semibold"
              htmlFor="motivo-operacao"
            >
              Motivo da operação
              <Input
                id="motivo-operacao"
                className="mt-2"
                value={motivo}
                onChange={(event) => setMotivo(event.target.value)}
              />
            </label>
          ) : null}
          {operacao.tipo === 'AGENDAR' || operacao.tipo === 'REAGENDAR' ? (
            <label className="mt-4 flex items-start gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                className="mt-1"
                checked={autorizacaoExternaConfirmada}
                onChange={(event) =>
                  setAutorizacaoExternaConfirmada(event.target.checked)
                }
              />
              Confirmo que o campo e o horário foram autorizados externamente
            </label>
          ) : null}
          {operacao.tipo === 'CANCELAR' ? (
            <label
              className="mt-4 block text-sm font-semibold"
              htmlFor="categoria-cancelamento"
            >
              Categoria pública
              <select
                id="categoria-cancelamento"
                className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3"
                value={categoriaCancelamento}
                onChange={(event) =>
                  setCategoriaCancelamento(
                    event.target.value as CategoriaCancelamento,
                  )
                }
              >
                <option value="DECISAO_ADMINISTRATIVA">
                  Decisão administrativa
                </option>
                <option value="DESISTENCIA">Desistência</option>
                <option value="FORCA_MAIOR">Força maior</option>
              </select>
            </label>
          ) : null}
          <div className="mt-4 flex gap-2">
            <Button
              variant="campo"
              aria-label={
                operacao.tipo === 'ADIAR'
                  ? 'Confirmar adiamento'
                  : operacao.tipo === 'CANCELAR'
                    ? 'Confirmar cancelamento'
                    : 'Confirmar agendamento'
              }
              disabled={
                enviando ||
                (operacao.tipo !== 'AGENDAR' && !motivo.trim()) ||
                ((operacao.tipo === 'AGENDAR' ||
                  operacao.tipo === 'REAGENDAR') &&
                  (!data ||
                    !hora ||
                    !campoId.trim() ||
                    !autorizacaoExternaConfirmada))
              }
              onClick={async () => {
                const detalhe = detalhes[operacao.partidaId];
                if (!detalhe) return;
                const identidadeDaOperacao = identidadeSessao;
                setEnviando(true);
                try {
                  await executarAutenticado<unknown>(
                    (accessToken): Promise<unknown> => {
                      if (
                        operacao.tipo === 'AGENDAR' ||
                        operacao.tipo === 'REAGENDAR'
                      ) {
                        return partidasApi.salvarAgendamento(
                          operacao.partidaId,
                          accessToken,
                          {
                            inicioEm: new Date(
                              `${data}T${hora}:00`,
                            ).toISOString(),
                            campoId: campoId.trim(),
                            autorizacaoExternaConfirmada: true,
                            motivo:
                              operacao.tipo === 'REAGENDAR'
                                ? motivo.trim()
                                : null,
                            versaoEsperada: detalhe.agendamento.versao,
                          },
                        );
                      }
                      if (operacao.tipo === 'ADIAR') {
                        return partidasApi.adiarPartida(
                          operacao.partidaId,
                          accessToken,
                          {
                            motivo: motivo.trim(),
                            confirmacao: true,
                            versaoEsperada: detalhe.agendamento.versao,
                          },
                        );
                      }
                      return partidasApi.cancelarPartida(
                        operacao.partidaId,
                        accessToken,
                        {
                          motivo: motivo.trim(),
                          categoriaPublica: categoriaCancelamento,
                          confirmacao: true,
                          versaoEsperada: detalhe.agendamento.versao,
                        },
                      );
                    },
                  );
                  if (identidadeSessaoAtual.current !== identidadeDaOperacao) {
                    return;
                  }
                  const feedbackPorOperacao: Record<Operacao, string> = {
                    AGENDAR: 'Agendamento salvo.',
                    REAGENDAR: 'Reagendamento salvo.',
                    ADIAR: 'Partida adiada.',
                    CANCELAR: 'Partida cancelada.',
                  };
                  setOperacao(null);
                  setFeedback(feedbackPorOperacao[operacao.tipo]);
                  try {
                    await atualizarAposMutacao(identidadeDaOperacao);
                  } catch {
                    if (
                      identidadeSessaoAtual.current === identidadeDaOperacao
                    ) {
                      setFeedback(
                        `${feedbackPorOperacao[operacao.tipo].slice(0, -1)}, mas não foi possível atualizar as partidas.`,
                      );
                    }
                  }
                } catch {
                  if (identidadeSessaoAtual.current === identidadeDaOperacao) {
                    setFeedback('Não foi possível concluir a operação.');
                  }
                } finally {
                  if (identidadeSessaoAtual.current === identidadeDaOperacao) {
                    setEnviando(false);
                  }
                }
              }}
            >
              Confirmar operação
            </Button>
            <Button variant="campoOutline" onClick={() => setOperacao(null)}>
              Voltar
            </Button>
          </div>
        </Card>
      ) : null}

      {partidaWo ? (
        <Card className="mt-6 p-5">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-display text-lg font-semibold">
              Registrar WO na partida {partidaWo.partidaId}
            </h2>
            <Button
              size="sm"
              variant="campoOutline"
              onClick={() => {
                chaveWo.current = null;
                setPartidaWo(null);
                setRevisaoWo(null);
                setFeedback('');
              }}
            >
              Fechar registro de WO
            </Button>
          </div>
          <label
            className="mt-4 block text-sm font-semibold"
            htmlFor="vencedor-wo"
          >
            Time vencedor por WO
            <select
              id="vencedor-wo"
              className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3"
              value={vencedorWo}
              disabled={Boolean(revisaoWo)}
              onChange={(event) => setVencedorWo(event.target.value)}
            >
              <option value={partidaWo.mandante.timeId}>
                {partidaWo.mandante.nome}
              </option>
              <option value={partidaWo.visitante.timeId}>
                {partidaWo.visitante.nome}
              </option>
            </select>
          </label>
          <label
            className="mt-4 block text-sm font-semibold"
            htmlFor="justificativa-wo"
          >
            Justificativa do WO
            <Input
              id="justificativa-wo"
              className="mt-2"
              value={justificativaWo}
              disabled={Boolean(revisaoWo)}
              onChange={(event) => setJustificativaWo(event.target.value)}
            />
          </label>
          {!revisaoWo ? (
            <Button
              className="mt-4"
              variant="campo"
              disabled={!vencedorWo || !justificativaWo.trim()}
              onClick={() => {
                chaveWo.current = null;
                setRevisaoWo({
                  partidaId: partidaWo.partidaId,
                  input: {
                    confirmacaoDefinitiva: true,
                    timeBeneficiadoId: vencedorWo,
                    fundamentoCodigo: 'AUSENCIA',
                    justificativa: justificativaWo.trim(),
                    referenciaAdministrativa: null,
                  },
                });
              }}
            >
              Revisar WO definitivo
            </Button>
          ) : (
            <div role="alert" className="mt-4 border border-warning p-4">
              <p className="text-sm">
                Confirme o registro definitivo. O WO encerrará a partida e
                publicará o placar regulamentar.
              </p>
              <div className="mt-3 flex gap-2">
                <Button
                  variant="campoOutline"
                  onClick={() => {
                    chaveWo.current = null;
                    setRevisaoWo(null);
                  }}
                >
                  Voltar à edição
                </Button>
                <Button
                  variant="campo"
                  disabled={enviando}
                  onClick={async () => {
                    const identidadeDaOperacao = identidadeSessao;
                    const chaveDaOperacao =
                      chaveWo.current ??
                      globalThis.crypto?.randomUUID?.() ??
                      `wo-${Date.now()}`;
                    chaveWo.current = chaveDaOperacao;
                    setEnviando(true);
                    try {
                      await executarAutenticado((accessToken) =>
                        partidasApi.registrarWo(
                          revisaoWo.partidaId,
                          accessToken,
                          revisaoWo.input,
                          chaveDaOperacao,
                        ),
                      );
                      if (
                        identidadeSessaoAtual.current !== identidadeDaOperacao
                      ) {
                        return;
                      }
                      chaveWo.current = null;
                      setPartidaWo(null);
                      setRevisaoWo(null);
                      setFeedback('WO registrado definitivamente.');
                      try {
                        await atualizarAposMutacao(identidadeDaOperacao);
                      } catch {
                        if (
                          identidadeSessaoAtual.current === identidadeDaOperacao
                        ) {
                          setFeedback(
                            'WO registrado definitivamente, mas não foi possível atualizar as partidas.',
                          );
                        }
                      }
                    } catch {
                      if (
                        identidadeSessaoAtual.current === identidadeDaOperacao
                      ) {
                        setFeedback(
                          'Não foi possível registrar o WO. Tente novamente.',
                        );
                      }
                    } finally {
                      if (
                        identidadeSessaoAtual.current === identidadeDaOperacao
                      ) {
                        setEnviando(false);
                      }
                    }
                  }}
                >
                  Registrar WO definitivo
                </Button>
              </div>
            </div>
          )}
        </Card>
      ) : null}

      {feedback ? (
        <p role="status" className="mt-5 text-sm font-semibold">
          {feedback}
        </p>
      ) : null}
    </>
  );
}

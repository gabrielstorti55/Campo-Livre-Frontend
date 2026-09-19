'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { useSessao } from '@/hooks/use-sessao';
import { useCampeonatosApi } from '@/contexts/campeonatos-api';
import { useTimesApi } from '@/contexts/times-api';
import type { TimeResumido } from '@/types/api/times';
import type {
  ConviteCampeonatoEnviado,
  DetalheAdministrativoCampeonato,
  ElencoContextualCampeonato,
  PaginaTimesParticipantes,
} from '@/types/api/campeonatos';

import { CabecalhoPagina } from '@/components/layout/cabecalho-pagina';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const rotulosStatusConvite: Record<ConviteCampeonatoEnviado['status'], string> =
  {
    PENDENTE: 'Pendente',
    ACEITO: 'Aceito',
    RECUSADO: 'Recusado',
    CANCELADO: 'Cancelado',
    EXPIRADO: 'Expirado',
  };

const TAMANHO_PAGINA = 100;

type EstadoElenco =
  | { situacao: 'carregando' }
  | { situacao: 'erro' }
  | { situacao: 'pronto'; dados: ElencoContextualCampeonato };

export function TelaGerenciarTimes({
  campeonatoId,
  incorporada = false,
}: {
  campeonatoId: string;
  incorporada?: boolean;
}) {
  const { hydrated, session, executarAutenticado } = useSessao();
  const campeonatosApi = useCampeonatosApi();
  const timesApi = useTimesApi();
  const [campeonato, setCampeonato] =
    useState<DetalheAdministrativoCampeonato | null>(null);
  const [timeConvidado, setTimeConvidado] = useState('');
  const [timesDisponiveis, setTimesDisponiveis] = useState<TimeResumido[]>([]);
  const [participantes, setParticipantes] = useState<
    PaginaTimesParticipantes['itens']
  >([]);
  const [carregandoParticipantes, setCarregandoParticipantes] = useState(true);
  const [paginaParticipantes, setPaginaParticipantes] = useState(1);
  const [totalPaginasParticipantes, setTotalPaginasParticipantes] = useState(1);
  const [convites, setConvites] = useState<ConviteCampeonatoEnviado[]>([]);
  const [carregandoConvites, setCarregandoConvites] = useState(true);
  const [erroConvites, setErroConvites] = useState('');
  const [conviteCancelandoId, setConviteCancelandoId] = useState<string | null>(
    null,
  );
  const [erroCancelamentoId, setErroCancelamentoId] = useState<string | null>(
    null,
  );
  const [elencos, setElencos] = useState<Record<string, EstadoElenco>>({});
  const [feedback, setFeedback] = useState('');
  const identidadeSessao = `${campeonatoId}:${session?.sessionId ?? ''}:${session?.account.id ?? ''}`;
  const identidadeSessaoAtual = useRef(identidadeSessao);
  useLayoutEffect(() => {
    identidadeSessaoAtual.current = identidadeSessao;
  }, [identidadeSessao]);

  useEffect(() => {
    if (!hydrated) return;
    let ativo = true;
    void Promise.resolve().then(() => ativo && setCampeonato(null));
    executarAutenticado((accessToken) =>
      campeonatosApi.consultarAdministracao(campeonatoId, accessToken),
    ).then(
      (detalhe) => ativo && setCampeonato(detalhe),
      () => ativo && setFeedback('Não foi possível carregar a administração.'),
    );
    return () => {
      ativo = false;
    };
    // A identidade do Campeonato dirige a projeção administrativa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campeonatoId, hydrated, session?.sessionId, session?.account.id]);

  useEffect(() => {
    let ativo = true;
    (async () => {
      const primeira = await timesApi.listarTimes({
        pagina: 1,
        tamanho: TAMANHO_PAGINA,
      });
      const itens = [...primeira.itens];
      for (let pagina = 2; pagina <= primeira.totalPaginas; pagina += 1) {
        const proxima = await timesApi.listarTimes({
          pagina,
          tamanho: TAMANHO_PAGINA,
        });
        itens.push(...proxima.itens);
      }
      return itens;
    })()
      .then((itens) => {
        if (!ativo) return;
        setTimesDisponiveis(itens);
        setTimeConvidado((atual) => atual || itens[0]?.id || '');
      })
      .catch(() => ativo && setFeedback('Não foi possível carregar os times.'));
    return () => {
      ativo = false;
    };
  }, [timesApi]);

  useEffect(() => {
    if (!hydrated) return;
    let ativo = true;
    void Promise.resolve().then(() => {
      if (!ativo) return;
      setConvites([]);
      setErroConvites('');
      setCarregandoConvites(true);
    });
    executarAutenticado(async (accessToken) => {
      const primeira = await campeonatosApi.listarConvitesEnviados(
        campeonatoId,
        accessToken,
        1,
        TAMANHO_PAGINA,
      );
      const itens = [...primeira.itens];
      for (let pagina = 2; pagina <= primeira.totalPaginas; pagina += 1) {
        const proxima = await campeonatosApi.listarConvitesEnviados(
          campeonatoId,
          accessToken,
          pagina,
          TAMANHO_PAGINA,
        );
        itens.push(...proxima.itens);
      }
      return itens;
    })
      .then((itens) => {
        if (ativo) {
          setConvites(itens);
          setErroConvites('');
        }
      })
      .catch(() => {
        if (ativo)
          setErroConvites('Não foi possível carregar os convites enviados.');
      })
      .finally(() => {
        if (ativo) setCarregandoConvites(false);
      });
    return () => {
      ativo = false;
    };
  }, [
    campeonatoId,
    hydrated,
    session?.sessionId,
    session?.account.id,
    campeonatosApi,
    executarAutenticado,
  ]);

  useEffect(() => {
    if (!hydrated) return;
    let ativo = true;
    void Promise.resolve().then(() => {
      if (!ativo) return;
      setParticipantes([]);
      setElencos({});
      setPaginaParticipantes(1);
      setTotalPaginasParticipantes(1);
      setCarregandoParticipantes(true);
    });
    campeonatosApi
      .listarTimesParticipantes(campeonatoId, undefined, 1, 100)
      .then((pagina) => {
        if (!ativo) return;
        setParticipantes(pagina.itens);
        setPaginaParticipantes(pagina.pagina);
        setTotalPaginasParticipantes(pagina.totalPaginas);
        setElencos(
          Object.fromEntries(
            pagina.itens.map((time) => [
              time.timeId,
              { situacao: 'carregando' },
            ]),
          ),
        );
        pagina.itens.forEach((time) => {
          void executarAutenticado((accessToken) =>
            campeonatosApi.consultarElencoContextual(
              campeonatoId,
              time.timeId,
              accessToken,
            ),
          ).then(
            (dados) => {
              if (ativo) {
                setElencos((atuais) => ({
                  ...atuais,
                  [time.timeId]: { situacao: 'pronto', dados },
                }));
              }
            },
            () => {
              if (ativo) {
                setElencos((atuais) => ({
                  ...atuais,
                  [time.timeId]: { situacao: 'erro' },
                }));
              }
            },
          );
        });
      })
      .catch(() => {
        if (ativo) setFeedback('Não foi possível carregar os participantes.');
      })
      .finally(() => {
        if (ativo) setCarregandoParticipantes(false);
      });
    return () => {
      ativo = false;
    };
  }, [
    campeonatoId,
    hydrated,
    session?.sessionId,
    session?.account.id,
    campeonatosApi,
    executarAutenticado,
  ]);

  async function carregarMaisParticipantes() {
    const identidadeDaOperacao = identidadeSessao;
    const proximaPagina = paginaParticipantes + 1;
    setCarregandoParticipantes(true);
    try {
      const pagina = await campeonatosApi.listarTimesParticipantes(
        campeonatoId,
        undefined,
        proximaPagina,
        100,
      );
      if (identidadeSessaoAtual.current !== identidadeDaOperacao) return;
      setParticipantes((atual) => [...atual, ...pagina.itens]);
      setPaginaParticipantes(pagina.pagina);
      setTotalPaginasParticipantes(pagina.totalPaginas);
      setElencos((atuais) => ({
        ...atuais,
        ...Object.fromEntries(
          pagina.itens.map((time) => [time.timeId, { situacao: 'carregando' }]),
        ),
      }));
      pagina.itens.forEach((time) => {
        void executarAutenticado((accessToken) =>
          campeonatosApi.consultarElencoContextual(
            campeonatoId,
            time.timeId,
            accessToken,
          ),
        ).then(
          (dados) => {
            if (identidadeSessaoAtual.current === identidadeDaOperacao)
              setElencos((atuais) => ({
                ...atuais,
                [time.timeId]: { situacao: 'pronto', dados },
              }));
          },
          () => {
            if (identidadeSessaoAtual.current === identidadeDaOperacao)
              setElencos((atuais) => ({
                ...atuais,
                [time.timeId]: { situacao: 'erro' },
              }));
          },
        );
      });
    } catch {
      if (identidadeSessaoAtual.current === identidadeDaOperacao)
        setFeedback(
          'Não foi possível carregar a próxima página de participantes.',
        );
    } finally {
      if (identidadeSessaoAtual.current === identidadeDaOperacao)
        setCarregandoParticipantes(false);
    }
  }

  async function cancelarConvite(convite: ConviteCampeonatoEnviado) {
    const identidadeDaOperacao = identidadeSessao;
    setConviteCancelandoId(convite.conviteId);
    setErroCancelamentoId(null);
    try {
      const cancelamento = await executarAutenticado((accessToken) =>
        campeonatosApi.cancelarConviteTime(
          campeonatoId,
          convite.conviteId,
          accessToken,
        ),
      );
      if (identidadeSessaoAtual.current !== identidadeDaOperacao) return;
      setConvites((atuais) =>
        atuais.map((item) =>
          item.conviteId === convite.conviteId
            ? {
                ...item,
                status: 'CANCELADO',
                podeCancelar: false,
                encerradoEm: cancelamento.canceladoEm,
              }
            : item,
        ),
      );
      setFeedback('Convite cancelado.');
    } catch {
      if (identidadeSessaoAtual.current === identidadeDaOperacao)
        setErroCancelamentoId(convite.conviteId);
    } finally {
      if (identidadeSessaoAtual.current === identidadeDaOperacao)
        setConviteCancelandoId(null);
    }
  }

  if (!hydrated || !campeonato)
    return <p role="status">Carregando participantes...</p>;

  const podeGerenciarConvites =
    campeonato.autoridade.permissoes.includes('GERENCIAR_CONVITES');
  const podeConvidar =
    podeGerenciarConvites &&
    campeonato.operacoesPermitidas.includes('CONVIDAR_TIME');

  return (
    <>
      {!incorporada ? (
        <CabecalhoPagina
          title={`Times · ${campeonato.nome}`}
          subtitle="Participação exclusiva por convite ao capitão"
        />
      ) : (
        <div className="mb-6">
          <h2 className="font-display text-2xl font-semibold">Participantes</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Convites, times inscritos e validação dos elencos deste campeonato.
          </p>
        </div>
      )}

      {campeonato.status === 'EM_INSCRICOES' && podeConvidar ? (
        <Card className="mb-8 p-5">
          <h2 className="font-display text-xl font-semibold">Convidar time</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            O capitão só poderá aceitar depois da abertura das inscrições. Não
            existe solicitação aberta do time.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <label
              className="flex-1 text-sm font-semibold"
              htmlFor="time-convidado"
            >
              Time para convidar
              <select
                id="time-convidado"
                className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 font-normal"
                value={timeConvidado}
                onChange={(event) => setTimeConvidado(event.target.value)}
              >
                {timesDisponiveis.map((time) => (
                  <option key={time.id} value={time.id}>
                    {time.nome}
                  </option>
                ))}
              </select>
            </label>
            <Button
              variant="campo"
              className="self-end"
              disabled={!timeConvidado}
              onClick={async () => {
                const identidadeDaOperacao = identidadeSessao;
                try {
                  await executarAutenticado((accessToken) =>
                    campeonatosApi.convidarTime(
                      campeonatoId,
                      timeConvidado,
                      accessToken,
                    ),
                  );
                  if (identidadeSessaoAtual.current !== identidadeDaOperacao)
                    return;
                  setFeedback('Convite enviado ao capitão do time.');
                  try {
                    const convitesAtualizados = await executarAutenticado(
                      async (accessToken) => {
                        const primeira =
                          await campeonatosApi.listarConvitesEnviados(
                            campeonatoId,
                            accessToken,
                            1,
                            TAMANHO_PAGINA,
                          );
                        const itens = [...primeira.itens];
                        for (
                          let pagina = 2;
                          pagina <= primeira.totalPaginas;
                          pagina += 1
                        ) {
                          const proxima =
                            await campeonatosApi.listarConvitesEnviados(
                              campeonatoId,
                              accessToken,
                              pagina,
                              TAMANHO_PAGINA,
                            );
                          itens.push(...proxima.itens);
                        }
                        return itens;
                      },
                    );
                    if (identidadeSessaoAtual.current !== identidadeDaOperacao)
                      return;
                    setConvites(convitesAtualizados);
                    setErroConvites('');
                  } catch {
                    if (identidadeSessaoAtual.current === identidadeDaOperacao)
                      setErroConvites(
                        'Convite enviado, mas não foi possível atualizar a lista.',
                      );
                  }
                } catch {
                  if (identidadeSessaoAtual.current === identidadeDaOperacao)
                    setFeedback('Não foi possível enviar o convite.');
                }
              }}
            >
              Enviar convite
            </Button>
          </div>
        </Card>
      ) : null}

      <section className="mb-8" aria-labelledby="convites-enviados-titulo">
        <h2
          id="convites-enviados-titulo"
          className="font-display text-xl font-semibold"
        >
          Convites enviados
        </h2>
        {carregandoConvites ? (
          <p className="mt-3 text-sm text-muted-foreground" role="status">
            Carregando convites enviados...
          </p>
        ) : erroConvites ? (
          <p className="mt-3 text-sm text-destructive" role="alert">
            {erroConvites}
          </p>
        ) : convites.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Nenhum convite enviado.
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            {convites.map((convite) => (
              <Card className="p-4" key={convite.conviteId}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      {convite.time.nome} · {convite.time.sigla}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Capitão: {convite.destinatario.nome}
                    </p>
                  </div>
                  <span className="text-sm font-semibold">
                    {rotulosStatusConvite[convite.status]}
                  </span>
                </div>
                {erroCancelamentoId === convite.conviteId ? (
                  <p className="mt-3 text-sm text-destructive" role="alert">
                    Não foi possível cancelar o convite. Tente novamente.
                  </p>
                ) : null}
                {convite.podeCancelar && podeGerenciarConvites ? (
                  <Button
                    className="mt-3"
                    size="sm"
                    variant="campoOutline"
                    aria-label={`Cancelar convite de ${convite.time.nome}`}
                    disabled={conviteCancelandoId === convite.conviteId}
                    onClick={() => void cancelarConvite(convite)}
                  >
                    {conviteCancelandoId === convite.conviteId
                      ? 'Cancelando...'
                      : 'Cancelar convite'}
                  </Button>
                ) : null}
              </Card>
            ))}
          </div>
        )}
      </section>

      <div className="space-y-4">
        {carregandoParticipantes ? (
          <p role="status">Carregando times inscritos...</p>
        ) : participantes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum time inscrito.</p>
        ) : null}
        {participantes.map((time) => {
          const elenco = elencos[time.timeId];
          return (
            <section
              key={time.timeId}
              aria-label={`Time inscrito ${time.nome}`}
            >
              <Card className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-lg font-semibold">
                      {time.nome}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {time.sigla} · {time.ordemInscricao}º inscrito
                    </p>
                  </div>
                  <span className="rounded-full bg-green-pale px-3 py-1 text-xs font-semibold text-green-dark">
                    Participação{' '}
                    {time.statusParticipacao === 'ATIVO' ? 'ativa' : 'inativa'}
                  </span>
                </div>
                {elenco?.situacao === 'carregando' || !elenco ? (
                  <p
                    className="mt-4 text-sm text-muted-foreground"
                    role="status"
                  >
                    Carregando elenco contextual...
                  </p>
                ) : elenco.situacao === 'erro' ? (
                  <p className="mt-4 text-sm text-destructive" role="alert">
                    Não foi possível carregar o elenco contextual deste time.
                  </p>
                ) : (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground">
                      {elenco.dados.quantidadeAtivos} atleta(s) ativo(s) ·
                      mínimo {elenco.dados.minimoAtletas} · limite{' '}
                      {elenco.dados.limiteAtletasPorTime}
                    </p>
                    {elenco.dados.atletas.length === 0 ? (
                      <p className="mt-3 text-sm text-muted-foreground">
                        Nenhum atleta no elenco contextual.
                      </p>
                    ) : (
                      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                        {elenco.dados.atletas.map((atleta) => (
                          <li
                            className="bg-muted p-3 text-sm"
                            key={atleta.atletaCampeonatoId}
                          >
                            <span className="font-semibold">
                              {atleta.nomeExibicao}
                            </span>
                            <span className="block text-muted-foreground">
                              @{atleta.nomeUsuario} ·{' '}
                              {atleta.status === 'ATIVO' ? 'Ativo' : 'Inativo'}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {elenco.dados.pendencias.length > 0 ? (
                      <ul className="mt-3 text-sm text-destructive">
                        {elenco.dados.pendencias.map((pendencia) => (
                          <li key={pendencia}>{pendencia}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                )}
              </Card>
            </section>
          );
        })}
        {paginaParticipantes < totalPaginasParticipantes ? (
          <Button
            variant="campoOutline"
            disabled={carregandoParticipantes}
            onClick={carregarMaisParticipantes}
          >
            {carregandoParticipantes
              ? 'Carregando...'
              : 'Carregar mais participantes'}
          </Button>
        ) : null}
      </div>

      {feedback ? (
        <p
          role="status"
          className="mt-5 rounded-md bg-green-pale p-3 text-sm font-semibold text-green-dark"
        >
          {feedback}
        </p>
      ) : null}
    </>
  );
}

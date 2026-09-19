'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { useCampeonatosApi } from '@/contexts/campeonatos-api';
import { useSessao } from '@/hooks/use-sessao';
import {
  criarFasesPadrao,
  type OpcoesEstruturaCampeonato,
} from '@/services/campeonatos/estrutura-campeonato';
import type {
  DetalheAdministrativoCampeonato,
  DistribuicaoCampeonato,
  EstruturaMaterializadaCampeonato,
  FasesPersistidasCampeonato,
  FormatoCampeonato,
  PaginaTimesParticipantes,
} from '@/types/api/campeonatos';
import { CabecalhoPagina } from '@/components/layout/cabecalho-pagina';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const rotulosFormato: Record<FormatoCampeonato, string> = {
  PONTOS_CORRIDOS: 'Pontos corridos',
  MATA_MATA: 'Mata-mata',
  GRUPOS_E_MATA_MATA: 'Grupos e mata-mata',
};

const TAMANHO_PAGINA = 100;

function formatoCanonico(formato: string): FormatoCampeonato {
  return formato === 'GRUPOS_MATA_MATA'
    ? 'GRUPOS_E_MATA_MATA'
    : (formato as FormatoCampeonato);
}

export function TelaChaveamento({
  campeonatoId,
  incorporada = false,
}: {
  campeonatoId: string;
  incorporada?: boolean;
}) {
  const { hydrated, session, executarAutenticado } = useSessao();
  const campeonatosApi = useCampeonatosApi();
  const [campeonato, setCampeonato] =
    useState<DetalheAdministrativoCampeonato | null>(null);
  const [fasesPersistidas, setFasesPersistidas] =
    useState<FasesPersistidasCampeonato | null>(null);
  const [distribuicao, setDistribuicao] =
    useState<DistribuicaoCampeonato | null>(null);
  const [estruturaPersistida, setEstruturaPersistida] =
    useState<EstruturaMaterializadaCampeonato | null>(null);
  const [formato, setFormato] = useState<FormatoCampeonato>('PONTOS_CORRIDOS');
  const [opcoes, setOpcoes] = useState<OpcoesEstruturaCampeonato>({
    turnos: 'TURNO_UNICO',
    quantidadeGrupos: 2,
    classificadosPorGrupo: 2,
    numeroPartidasConfronto: 1,
  });
  const [modo, setModo] = useState<'AUTOMATICA' | 'MANUAL'>('AUTOMATICA');
  const [participantes, setParticipantes] = useState<
    PaginaTimesParticipantes['itens']
  >([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [editorFasesAberto, setEditorFasesAberto] = useState(true);
  const [gerando, setGerando] = useState(false);
  const [feedback, setFeedback] = useState('');
  const chavesEtapas = useRef<
    Partial<Record<'distribuicao' | 'pontosCorridos' | 'mataMata', string>>
  >({});
  const identidadeSessao = `${campeonatoId}:${session?.sessionId ?? ''}:${session?.account.id ?? ''}`;
  const identidadeSessaoAtual = useRef(identidadeSessao);
  useLayoutEffect(() => {
    identidadeSessaoAtual.current = identidadeSessao;
  }, [identidadeSessao]);

  useEffect(() => {
    if (!hydrated) return;
    let ativo = true;
    void Promise.resolve().then(() => {
      if (!ativo) return;
      setCampeonato(null);
      setFasesPersistidas(null);
      setDistribuicao(null);
      setEstruturaPersistida(null);
      setParticipantes([]);
      setEditorFasesAberto(true);
      setFeedback('');
      setCarregando(true);
    });
    chavesEtapas.current = {};
    Promise.all([
      (async () => {
        const primeira = await campeonatosApi.listarTimesParticipantes(
          campeonatoId,
          undefined,
          1,
          TAMANHO_PAGINA,
        );
        const itens = [...primeira.itens];
        for (let pagina = 2; pagina <= primeira.totalPaginas; pagina += 1) {
          const proxima = await campeonatosApi.listarTimesParticipantes(
            campeonatoId,
            undefined,
            pagina,
            TAMANHO_PAGINA,
          );
          itens.push(...proxima.itens);
        }
        return itens;
      })(),
      executarAutenticado((token) =>
        campeonatosApi.consultarAdministracao(campeonatoId, token),
      ),
      executarAutenticado((token) =>
        campeonatosApi.consultarFases(campeonatoId, token),
      ),
      executarAutenticado((token) =>
        campeonatosApi.consultarDistribuicao(campeonatoId, token),
      ),
      executarAutenticado((token) =>
        campeonatosApi.consultarEstrutura(campeonatoId, token),
      ),
    ])
      .then(
        ([times, detalhe, fasesSalvas, distribuicaoSalva, estruturaSalva]) => {
          if (!ativo) return;
          setParticipantes(times);
          setCampeonato(detalhe);
          setFormato(formatoCanonico(detalhe.formato));
          setFasesPersistidas(fasesSalvas);
          setEditorFasesAberto(fasesSalvas.fases.length === 0);
          const faseClassificatoria = fasesSalvas.fases.find(
            (fase) => fase.tipo !== 'MATA_MATA',
          );
          const faseGrupos = fasesSalvas.fases.find(
            (fase) => fase.tipo === 'GRUPOS',
          );
          if (faseClassificatoria || faseGrupos) {
            setOpcoes((atuais) => ({
              ...atuais,
              turnos:
                faseClassificatoria?.quantidadeTurnos === 2
                  ? 'TURNO_E_RETORNO'
                  : 'TURNO_UNICO',
              quantidadeGrupos:
                faseGrupos?.grupos.length ?? atuais.quantidadeGrupos,
              classificadosPorGrupo:
                faseGrupos?.classificadosPorGrupo ??
                atuais.classificadosPorGrupo,
            }));
          }
          setDistribuicao(distribuicaoSalva);
          setEstruturaPersistida(estruturaSalva);
        },
      )
      .catch(
        () =>
          ativo &&
          setFeedback('Não foi possível carregar a estrutura persistida.'),
      )
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
    // A identidade do Campeonato dirige a recuperação das projeções.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campeonatoId, hydrated, session?.sessionId, session?.account.id]);

  const fases = useMemo(
    () => criarFasesPadrao(formato, opcoes),
    [formato, opcoes],
  );

  if (!hydrated || carregando)
    return <p role="status">Carregando estrutura...</p>;
  if (!campeonato) return <h1>Sem acesso administrativo</h1>;

  const estado = campeonato.status;
  const configuravel = estado === 'EM_INSCRICOES';
  const aguardandoGeracao = estado === 'AGUARDANDO_SORTEIO';
  const gerado = Boolean(
    estruturaPersistida &&
    (formato === 'MATA_MATA' ||
      estruturaPersistida.pontosCorridos.length > 0) &&
    (formato === 'PONTOS_CORRIDOS' || estruturaPersistida.mataMata.length > 0),
  );
  const podeConfigurar =
    campeonato.operacoesPermitidas.includes('CONFIGURAR_ESTRUTURA') &&
    campeonato.autoridade.permissoes.includes('CONFIGURAR_ESTRUTURA');
  const podeGerar =
    campeonato.operacoesPermitidas.includes('GERAR_ESTRUTURA') &&
    campeonato.autoridade.permissoes.includes('CONFIGURAR_ESTRUTURA');
  const parametrosPersistidosIncompletos = Boolean(
    fasesPersistidas?.fases.length,
  );

  return (
    <>
      {!incorporada ? (
        <CabecalhoPagina
          title={`Estrutura · ${campeonato.nome}`}
          subtitle="Fases, distribuição e confrontos da competição"
        />
      ) : (
        <div className="mb-6">
          <h2 className="font-display text-2xl font-semibold">Estrutura</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure as fases antes de finalizar as inscrições; depois
            distribua os Times e gere todos os confrontos.
          </p>
        </div>
      )}

      <section aria-labelledby="participantes-estrutura" className="mb-7">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-3">
          <div>
            <h3
              id="participantes-estrutura"
              className="font-display text-xl font-semibold"
            >
              Participantes da estrutura
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {carregando
                ? 'Carregando Times confirmados...'
                : `${participantes.length} Times confirmados`}
            </p>
          </div>
          <span className="text-sm font-semibold text-green-dark">
            {rotulosFormato[formato]}
          </span>
        </div>
        {participantes.length ? (
          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {participantes.map((time) => (
              <Card key={time.timeId} className="p-3">
                <p className="font-display text-sm font-semibold">
                  {time.nome}
                </p>
                <p className="text-xs text-muted-foreground">
                  {time.sigla} · {time.ordemInscricao}º inscrito
                </p>
              </Card>
            ))}
          </div>
        ) : null}
      </section>

      {fasesPersistidas?.fases.length ? (
        <section aria-labelledby="estrutura-persistida" className="mb-7">
          <h3
            id="estrutura-persistida"
            className="font-display text-xl font-semibold"
          >
            Estrutura persistida
          </h3>
          <div className="mt-3 divide-y divide-border border-y border-border">
            {fasesPersistidas.fases.map((fase) => (
              <div key={fase.faseId} className="py-4">
                <p className="font-semibold">
                  Fase {fase.ordem} · {fase.nome}
                </p>
                <p className="text-sm text-muted-foreground">
                  {fase.tipo} · {fase.statusMaterializacao}
                </p>
                {fase.grupos.length ? (
                  <p className="mt-1 text-sm">
                    {fase.grupos.map((grupo) => grupo.nome).join(' · ')}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {distribuicao?.estado === 'EXECUTADA'
              ? `Distribuição ${distribuicao.modo === 'AUTOMATICA' ? 'automática' : 'manual'} confirmada.`
              : 'Distribuição ainda não executada.'}
          </p>
          {estruturaPersistida?.mataMata.map((confronto) => (
            <p key={confronto.confrontoId} className="mt-2 text-sm">
              Rodada {confronto.rodada} · confronto {confronto.ordem} ·{' '}
              {confronto.tipo}
            </p>
          ))}
        </section>
      ) : null}

      {configuravel &&
      podeConfigurar &&
      editorFasesAberto &&
      !parametrosPersistidosIncompletos ? (
        <section aria-labelledby="configuracao-fases" className="space-y-6">
          <div>
            <h3
              id="configuracao-fases"
              className="font-display text-xl font-semibold"
            >
              Formato e fases
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              A alteração substitui integralmente a configuração anterior.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              Formato da competição
              <select
                className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 font-normal"
                value={formato}
                onChange={(event) =>
                  setFormato(event.target.value as FormatoCampeonato)
                }
              >
                {Object.entries(rotulosFormato).map(([valor, rotulo]) => (
                  <option key={valor} value={valor}>
                    {rotulo}
                  </option>
                ))}
              </select>
            </label>

            {formato !== 'MATA_MATA' ? (
              <label className="text-sm font-semibold">
                Turnos
                <select
                  className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 font-normal"
                  value={opcoes.turnos}
                  onChange={(event) =>
                    setOpcoes((atual) => ({
                      ...atual,
                      turnos: event.target
                        .value as OpcoesEstruturaCampeonato['turnos'],
                    }))
                  }
                >
                  <option value="TURNO_UNICO">Turno único</option>
                  <option value="TURNO_E_RETORNO">Turno e returno</option>
                </select>
              </label>
            ) : null}

            {formato === 'GRUPOS_E_MATA_MATA' ? (
              <>
                <label className="text-sm font-semibold">
                  Quantidade de grupos
                  <input
                    className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 font-normal"
                    type="number"
                    min={1}
                    value={opcoes.quantidadeGrupos}
                    onChange={(event) =>
                      setOpcoes((atual) => ({
                        ...atual,
                        quantidadeGrupos: Number(event.target.value),
                      }))
                    }
                  />
                </label>
                <label className="text-sm font-semibold">
                  Classificados por grupo
                  <input
                    className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 font-normal"
                    type="number"
                    min={1}
                    max={2}
                    value={opcoes.classificadosPorGrupo}
                    onChange={(event) =>
                      setOpcoes((atual) => ({
                        ...atual,
                        classificadosPorGrupo: Number(event.target.value),
                      }))
                    }
                  />
                </label>
              </>
            ) : null}

            {formato !== 'PONTOS_CORRIDOS' ? (
              <label className="text-sm font-semibold">
                Partidas por confronto eliminatório
                <select
                  className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 font-normal"
                  value={opcoes.numeroPartidasConfronto}
                  onChange={(event) =>
                    setOpcoes((atual) => ({
                      ...atual,
                      numeroPartidasConfronto: Number(event.target.value) as
                        1 | 2,
                    }))
                  }
                >
                  <option value={1}>Jogo único</option>
                  <option value={2}>Ida e volta</option>
                </select>
              </label>
            ) : null}
          </div>

          <div className="border-t border-border pt-5">
            <h4 className="font-display text-lg font-semibold">
              Prévia das fases
            </h4>
            <ol className="mt-3 space-y-2">
              {fases.map((fase) => (
                <li
                  key={`${fase.ordem}-${fase.tipo}`}
                  className="border-l-4 border-green-mid pl-4"
                >
                  <p className="font-semibold">
                    Fase {fase.ordem} · {fase.nome}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {fase.tipo === 'GRUPOS'
                      ? `${fase.quantidadeGrupos} grupos · ${fase.classificadosPorGrupo} classificados por grupo`
                      : fase.tipo === 'MATA_MATA'
                        ? `${fase.numeroPartidasConfronto} partida(s) por confronto`
                        : fase.turnos === 'TURNO_E_RETORNO'
                          ? 'Turno e returno'
                          : 'Turno único'}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          <Button
            variant="campo"
            disabled={salvando || participantes.length < 2}
            onClick={async () => {
              const identidadeDaOperacao = identidadeSessao;
              setSalvando(true);
              setFeedback('');
              try {
                await executarAutenticado((accessToken) =>
                  campeonatosApi.selecionarEstruturaFases(
                    campeonatoId,
                    accessToken,
                    { formato, fases },
                  ),
                );
                if (identidadeSessaoAtual.current !== identidadeDaOperacao)
                  return;
                setEditorFasesAberto(false);
                setFeedback('Estrutura de fases salva.');
                try {
                  const fasesAtualizadas = await executarAutenticado(
                    (accessToken) =>
                      campeonatosApi.consultarFases(campeonatoId, accessToken),
                  );
                  if (identidadeSessaoAtual.current !== identidadeDaOperacao)
                    return;
                  setFasesPersistidas(fasesAtualizadas);
                } catch {
                  if (identidadeSessaoAtual.current === identidadeDaOperacao) {
                    setFeedback(
                      'Estrutura de fases salva, mas não foi possível atualizar a leitura.',
                    );
                  }
                }
              } catch {
                if (identidadeSessaoAtual.current === identidadeDaOperacao) {
                  setFeedback('Não foi possível salvar a estrutura de fases.');
                }
              } finally {
                if (identidadeSessaoAtual.current === identidadeDaOperacao) {
                  setSalvando(false);
                }
              }
            }}
          >
            {salvando ? 'Salvando estrutura...' : 'Salvar estrutura de fases'}
          </Button>
        </section>
      ) : null}

      {configuravel && podeConfigurar && parametrosPersistidosIncompletos ? (
        <Card className="mb-7 border-warning p-5">
          <h3 className="font-display text-lg font-semibold">
            Substituição bloqueada
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            A leitura persistida não contém todos os parâmetros necessários para
            reconstruir a configuração sem perda. A substituição integral fica
            bloqueada até a API publicar esses dados.
          </p>
        </Card>
      ) : null}

      {aguardandoGeracao && podeGerar ? (
        <section aria-labelledby="geracao-confrontos" className="space-y-5">
          <div>
            <h3
              id="geracao-confrontos"
              className="font-display text-xl font-semibold"
            >
              Distribuição e geração
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              As inscrições estão encerradas. Escolha um modo integral para
              distribuir os Times e materializar os confrontos.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant={modo === 'AUTOMATICA' ? 'campo' : 'campoOutline'}
              disabled={gerado}
              onClick={() => setModo('AUTOMATICA')}
            >
              Sortear automaticamente
            </Button>
            <Button
              variant={modo === 'MANUAL' ? 'campo' : 'campoOutline'}
              disabled={gerado}
              onClick={() => setModo('MANUAL')}
            >
              Definir manualmente
            </Button>
          </div>
          <Button
            variant="campo"
            disabled={
              gerado || gerando || participantes.length < 2 || modo === 'MANUAL'
            }
            onClick={async () => {
              const identidadeDaOperacao = identidadeSessao;
              setGerando(true);
              setFeedback('');
              try {
                await executarAutenticado(async (accessToken) => {
                  const distribuicaoAtual =
                    await campeonatosApi.consultarDistribuicao(
                      campeonatoId,
                      accessToken,
                    );
                  if (identidadeSessaoAtual.current !== identidadeDaOperacao)
                    return;
                  if (distribuicaoAtual.estado !== 'EXECUTADA') {
                    chavesEtapas.current.distribuicao ??= crypto.randomUUID();
                    await campeonatosApi.distribuirTimes(
                      campeonatoId,
                      accessToken,
                      'AUTOMATICA',
                      [],
                      chavesEtapas.current.distribuicao,
                    );
                    if (identidadeSessaoAtual.current !== identidadeDaOperacao)
                      return;
                    delete chavesEtapas.current.distribuicao;
                  }

                  const estruturaAtual =
                    await campeonatosApi.consultarEstrutura(
                      campeonatoId,
                      accessToken,
                    );
                  if (identidadeSessaoAtual.current !== identidadeDaOperacao)
                    return;
                  if (
                    formato !== 'MATA_MATA' &&
                    estruturaAtual.pontosCorridos.length === 0
                  ) {
                    chavesEtapas.current.pontosCorridos ??= crypto.randomUUID();
                    await campeonatosApi.materializarPontosCorridos(
                      campeonatoId,
                      accessToken,
                      'AUTOMATICA',
                      [],
                      chavesEtapas.current.pontosCorridos,
                    );
                    if (identidadeSessaoAtual.current !== identidadeDaOperacao)
                      return;
                    delete chavesEtapas.current.pontosCorridos;
                  }
                  if (
                    formato !== 'PONTOS_CORRIDOS' &&
                    estruturaAtual.mataMata.length === 0
                  ) {
                    chavesEtapas.current.mataMata ??= crypto.randomUUID();
                    await campeonatosApi.materializarMataMata(
                      campeonatoId,
                      accessToken,
                      'AUTOMATICA',
                      [],
                      chavesEtapas.current.mataMata,
                    );
                    if (identidadeSessaoAtual.current !== identidadeDaOperacao)
                      return;
                    delete chavesEtapas.current.mataMata;
                  }
                });
                if (identidadeSessaoAtual.current !== identidadeDaOperacao)
                  return;
                setFeedback('Distribuição e confrontos gerados.');
                try {
                  const [distribuicaoAtualizada, estruturaAtualizada] =
                    await executarAutenticado((accessToken) =>
                      Promise.all([
                        campeonatosApi.consultarDistribuicao(
                          campeonatoId,
                          accessToken,
                        ),
                        campeonatosApi.consultarEstrutura(
                          campeonatoId,
                          accessToken,
                        ),
                      ]),
                    );
                  if (identidadeSessaoAtual.current !== identidadeDaOperacao)
                    return;
                  setDistribuicao(distribuicaoAtualizada);
                  setEstruturaPersistida(estruturaAtualizada);
                } catch {
                  if (identidadeSessaoAtual.current === identidadeDaOperacao) {
                    setFeedback(
                      'Distribuição e confrontos gerados, mas não foi possível atualizar a leitura.',
                    );
                  }
                }
              } catch {
                if (identidadeSessaoAtual.current === identidadeDaOperacao) {
                  setFeedback('Não foi possível gerar a estrutura.');
                }
              } finally {
                if (identidadeSessaoAtual.current === identidadeDaOperacao) {
                  setGerando(false);
                }
              }
            }}
          >
            {gerando
              ? 'Gerando estrutura...'
              : modo === 'AUTOMATICA'
                ? 'Gerar confrontos automaticamente'
                : 'Confirmar confrontos manuais'}
          </Button>
          {modo === 'MANUAL' ? (
            <p className="text-sm text-muted-foreground">
              A composição manual integral será liberada após carregar os IDs
              persistidos das fases e dos grupos; nenhuma geração parcial será
              enviada.
            </p>
          ) : null}
        </section>
      ) : null}

      {!configuravel && !aguardandoGeracao ? (
        <Card className="p-5">
          <h3 className="font-display text-lg font-semibold">
            Estrutura confirmada
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            O formato e as fases estão bloqueados neste estado do Campeonato.
          </p>
        </Card>
      ) : null}

      {feedback ? (
        <p role="status" className="mt-5 text-sm font-semibold text-green-dark">
          {feedback}
        </p>
      ) : null}
    </>
  );
}

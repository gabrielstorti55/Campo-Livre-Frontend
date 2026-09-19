'use client';

import Link from 'next/link';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { useCampeonatosApi } from '@/contexts/campeonatos-api';
import { useSessao } from '@/hooks/use-sessao';
import { TelaChaveamento } from '@/screens/organizador/chaveamento';
import { TelaGerenciarPartidas } from '@/screens/organizador/gerenciar-partidas';
import { TelaGerenciarTimes } from '@/screens/organizador/gerenciar-times';
import type {
  DetalheAdministrativoCampeonato,
  OrganizadorCampeonato,
  UsuarioElegivelOrganizador,
} from '@/types/api/campeonatos';
import { CabecalhoPagina } from '@/components/layout/cabecalho-pagina';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/utils/classes';

export type SecaoCampeonato =
  | 'geral'
  | 'regulamento'
  | 'participantes'
  | 'estrutura'
  | 'partidas'
  | 'equipe';

const secoes: Array<{ valor: SecaoCampeonato; rotulo: string }> = [
  { valor: 'geral', rotulo: 'Geral' },
  { valor: 'regulamento', rotulo: 'Regulamento' },
  { valor: 'participantes', rotulo: 'Participantes' },
  { valor: 'estrutura', rotulo: 'Estrutura' },
  { valor: 'partidas', rotulo: 'Partidas' },
  { valor: 'equipe', rotulo: 'Equipe organizadora' },
];

const estadoLabel: Record<DetalheAdministrativoCampeonato['status'], string> = {
  EM_INSCRICOES: 'Em inscrições',
  AGUARDANDO_SORTEIO: 'Aguardando sorteio',
  EM_ANDAMENTO: 'Em andamento',
  ENCERRADO: 'Encerrado',
  CANCELADO: 'Cancelado',
};

const formatoLabel: Record<DetalheAdministrativoCampeonato['formato'], string> =
  {
    PONTOS_CORRIDOS: 'Pontos corridos',
    MATA_MATA: 'Mata-mata',
    GRUPOS_E_MATA_MATA: 'Grupos e mata-mata',
  };

const TAMANHO_PAGINA = 100;

export function TelaVisaoGeralCampeonato({
  campeonatoId,
  secaoAtiva = 'geral',
}: {
  campeonatoId: string;
  secaoAtiva?: SecaoCampeonato;
}) {
  const { hydrated, session, executarAutenticado } = useSessao();
  const api = useCampeonatosApi();
  const [campeonato, setCampeonato] =
    useState<DetalheAdministrativoCampeonato | null>(null);
  const [organizadores, setOrganizadores] = useState<OrganizadorCampeonato[]>(
    [],
  );
  const [candidato, setCandidato] = useState<UsuarioElegivelOrganizador | null>(
    null,
  );
  const [email, setEmail] = useState('');
  const [nome, setNome] = useState('');
  const [inicio, setInicio] = useState('');
  const [feedback, setFeedback] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [motivoCancelamento, setMotivoCancelamento] = useState('');
  const chaveFinalizacao = useRef<string | null>(null);
  const identidadeSessao = `${campeonatoId}:${session?.sessionId ?? ''}:${session?.account.id ?? ''}`;
  const identidadeSessaoAtual = useRef(identidadeSessao);
  useLayoutEffect(() => {
    identidadeSessaoAtual.current = identidadeSessao;
  }, [identidadeSessao]);

  async function carregarDetalhe(identidadeEsperada = identidadeSessao) {
    const detalhe = await executarAutenticado((token) =>
      api.consultarAdministracao(campeonatoId, token),
    );
    if (identidadeSessaoAtual.current !== identidadeEsperada) return null;
    setCampeonato(detalhe);
    setNome(detalhe.nome);
    setInicio(detalhe.inicioPrevistoEm);
    return detalhe;
  }

  async function carregarEquipe(identidadeEsperada = identidadeSessao) {
    const itens = await executarAutenticado(async (token) => {
      const primeira = await api.listarOrganizadores(
        campeonatoId,
        token,
        1,
        TAMANHO_PAGINA,
        'ATIVO',
      );
      const todos = [...primeira.itens];
      for (let pagina = 2; pagina <= primeira.totalPaginas; pagina += 1) {
        const proxima = await api.listarOrganizadores(
          campeonatoId,
          token,
          pagina,
          TAMANHO_PAGINA,
          'ATIVO',
        );
        todos.push(...proxima.itens);
      }
      return todos;
    });
    if (identidadeSessaoAtual.current !== identidadeEsperada) return false;
    setOrganizadores(itens);
    return true;
  }

  useEffect(() => {
    if (!hydrated) return;
    let ativo = true;
    void Promise.resolve().then(() => {
      if (!ativo) return;
      setCampeonato(null);
      setOrganizadores([]);
      setCandidato(null);
      setErro('');
      setFeedback('');
      setCarregando(true);
    });
    chaveFinalizacao.current = null;
    const detalhePromise = executarAutenticado((token) =>
      api.consultarAdministracao(campeonatoId, token),
    );
    const equipePromise =
      secaoAtiva === 'equipe'
        ? executarAutenticado(async (token) => {
            const primeira = await api.listarOrganizadores(
              campeonatoId,
              token,
              1,
              TAMANHO_PAGINA,
              'ATIVO',
            );
            const itens = [...primeira.itens];
            for (let pagina = 2; pagina <= primeira.totalPaginas; pagina += 1) {
              const proxima = await api.listarOrganizadores(
                campeonatoId,
                token,
                pagina,
                TAMANHO_PAGINA,
                'ATIVO',
              );
              itens.push(...proxima.itens);
            }
            return itens;
          })
        : Promise.resolve(null);

    Promise.all([detalhePromise, equipePromise])
      .then(([detalhe, equipe]) => {
        if (!ativo) return;
        setCampeonato(detalhe);
        setNome(detalhe.nome);
        setInicio(detalhe.inicioPrevistoEm);
        if (equipe) setOrganizadores(equipe);
      })
      .catch(() => {
        if (ativo)
          setErro('Não foi possível carregar o workspace administrativo.');
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
    // O provider e a sessão autenticada são estáveis entre carregamentos.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    campeonatoId,
    hydrated,
    secaoAtiva,
    session?.sessionId,
    session?.account.id,
  ]);

  if (!hydrated || carregando)
    return <p role="status">Carregando campeonato...</p>;
  if (erro || !campeonato) {
    return (
      <Card role="alert" className="p-6">
        <h1 className="font-display text-2xl font-semibold">
          Sem acesso administrativo
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {erro || 'A conta não possui vínculo ativo com este Campeonato.'}
        </p>
        <Button asChild variant="campoOutline" className="mt-4">
          <Link href={`/campeonatos/${campeonatoId}`}>Ver página pública</Link>
        </Button>
      </Card>
    );
  }

  const responsavel = campeonato.autoridade.funcao === 'RESPONSAVEL';
  const pode = (operacao: string) =>
    campeonato.operacoesPermitidas.includes(operacao);
  const podeExecutarAcaoGeral = (operacao: string) =>
    pode(operacao) && campeonato.autoridade.permissoes.includes('EDITAR_DADOS');

  return (
    <>
      <CabecalhoPagina
        title={campeonato.nome}
        subtitle={`${formatoLabel[campeonato.formato]} · ${campeonato.contexto === 'PREFEITURA' ? 'Prefeitura' : 'Contexto pessoal'}`}
        actions={
          <Button asChild variant="campoOutline">
            <Link href={`/campeonatos/${campeonatoId}`}>
              Visualizar página pública
            </Link>
          </Button>
        }
      />
      <div className="mb-2 flex flex-wrap items-center gap-3 text-sm">
        <span className="font-semibold text-green-dark">
          {estadoLabel[campeonato.status]}
        </span>
        <span className="text-muted-foreground">
          {responsavel ? 'Você é o responsável' : 'Você atua como organizador'}
        </span>
        <span className="text-muted-foreground">
          Configuração v{campeonato.configuracao.versao}
        </span>
      </div>

      <nav
        aria-label="Seções do campeonato"
        className="mb-7 overflow-x-auto border-b border-border"
      >
        <div role="tablist" className="flex min-w-max gap-6 px-1">
          {secoes.map((secao) => (
            <Link
              key={secao.valor}
              role="tab"
              aria-selected={secao.valor === secaoAtiva}
              href={`/organizador/campeonato/${campeonatoId}?secao=${secao.valor}`}
              className={cn(
                'relative flex min-h-11 items-center border-b-2 px-1 text-sm font-semibold',
                secao.valor === secaoAtiva
                  ? 'border-green-mid text-green-dark'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {secao.rotulo}
              {secao.valor === 'regulamento' &&
              campeonato.configuracao.pendencias.some((item) =>
                item.includes('REGULAMENTO'),
              ) ? (
                <span
                  className="ml-2 text-xs"
                  aria-label="Regulamento pendente"
                >
                  1
                </span>
              ) : null}
            </Link>
          ))}
        </div>
      </nav>

      {secaoAtiva === 'geral' ? (
        <section
          aria-labelledby="dados-campeonato"
          className="max-w-4xl space-y-6"
        >
          <div>
            <h2
              id="dados-campeonato"
              className="font-display text-2xl font-semibold"
            >
              Dados do campeonato
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Dados recuperados da projeção administrativa vigente.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              Nome do campeonato
              <Input
                className="mt-2"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </label>
            <label className="text-sm font-semibold">
              Município
              <Input className="mt-2" value={campeonato.municipioId} readOnly />
            </label>
            <label className="text-sm font-semibold">
              Formato
              <Input
                className="mt-2"
                value={formatoLabel[campeonato.formato]}
                readOnly
              />
            </label>
            <label className="text-sm font-semibold">
              Início previsto
              <Input
                type="date"
                className="mt-2"
                value={inicio}
                onChange={(e) => setInicio(e.target.value)}
              />
            </label>
          </div>
          {podeExecutarAcaoGeral('ATUALIZAR') ? (
            <Button
              variant="campo"
              disabled={salvando || !nome.trim()}
              onClick={async () => {
                const identidadeDaOperacao = identidadeSessao;
                setSalvando(true);
                try {
                  await executarAutenticado((token) =>
                    api.atualizarCampeonato(campeonatoId, token, {
                      nome: nome.trim(),
                      descricao: campeonato.descricao,
                      inicioPrevistoEm: inicio,
                      fimPrevistoEm: campeonato.fimPrevistoEm,
                    }),
                  );
                  if (identidadeSessaoAtual.current !== identidadeDaOperacao)
                    return;
                  setFeedback('Dados do Campeonato atualizados.');
                  try {
                    await carregarDetalhe(identidadeDaOperacao);
                  } catch {
                    if (identidadeSessaoAtual.current === identidadeDaOperacao)
                      setFeedback(
                        'Dados atualizados, mas não foi possível atualizar a leitura.',
                      );
                  }
                } catch {
                  if (identidadeSessaoAtual.current === identidadeDaOperacao)
                    setFeedback('Não foi possível atualizar os dados.');
                } finally {
                  if (identidadeSessaoAtual.current === identidadeDaOperacao)
                    setSalvando(false);
                }
              }}
            >
              Salvar alterações
            </Button>
          ) : null}
          <Card className="p-5">
            <h3 className="font-display text-lg font-semibold">
              Validação da configuração
            </h3>
            {campeonato.configuracao.pendencias.length ? (
              <ul className="mt-3 list-disc pl-5 text-sm text-muted-foreground">
                {campeonato.configuracao.pendencias.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-green-dark">
                Sem pendências publicadas.
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              {podeExecutarAcaoGeral('VALIDAR_CONFIGURACAO') ? (
                <Button
                  variant="campoOutline"
                  onClick={async () => {
                    const identidadeDaOperacao = identidadeSessao;
                    try {
                      const resultado = await executarAutenticado((token) =>
                        api.validarConfiguracao(campeonatoId, token),
                      );
                      if (
                        identidadeSessaoAtual.current !== identidadeDaOperacao
                      )
                        return;
                      setFeedback(
                        resultado.valido
                          ? 'Configuração validada.'
                          : resultado.erros
                              .map((item) => item.mensagem)
                              .join(' · '),
                      );
                      try {
                        await carregarDetalhe(identidadeDaOperacao);
                      } catch {
                        if (
                          identidadeSessaoAtual.current === identidadeDaOperacao
                        )
                          setFeedback(
                            'Configuração validada, mas não foi possível atualizar a leitura.',
                          );
                      }
                    } catch {
                      if (
                        identidadeSessaoAtual.current === identidadeDaOperacao
                      )
                        setFeedback('Não foi possível validar a configuração.');
                    }
                  }}
                >
                  Validar campeonato
                </Button>
              ) : null}
              {podeExecutarAcaoGeral('FINALIZAR_INSCRICOES') ? (
                <Button
                  variant="campo"
                  onClick={async () => {
                    const identidadeDaOperacao = identidadeSessao;
                    chaveFinalizacao.current ??= crypto.randomUUID();
                    try {
                      await executarAutenticado((token) =>
                        api.finalizarInscricoes(
                          campeonatoId,
                          token,
                          chaveFinalizacao.current!,
                        ),
                      );
                      if (
                        identidadeSessaoAtual.current !== identidadeDaOperacao
                      )
                        return;
                      setFeedback('Inscrições finalizadas.');
                      try {
                        const detalheAtualizado =
                          await carregarDetalhe(identidadeDaOperacao);
                        if (detalheAtualizado) chaveFinalizacao.current = null;
                      } catch {
                        if (
                          identidadeSessaoAtual.current === identidadeDaOperacao
                        )
                          setFeedback(
                            'Inscrições finalizadas, mas não foi possível atualizar a leitura.',
                          );
                      }
                    } catch {
                      if (
                        identidadeSessaoAtual.current === identidadeDaOperacao
                      )
                        setFeedback(
                          'Não foi possível finalizar as inscrições.',
                        );
                    }
                  }}
                >
                  Finalizar inscrições
                </Button>
              ) : null}
            </div>
          </Card>
          {responsavel && podeExecutarAcaoGeral('CANCELAR') ? (
            <details>
              <summary className="cursor-pointer font-semibold">
                Outras ações do campeonato
              </summary>
              <div className="mt-4 space-y-3">
                <Input
                  aria-label="Motivo do cancelamento"
                  value={motivoCancelamento}
                  onChange={(e) => setMotivoCancelamento(e.target.value)}
                  placeholder="Motivo obrigatório"
                />
                <Button
                  variant="campoOutline"
                  disabled={!motivoCancelamento.trim()}
                  onClick={async () => {
                    const identidadeDaOperacao = identidadeSessao;
                    try {
                      await executarAutenticado((token) =>
                        api.cancelarCampeonato(
                          campeonatoId,
                          token,
                          motivoCancelamento.trim(),
                        ),
                      );
                      if (
                        identidadeSessaoAtual.current !== identidadeDaOperacao
                      )
                        return;
                      setFeedback('Campeonato cancelado.');
                      try {
                        await carregarDetalhe(identidadeDaOperacao);
                      } catch {
                        if (
                          identidadeSessaoAtual.current === identidadeDaOperacao
                        )
                          setFeedback(
                            'Campeonato cancelado, mas não foi possível atualizar a leitura.',
                          );
                      }
                    } catch {
                      if (
                        identidadeSessaoAtual.current === identidadeDaOperacao
                      )
                        setFeedback('Não foi possível cancelar o Campeonato.');
                    }
                  }}
                >
                  Confirmar cancelamento
                </Button>
              </div>
            </details>
          ) : null}
        </section>
      ) : null}

      {secaoAtiva === 'regulamento' ? (
        <section aria-labelledby="regulamento-campeonato" className="max-w-3xl">
          <h2
            id="regulamento-campeonato"
            className="font-display text-2xl font-semibold"
          >
            Regulamento
          </h2>
          <Card className="mt-4 border-warning p-5">
            <h3 className="font-display text-lg font-semibold">
              Edição protegida
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              A API permite salvar, mas ainda não publica a leitura integral do
              Regulamento. Para evitar sobrescrever regras existentes após um
              reload, a edição fica indisponível no modo integrado.
            </p>
          </Card>
          <label className="mt-5 block text-sm font-semibold">
            Texto do regulamento
            <Textarea
              aria-label="Texto do regulamento"
              className="mt-2"
              disabled
            />
          </label>
          <label className="mt-5 block text-sm font-semibold">
            Critérios de desempate
            <Textarea
              aria-label="Critérios de desempate"
              className="mt-2"
              disabled
            />
          </label>
        </section>
      ) : null}

      {secaoAtiva === 'participantes' ? (
        <TelaGerenciarTimes campeonatoId={campeonatoId} incorporada />
      ) : null}
      {secaoAtiva === 'estrutura' ? (
        <TelaChaveamento campeonatoId={campeonatoId} incorporada />
      ) : null}
      {secaoAtiva === 'partidas' ? (
        <TelaGerenciarPartidas campeonatoId={campeonatoId} incorporada />
      ) : null}

      {secaoAtiva === 'equipe' ? (
        <section aria-label="Equipe organizadora" className="max-w-4xl">
          <h2 className="font-display text-2xl font-semibold">
            Equipe organizadora
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Responsável e organizadores ativos recuperados do servidor.
          </p>
          {responsavel &&
          campeonato.autoridade.permissoes.includes('GERENCIAR_EQUIPE') ? (
            <Card className="mt-5 p-5">
              <label className="text-sm font-semibold">
                E-mail do organizador
                <Input
                  aria-label="E-mail do organizador"
                  type="email"
                  className="mt-2"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setCandidato(null);
                  }}
                />
              </label>
              <Button
                className="mt-3"
                variant="campoOutline"
                disabled={!email.includes('@')}
                onClick={async () => {
                  const identidadeDaOperacao = identidadeSessao;
                  try {
                    const pagina = await executarAutenticado((token) =>
                      api.buscarOrganizadorElegivel(
                        campeonatoId,
                        email.trim(),
                        token,
                      ),
                    );
                    if (identidadeSessaoAtual.current !== identidadeDaOperacao)
                      return;
                    setCandidato(pagina.itens[0] ?? null);
                    setFeedback(
                      pagina.itens.length
                        ? ''
                        : 'Nenhuma conta elegível encontrada.',
                    );
                  } catch {
                    if (
                      identidadeSessaoAtual.current === identidadeDaOperacao
                    ) {
                      setCandidato(null);
                      setFeedback('Não foi possível buscar o organizador.');
                    }
                  }
                }}
              >
                Buscar organizador
              </Button>
              {candidato ? (
                <div className="mt-4 border-l-4 border-green-mid pl-4">
                  <p className="font-semibold">{candidato.nome}</p>
                  <p className="text-sm text-muted-foreground">
                    @{candidato.nomeUsuario}
                  </p>
                  <Button
                    className="mt-2"
                    variant="campo"
                    onClick={async () => {
                      const identidadeDaOperacao = identidadeSessao;
                      try {
                        await executarAutenticado((token) =>
                          api.adicionarOrganizador(
                            campeonatoId,
                            candidato.usuarioId,
                            token,
                          ),
                        );
                        if (
                          identidadeSessaoAtual.current !== identidadeDaOperacao
                        )
                          return;
                        setCandidato(null);
                        setEmail('');
                        setFeedback('Organizador adicionado.');
                        try {
                          await carregarEquipe(identidadeDaOperacao);
                        } catch {
                          if (
                            identidadeSessaoAtual.current ===
                            identidadeDaOperacao
                          )
                            setFeedback(
                              'Organizador adicionado, mas não foi possível atualizar a equipe.',
                            );
                        }
                      } catch {
                        if (
                          identidadeSessaoAtual.current === identidadeDaOperacao
                        )
                          setFeedback(
                            'Não foi possível adicionar o organizador.',
                          );
                      }
                    }}
                  >
                    Adicionar organizador
                  </Button>
                </div>
              ) : null}
            </Card>
          ) : null}
          <div className="mt-5 divide-y divide-border border-y border-border">
            {organizadores.map((organizador) => (
              <div
                key={organizador.organizadorId}
                className="flex flex-wrap items-center justify-between gap-3 py-4"
              >
                <div>
                  <p className="font-semibold">{organizador.usuario.nome}</p>
                  <p className="text-sm text-muted-foreground">
                    @{organizador.usuario.nomeUsuario} ·{' '}
                    {organizador.funcao === 'RESPONSAVEL'
                      ? 'Responsável'
                      : 'Organizador'}
                  </p>
                </div>
                {organizador.podeSerRemovido &&
                campeonato.autoridade.permissoes.includes(
                  'GERENCIAR_EQUIPE',
                ) ? (
                  <Button
                    size="sm"
                    variant="campoOutline"
                    onClick={async () => {
                      const identidadeDaOperacao = identidadeSessao;
                      try {
                        await executarAutenticado((token) =>
                          api.removerOrganizador(
                            campeonatoId,
                            organizador.organizadorId,
                            token,
                            'Remoção pela equipe responsável',
                          ),
                        );
                        if (
                          identidadeSessaoAtual.current !== identidadeDaOperacao
                        )
                          return;
                        setFeedback('Organizador removido.');
                        try {
                          await carregarEquipe(identidadeDaOperacao);
                        } catch {
                          if (
                            identidadeSessaoAtual.current ===
                            identidadeDaOperacao
                          )
                            setFeedback(
                              'Organizador removido, mas não foi possível atualizar a equipe.',
                            );
                        }
                      } catch {
                        if (
                          identidadeSessaoAtual.current === identidadeDaOperacao
                        )
                          setFeedback(
                            'Não foi possível remover o organizador.',
                          );
                      }
                    }}
                  >
                    Remover
                  </Button>
                ) : null}
              </div>
            ))}
            {!organizadores.length ? (
              <p className="py-4 text-sm text-muted-foreground">
                Nenhum organizador adicional.
              </p>
            ) : null}
          </div>
        </section>
      ) : null}

      {feedback ? (
        <p role="status" className="mt-5 text-sm font-semibold text-green-dark">
          {feedback}
        </p>
      ) : null}
    </>
  );
}

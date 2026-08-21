'use client';

import Link from 'next/link';
import { useState } from 'react';

import { useSessao } from '@/hooks/use-sessao';
import type { EstadoCampeonatoOperacional } from '@/types/organizador';
import { catalogoOrganizadorMock } from '@/services/organizador/catalogo-organizador.mock';
import { useEstadoOperacionalOrganizador } from '@/stores/estado-operacional-organizador';
import { catalogoPublicoMock } from '@/services/publico/catalogo-publico.mock';
import { CabecalhoPagina } from '@/components/layout/cabecalho-pagina';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const estadoLabel: Record<EstadoCampeonatoOperacional, string> = {
  EM_CONFIGURACAO: 'Em configuração',
  EM_ANDAMENTO: 'Em andamento',
  ENCERRADO: 'Encerrado',
  CANCELADO: 'Cancelado',
};

export function TelaVisaoGeralCampeonato({
  campeonatoId,
}: {
  campeonatoId: string;
}) {
  const { session, hydrated } = useSessao();
  const operacional = useEstadoOperacionalOrganizador(Number(campeonatoId));
  const campeonato = catalogoOrganizadorMock.obterCampeonato(
    campeonatoId,
    session?.account.id ?? '',
    session?.links.organizedChampionshipIds ?? [],
  );
  const [novoColaborador, setNovoColaborador] = useState('');
  const [transferindo, setTransferindo] = useState(false);
  const [novoResponsavel, setNovoResponsavel] = useState('');
  const [feedback, setFeedback] = useState('');
  const [cancelando, setCancelando] = useState(false);
  const [motivoCancelamento, setMotivoCancelamento] = useState('');

  if (!hydrated) return <p role="status">Carregando campeonato...</p>;

  if (!campeonato) {
    return (
      <Card className="p-6">
        <h1 className="font-display text-2xl font-semibold">
          Sem acesso administrativo
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          A conta não possui vínculo ativo com este campeonato. A consulta
          pública continua disponível quando a competição for pública.
        </p>
        <Button asChild variant="campoOutline" className="mt-4">
          <Link href={`/campeonatos/${campeonatoId}`}>Ver página pública</Link>
        </Button>
      </Card>
    );
  }

  const estado = operacional.estado?.estado ?? campeonato.estado;
  const pendencias = operacional.estado?.pendencias ?? campeonato.pendencias;
  const validado = operacional.estado?.validado ?? false;
  const inscricoesAbertas =
    operacional.estado?.inscricoesAbertas ??
    Boolean(campeonato.inscricoesAbertasEm);
  const partidasPendentes = catalogoPublicoMock
    .listarPartidas()
    .filter(
      (partida) =>
        partida.campeonatoId === campeonato.id &&
        !partida.resultadoPublicado &&
        (operacional.estado?.partidaEstados[partida.id] ?? partida.estado) !==
          'CANCELADA' &&
        !operacional.estado?.fatosDefinitivos[partida.id],
    );
  const colaboradores =
    operacional.estado?.colaboradores ??
    catalogoOrganizadorMock.listarConvitesColaborador(Number(campeonatoId));
  const responsavelAtual =
    operacional.estado?.responsavelAtual ?? campeonato.responsavel;
  const responsavel = operacional.estado
    ? operacional.estado.responsavelContaId === session?.account.id
    : campeonato.papelDaConta === 'RESPONSAVEL';
  const emConfiguracao = estado === 'EM_CONFIGURACAO';
  const emAndamento = estado === 'EM_ANDAMENTO';

  function executarPendenciaLocal(item: string) {
    if (item === 'Publicar regulamento') operacional.publicarRegulamento();
    if (item === 'Configurar critérios de desempate')
      operacional.salvarCriterios();
    if (item === 'Validar elencos inscritos') operacional.validarElencos();
    setFeedback(`${item} registrado no estado operacional mock.`);
  }

  return (
    <>
      <CabecalhoPagina
        title={campeonato.nome}
        subtitle={`${campeonato.modalidade} · ${campeonato.contexto.nome}`}
        actions={
          <Button asChild variant="campoOutline">
            <Link href={`/campeonatos/${campeonato.id}`}>
              Visualizar página pública
            </Link>
          </Button>
        }
      />

      <div className="mb-6 rounded-md border border-border bg-card p-4 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <strong>{estadoLabel[estado]}</strong>
            <p className="mt-1 text-muted-foreground">
              {responsavel
                ? 'Você é o responsável ativo'
                : 'Você atua como colaborador'}
            </p>
            <p className="text-muted-foreground">
              Responsável: {responsavelAtual}
            </p>
          </div>
          {inscricoesAbertas && emConfiguracao ? (
            <span className="rounded-full bg-blue-100 px-3 py-1 font-semibold text-blue-800">
              Inscrições abertas
            </span>
          ) : null}
        </div>
      </div>

      {estado !== 'CANCELADO' && estado !== 'ENCERRADO' ? (
        <section aria-label="Operações do campeonato" className="mb-8">
          <h2 className="font-display text-xl font-semibold">Operações</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Button asChild variant="campoOutline">
              <Link href={`/organizador/campeonato/${campeonato.id}/times`}>
                Times e elencos
              </Link>
            </Button>
            <Button asChild variant="campoOutline">
              <Link href={`/organizador/campeonato/${campeonato.id}/partidas`}>
                Operar partidas
              </Link>
            </Button>
            <Button asChild variant="campoOutline">
              <Link href={`/organizador/campeonato/${campeonato.id}/sumula`}>
                Preencher súmula
              </Link>
            </Button>
            <Button asChild variant="campoOutline">
              <Link href={`/organizador/campeonato/${campeonato.id}/reservas`}>
                Reservas de campo
              </Link>
            </Button>
          </div>
        </section>
      ) : null}

      {emConfiguracao ? (
        <section aria-label="Configuração e validação" className="mb-8">
          <Card className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-semibold">
                  Configuração e validação
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Alterações relevantes invalidam a validação anterior.
                </p>
              </div>
              <strong className="text-sm">
                {pendencias.length} pendências bloqueantes
              </strong>
            </div>

            {pendencias.length > 0 ? (
              <ul className="mt-5 space-y-2">
                {pendencias.map((item) => (
                  <li
                    key={item}
                    className="flex flex-col justify-between gap-2 rounded-md bg-muted p-3 sm:flex-row sm:items-center"
                  >
                    <span className="text-sm">{item}</span>
                    {responsavel ? (
                      [
                        'Publicar regulamento',
                        'Configurar critérios de desempate',
                      ].includes(item) ? (
                        <Button
                          size="sm"
                          variant="campoOutline"
                          aria-label={`Registrar: ${item}`}
                          onClick={() => executarPendenciaLocal(item)}
                        >
                          Registrar fato mock
                        </Button>
                      ) : (
                        <Button asChild size="sm" variant="campoOutline">
                          <Link
                            href={`/organizador/campeonato/${campeonato.id}/${item === 'Resolver convites pendentes' || item === 'Validar elencos inscritos' ? 'times' : 'chaveamento'}`}
                          >
                            Resolver na operação correspondente
                          </Link>
                        </Button>
                      )
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-5 rounded-md bg-green-pale p-3 text-sm text-green-dark">
                Nenhuma pendência detectada. O responsável pode revalidar a
                configuração.
              </p>
            )}

            {responsavel ? (
              <div className="mt-5 flex flex-wrap gap-3">
                <Button
                  variant="campoOutline"
                  disabled={pendencias.length > 0}
                  onClick={() => {
                    operacional.validarConfiguracao();
                    setFeedback('Configuração validada localmente');
                  }}
                >
                  Validar configuração
                </Button>
                <Button
                  variant="campoOutline"
                  disabled={!validado || inscricoesAbertas}
                  onClick={() => {
                    operacional.abrirInscricoes();
                    setFeedback('Inscrições abertas');
                  }}
                >
                  Abrir inscrições
                </Button>
                <Button
                  variant="campo"
                  disabled={!validado || !inscricoesAbertas}
                  onClick={() => {
                    operacional.iniciarCampeonato();
                    setFeedback('Campeonato em andamento');
                  }}
                >
                  Iniciar campeonato
                </Button>
              </div>
            ) : null}
          </Card>
        </section>
      ) : null}

      {responsavel && emConfiguracao ? (
        <section aria-label="Equipe organizadora" className="mb-8">
          <Card className="p-5">
            <h2 className="font-display text-xl font-semibold">
              Equipe organizadora
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Convites exigem aceite explícito. Apenas o responsável transfere a
              titularidade ou remove colaboradores.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Input
                aria-label="Usuário ou e-mail do organizador"
                placeholder="usuario ou email"
                value={novoColaborador}
                onChange={(event) => setNovoColaborador(event.target.value)}
              />
              <Button
                variant="campoOutline"
                disabled={!novoColaborador.trim()}
                onClick={() => {
                  operacional.convidarOrganizador(
                    novoColaborador.trim(),
                    campeonato.contexto.nome,
                  );
                  setNovoColaborador('');
                  setFeedback('Convite de organizador enviado localmente.');
                }}
              >
                Convidar organizador
              </Button>
            </div>
            <div className="mt-4 space-y-2">
              {colaboradores.map((colaborador) => (
                <div
                  key={colaborador.id}
                  className="flex flex-col justify-between gap-2 rounded-md bg-muted p-3 sm:flex-row sm:items-center"
                >
                  <p className="text-sm">
                    {colaborador.conta} ·{' '}
                    {colaborador.estado === 'PENDENTE'
                      ? 'Pendente de aceite'
                      : colaborador.estado}
                  </p>
                  {colaborador.estado === 'PENDENTE' ? (
                    <Button
                      size="sm"
                      variant="campoOutline"
                      aria-label={`Cancelar convite de ${colaborador.conta}`}
                      onClick={() =>
                        operacional.cancelarConviteOrganizador(colaborador.id)
                      }
                    >
                      Cancelar convite
                    </Button>
                  ) : colaborador.estado === 'ACEITO' ? (
                    <Button
                      size="sm"
                      variant="campoOutline"
                      onClick={() =>
                        operacional.removerColaborador(colaborador.id)
                      }
                    >
                      Remover colaborador
                    </Button>
                  ) : null}
                </div>
              ))}
            </div>
            <Button
              variant="campoOutline"
              className="mt-4"
              onClick={() => {
                setNovoResponsavel(
                  colaboradores.find((item) => item.estado === 'ACEITO')
                    ?.contaId ?? '',
                );
                setTransferindo(true);
              }}
            >
              Transferir responsabilidade
            </Button>
            {transferindo ? (
              <div className="mt-4 rounded-md border border-border p-4">
                <label
                  htmlFor="novo-responsavel"
                  className="text-sm font-semibold"
                >
                  Novo responsável
                </label>
                <select
                  id="novo-responsavel"
                  className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3"
                  value={novoResponsavel}
                  onChange={(event) => setNovoResponsavel(event.target.value)}
                >
                  {colaboradores
                    .filter((item) => item.estado === 'ACEITO' && item.contaId)
                    .map((item) => (
                      <option key={item.id} value={item.contaId}>
                        {item.conta}
                      </option>
                    ))}
                </select>
                <p className="mt-2 text-sm text-muted-foreground">
                  Você permanecerá como colaborador após a transferência.
                </p>
                <Button
                  variant="campo"
                  className="mt-3"
                  disabled={!novoResponsavel}
                  onClick={() => {
                    const destino = colaboradores.find(
                      (item) => item.contaId === novoResponsavel,
                    );
                    if (!destino?.contaId) return;
                    operacional.transferirResponsabilidade(
                      destino.contaId,
                      destino.conta,
                    );
                    setTransferindo(false);
                    setFeedback(
                      `Responsabilidade transferida localmente para ${destino.conta}.`,
                    );
                  }}
                >
                  Confirmar transferência
                </Button>
              </div>
            ) : null}
          </Card>
        </section>
      ) : null}

      {emAndamento ? (
        <Card className="mb-8 p-5">
          <h2 className="font-display text-xl font-semibold">
            Campeonato em andamento
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Composição, formato e regulamento bloqueados. Permanecem disponíveis
            operações de partidas sem resultado, WO, reservas e súmula.
          </p>
        </Card>
      ) : null}

      {responsavel && (emConfiguracao || emAndamento) ? (
        <section aria-label="Ciclo de vida" className="mb-8">
          <Card className="p-5">
            <h2 className="font-display text-xl font-semibold">
              Ciclo de vida
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Finalização e cancelamento preservam o histórico e exigirão
              transação e auditoria no backend.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {emAndamento ? (
                <Button
                  variant="campoOutline"
                  onClick={() => {
                    if (partidasPendentes.length > 0) {
                      setFeedback(
                        `Finalização bloqueada: ${partidasPendentes.length} partidas ainda não possuem resultado definitivo publicado.`,
                      );
                      return;
                    }
                    operacional.encerrarCampeonato();
                    setFeedback('Campeonato encerrado; histórico preservado.');
                  }}
                >
                  Finalizar campeonato
                </Button>
              ) : null}
              <Button variant="destructive" onClick={() => setCancelando(true)}>
                Cancelar campeonato
              </Button>
            </div>
            {cancelando ? (
              <div className="mt-4 rounded-md border border-danger/30 p-4">
                <label
                  htmlFor="motivo-cancelamento"
                  className="text-sm font-semibold"
                >
                  Motivo do cancelamento
                </label>
                <Input
                  id="motivo-cancelamento"
                  className="mt-2"
                  value={motivoCancelamento}
                  onChange={(event) =>
                    setMotivoCancelamento(event.target.value)
                  }
                />
                <Button
                  variant="destructive"
                  className="mt-3"
                  disabled={!motivoCancelamento.trim()}
                  onClick={() => {
                    operacional.cancelarCampeonato();
                    setCancelando(false);
                    setFeedback(
                      'Campeonato cancelado localmente; histórico preservado.',
                    );
                  }}
                >
                  Confirmar cancelamento
                </Button>
              </div>
            ) : null}
          </Card>
        </section>
      ) : null}

      {estado === 'CANCELADO' ? (
        <Card className="mb-8 p-5">
          <h2 className="font-display text-xl font-semibold">
            Campeonato cancelado
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Novas operações estão bloqueadas. Fatos e resultados já publicados
            permanecem no histórico.
          </p>
        </Card>
      ) : null}

      {estado === 'ENCERRADO' ? (
        <Card className="mb-8 p-5">
          <h2 className="font-display text-xl font-semibold">
            Campeonato encerrado
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Todas as partidas possuem fato definitivo. Novas operações estão
            bloqueadas e o histórico permanece disponível.
          </p>
        </Card>
      ) : null}

      {feedback ? (
        <p
          role="status"
          className="rounded-md bg-green-pale p-3 text-sm font-semibold text-green-dark"
        >
          {feedback}
        </p>
      ) : null}
    </>
  );
}

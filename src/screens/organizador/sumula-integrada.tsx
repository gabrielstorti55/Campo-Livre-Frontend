'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { CabecalhoPagina } from '@/components/layout/cabecalho-pagina';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { usePartidasApi } from '@/contexts/partidas-api';
import { useSessao } from '@/hooks/use-sessao';
import type {
  DetalheAdministrativoPartida,
  DetalhePublicoPartida,
  EscalacaoPartida,
  SumulaDefinitivaInput,
} from '@/types/api/partidas';

type DadosSumula = {
  detalhe: DetalheAdministrativoPartida;
  publico: DetalhePublicoPartida;
  mandante: EscalacaoPartida;
  visitante: EscalacaoPartida;
};

function textoOpcional(valor: string): string | null {
  const normalizado = valor.trim();
  return normalizado || null;
}

function EscalacaoLeitura({
  nomeTime,
  escalacao,
}: {
  nomeTime: string;
  escalacao: EscalacaoPartida;
}) {
  return (
    <Card role="region" aria-label={`Escalação de ${nomeTime}`} className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-lg font-semibold">{nomeTime}</h3>
        <span className="text-xs font-semibold tracking-[0.1em] text-muted-foreground uppercase">
          Informada pelo capitão
        </span>
      </div>
      <div className="mt-4 divide-y divide-border">
        {escalacao.atletas.map((atleta) => (
          <div
            key={atleta.atletaCampeonatoId}
            className="grid gap-1 py-3 text-sm sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-4"
          >
            <strong>{atleta.nomeExibicao}</strong>
            <span>{atleta.situacao === 'TITULAR' ? 'Titular' : 'Reserva'}</span>
            <span className="text-muted-foreground">
              {atleta.posicaoUsada.replaceAll('_', ' ')}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function SecaoOcorrencia({
  titulo,
  descricao,
}: {
  titulo: string;
  descricao: string;
}) {
  return (
    <section className="mt-8 space-y-4">
      <h2 className="font-display text-2xl font-semibold">{titulo}</h2>
      <Card className="border-dashed p-5">
        <p className="text-sm text-muted-foreground">{descricao}</p>
      </Card>
    </section>
  );
}

export function TelaSumulaIntegrada({
  campeonatoId,
  partidaId,
}: {
  campeonatoId: string;
  partidaId: string;
}) {
  const api = usePartidasApi();
  const { executarAutenticado } = useSessao();
  const router = useRouter();
  const chaveIdempotencia = useRef(crypto.randomUUID());
  const [dados, setDados] = useState<DadosSumula | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [arbitro, setArbitro] = useState('');
  const [assistente1, setAssistente1] = useState('');
  const [assistente2, setAssistente2] = useState('');
  const [quartoArbitro, setQuartoArbitro] = useState('');
  const [relatorio, setRelatorio] = useState('');
  const [confirmado, setConfirmado] = useState(false);
  const [revisando, setRevisando] = useState(false);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    let ativo = true;
    if (!api.consultarEscalacao || !api.publicarSumula) {
      Promise.resolve().then(() => {
        if (!ativo) return;
        setErro('A integração da Súmula não está disponível.');
        setCarregando(false);
      });
      return () => {
        ativo = false;
      };
    }
    const consultarEscalacao = api.consultarEscalacao.bind(api);
    void executarAutenticado(async (token) => {
      const [detalhe, publico] = await Promise.all([
        api.consultarAdministracao(partidaId, token),
        api.consultarPartida(partidaId),
      ]);
      if (detalhe.campeonatoId !== campeonatoId) {
        throw new Error('PARTIDA_FORA_DO_CAMPEONATO');
      }
      const [mandante, visitante] = await Promise.all([
        consultarEscalacao(partidaId, detalhe.mandante.timeCampeonatoId, token),
        consultarEscalacao(
          partidaId,
          detalhe.visitante.timeCampeonatoId,
          token,
        ),
      ]);
      return { detalhe, publico, mandante, visitante };
    }).then(
      (resultado) => {
        if (!ativo) return;
        setDados(resultado);
        setCarregando(false);
      },
      () => {
        if (!ativo) return;
        setErro(
          'Não foi possível carregar a partida e as escalações registradas pelos capitães.',
        );
        setCarregando(false);
      },
    );
    return () => {
      ativo = false;
    };
  }, [api, campeonatoId, executarAutenticado, partidaId]);

  if (carregando) return <p role="status">Carregando Súmula...</p>;
  if (!dados) {
    return (
      <Card className="p-6">
        <h1 className="font-display text-2xl font-semibold">
          Súmula indisponível
        </h1>
        <p role="alert" className="mt-2 text-sm text-destructive">
          {erro}
        </p>
      </Card>
    );
  }

  const { detalhe, publico, mandante, visitante } = dados;
  const podePublicar = detalhe.operacoesPermitidas.includes('PUBLICAR_SUMULA');
  const mataMataSemVencedor = publico.fase.tipo === 'MATA_MATA';

  async function continuar() {
    setErro('');
    if (!arbitro.trim()) {
      setErro('Informe o árbitro da partida.');
      return;
    }
    if (!confirmado) {
      setErro('Confirme que revisou os dados da Súmula.');
      return;
    }
    if (!revisando) {
      setRevisando(true);
      return;
    }
    if (!api.publicarSumula) {
      setErro('A publicação integrada não está disponível.');
      return;
    }

    const input: SumulaDefinitivaInput = {
      confirmacaoDefinitiva: true,
      placar: {
        regulamentar: { mandante: 0, visitante: 0 },
        prorrogacao: null,
        penaltis: null,
      },
      arbitragem: {
        arbitro: arbitro.trim(),
        assistente1: textoOpcional(assistente1),
        assistente2: textoOpcional(assistente2),
        quartoArbitro: textoOpcional(quartoArbitro),
      },
      relatorio: textoOpcional(relatorio),
      defesasNormais: [],
      eventos: [],
    };

    setEnviando(true);
    try {
      await executarAutenticado((token) =>
        api.publicarSumula!(partidaId, token, input, chaveIdempotencia.current),
      );
      router.push(
        `/organizador/campeonato/${campeonatoId}/partidas?sumula=confirmada`,
      );
    } catch {
      setErro(
        'Não foi possível publicar a Súmula. A mesma tentativa pode ser reenviada com segurança.',
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <Button className="mb-5" variant="ghost" asChild>
        <Link href={`/organizador/campeonato/${campeonatoId}/partidas`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Partidas
        </Link>
      </Button>
      <CabecalhoPagina
        title="Súmula da partida"
        subtitle="Registre os fatos do jogo e confirme o resultado definitivo"
      />

      <Card className="mb-6 border-green-dark/25 p-5 sm:p-6">
        <p className="text-xs font-semibold tracking-[0.16em] text-green-dark uppercase">
          Rodada {detalhe.rodada}
        </p>
        <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-center">
          <strong className="font-display text-xl">
            {detalhe.mandante.nome}
          </strong>
          <span className="font-display text-3xl font-semibold text-green-dark">
            0 × 0
          </span>
          <strong className="font-display text-xl">
            {detalhe.visitante.nome}
          </strong>
        </div>
        <p className="mt-3 text-center text-sm text-muted-foreground">
          O placar será calculado pelos eventos esportivos registrados.
        </p>
      </Card>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">Escalações</h2>
        <p className="text-sm text-muted-foreground">
          No modo integrado, as escalações são registradas pelos capitães e
          apresentadas ao organizador somente para leitura.
        </p>
        <div className="grid gap-4 lg:grid-cols-2">
          <EscalacaoLeitura
            nomeTime={detalhe.mandante.nome}
            escalacao={mandante}
          />
          <EscalacaoLeitura
            nomeTime={detalhe.visitante.nome}
            escalacao={visitante}
          />
        </div>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="font-display text-2xl font-semibold">
          Equipe de arbitragem
        </h2>
        <Card className="grid gap-4 p-5 sm:grid-cols-2">
          <label className="text-sm font-semibold">
            Árbitro
            <Input
              className="mt-2"
              value={arbitro}
              onChange={(event) => setArbitro(event.target.value)}
              disabled={revisando}
            />
          </label>
          <label className="text-sm font-semibold">
            Primeiro assistente
            <Input
              className="mt-2"
              value={assistente1}
              onChange={(event) => setAssistente1(event.target.value)}
              disabled={revisando}
            />
          </label>
          <label className="text-sm font-semibold">
            Segundo assistente
            <Input
              className="mt-2"
              value={assistente2}
              onChange={(event) => setAssistente2(event.target.value)}
              disabled={revisando}
            />
          </label>
          <label className="text-sm font-semibold">
            Quarto árbitro
            <Input
              className="mt-2"
              value={quartoArbitro}
              onChange={(event) => setQuartoArbitro(event.target.value)}
              disabled={revisando}
            />
          </label>
        </Card>
      </section>

      <SecaoOcorrencia
        titulo="Gols"
        descricao="Nenhum gol registrado. O editor integrado de eventos será habilitado na próxima fatia de paridade."
      />
      <SecaoOcorrencia
        titulo="Cartões"
        descricao="Nenhum cartão registrado. A seção permanece na mesma posição nos dois modos."
      />
      <SecaoOcorrencia
        titulo="Substituições"
        descricao="Nenhuma substituição registrada. A seção permanece na mesma posição nos dois modos."
      />

      {mataMataSemVencedor ? (
        <Card className="mt-6 border-warning p-5">
          <p className="text-sm font-semibold">
            Mata-mata exige um vencedor. A publicação ficará bloqueada até o
            editor integrado permitir registrar o desempate.
          </p>
        </Card>
      ) : null}

      <section className="mt-8 space-y-4">
        <h2 className="font-display text-2xl font-semibold">Relatório</h2>
        <Textarea
          aria-label="Relatório da partida"
          value={relatorio}
          onChange={(event) => setRelatorio(event.target.value)}
          disabled={revisando}
          placeholder="Observações oficiais da partida"
        />
      </section>

      {revisando ? (
        <Card className="mt-6 border-warning p-5">
          <h2 className="font-display text-xl font-semibold">
            Publicação definitiva
          </h2>
          <p className="mt-2 text-sm">
            A partida será encerrada em 0 × 0, sem ocorrências esportivas. Essa
            operação não admite correção posterior.
          </p>
        </Card>
      ) : null}

      <label className="mt-6 flex items-start gap-3 text-sm font-medium">
        <input
          type="checkbox"
          checked={confirmado}
          onChange={(event) => setConfirmado(event.target.checked)}
          disabled={revisando}
        />
        Confirmo que revisei os dados e compreendo que a publicação é
        definitiva.
      </label>

      {erro ? (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {erro}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <Button
          type="button"
          variant="campo"
          onClick={() => void continuar()}
          disabled={!podePublicar || mataMataSemVencedor || enviando}
        >
          {enviando
            ? 'Publicando...'
            : revisando
              ? 'Publicar Súmula definitivamente'
              : 'Revisar Súmula'}
        </Button>
        {revisando ? (
          <Button
            type="button"
            variant="campoOutline"
            onClick={() => setRevisando(false)}
            disabled={enviando}
          >
            Voltar e editar
          </Button>
        ) : null}
      </div>
    </>
  );
}

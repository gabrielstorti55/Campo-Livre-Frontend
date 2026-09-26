'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { CabecalhoPagina } from '@/components/layout/cabecalho-pagina';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { usePartidasApi } from '@/contexts/partidas-api';
import { useSessao } from '@/hooks/use-sessao';
import { obterAtletasDoTimeNoCampeonatoPrototipo } from '@/mocks/organizador/inscricoes-atletas-campeonato';
import type {
  DetalheAdministrativoPartida,
  SumulaCompletaPrototipo,
} from '@/types/api/partidas';

type Lado = 'MANDANTE' | 'VISITANTE';
type Periodo = 'PRIMEIRO_TEMPO' | 'SEGUNDO_TEMPO' | 'PRORROGACAO';
type Posicao = 'GOLEIRO' | 'ZAGUEIRO' | 'LATERAL' | 'MEIO_CAMPO' | 'ATACANTE';
type Atleta = { id: number; nome: string; posicao: string };
type Escalado = {
  atletaId: number;
  situacao: 'TITULAR' | 'RESERVA';
  posicaoUsada: Posicao;
};
type Gol = SumulaCompletaPrototipo['gols'][number] & { id: string };
type Cartao = SumulaCompletaPrototipo['cartoes'][number] & { id: string };
type Substituicao = SumulaCompletaPrototipo['substituicoes'][number] & {
  id: string;
};

const periodos: Array<{ value: Periodo; label: string }> = [
  { value: 'PRIMEIRO_TEMPO', label: 'Primeiro tempo' },
  { value: 'SEGUNDO_TEMPO', label: 'Segundo tempo' },
  { value: 'PRORROGACAO', label: 'Prorrogação' },
];
const posicoes: Array<{ value: Posicao; label: string }> = [
  { value: 'GOLEIRO', label: 'Goleiro' },
  { value: 'ZAGUEIRO', label: 'Zagueiro' },
  { value: 'LATERAL', label: 'Lateral' },
  { value: 'MEIO_CAMPO', label: 'Meio-campo' },
  { value: 'ATACANTE', label: 'Atacante' },
];

function normalizarPosicao(posicao: string): Posicao {
  const valor = posicao.toLocaleLowerCase('pt-BR');
  if (valor.includes('goleir')) return 'GOLEIRO';
  if (valor.includes('zagueir')) return 'ZAGUEIRO';
  if (valor.includes('lateral')) return 'LATERAL';
  if (valor.includes('meio')) return 'MEIO_CAMPO';
  return 'ATACANTE';
}

function criarEscalacao(atletas: Atleta[]): Escalado[] {
  return atletas.map((atleta, indice) => ({
    atletaId: atleta.id,
    situacao: indice < 5 ? 'TITULAR' : 'RESERVA',
    posicaoUsada: normalizarPosicao(atleta.posicao),
  }));
}

function nomeAtleta(atletas: Atleta[], id: number) {
  return atletas.find((atleta) => atleta.id === id)?.nome ?? 'Atleta';
}

function momento(periodo: Periodo, minuto: number, acrescimo: number | null) {
  const nome =
    periodos.find((item) => item.value === periodo)?.label ?? periodo;
  return `${nome} · ${minuto}${acrescimo ? `+${acrescimo}` : ''}'`;
}

export function TelaSumulaChaveamento({
  campeonatoId,
  partidaId,
}: {
  campeonatoId: string;
  partidaId: string;
}) {
  const partidasApi = usePartidasApi();
  const { hydrated, session, executarAutenticado } = useSessao();
  const [detalhe, setDetalhe] = useState<DetalheAdministrativoPartida | null>(
    null,
  );
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!hydrated || !session?.prototipo || !partidaId) return;
    let ativo = true;
    void executarAutenticado((token) =>
      partidasApi.consultarAdministracao(partidaId, token),
    ).then(
      (resultado) => ativo && setDetalhe(resultado),
      () => ativo && setErro('Não foi possível carregar a partida.'),
    );
    return () => {
      ativo = false;
    };
  }, [
    executarAutenticado,
    hydrated,
    partidaId,
    partidasApi,
    session?.prototipo,
  ]);

  if (!hydrated) return <p role="status">Carregando súmula...</p>;
  if (!session?.prototipo || !partidasApi.registrarSumulaPrototipo) {
    return (
      <Card className="p-6">
        <h1 className="font-display text-2xl font-semibold">
          Súmula integrada indisponível
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          O envio integrado permanecerá bloqueado até que o contrato HTTP seja
          publicado.
        </p>
      </Card>
    );
  }
  if (erro) return <Card className="p-6 text-sm text-destructive">{erro}</Card>;
  if (!detalhe) return <p role="status">Carregando partida...</p>;
  if (detalhe.estado !== 'AGENDADA') {
    return (
      <Card className="p-6">
        <h1 className="font-display text-2xl font-semibold">
          Súmula indisponível
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          A partida precisa estar agendada e ainda não pode possuir resultado.
        </p>
      </Card>
    );
  }

  return <FormularioSumula detalhe={detalhe} />;
}

function FormularioSumula({
  detalhe,
}: {
  detalhe: DetalheAdministrativoPartida;
}) {
  const partidasApi = usePartidasApi();
  const { executarAutenticado } = useSessao();
  const router = useRouter();
  const elencoMandante = useMemo(
    () =>
      obterAtletasDoTimeNoCampeonatoPrototipo(
        detalhe.campeonatoId,
        detalhe.mandante.timeId,
      ),
    [detalhe.campeonatoId, detalhe.mandante.timeId],
  );
  const elencoVisitante = useMemo(
    () =>
      obterAtletasDoTimeNoCampeonatoPrototipo(
        detalhe.campeonatoId,
        detalhe.visitante.timeId,
      ),
    [detalhe.campeonatoId, detalhe.visitante.timeId],
  );
  const mandante = elencoMandante.inscritos;
  const visitante = elencoVisitante.inscritos;
  const [escalacaoMandante, setEscalacaoMandante] = useState(() =>
    criarEscalacao(mandante),
  );
  const [escalacaoVisitante, setEscalacaoVisitante] = useState(() =>
    criarEscalacao(visitante),
  );
  const [arbitragem, setArbitragem] = useState({
    arbitro: '',
    primeiroAssistente: '',
    segundoAssistente: '',
    quartoArbitro: '',
  });
  const [gols, setGols] = useState<Gol[]>([]);
  const [penaltisMandante, setPenaltisMandante] = useState('');
  const [penaltisVisitante, setPenaltisVisitante] = useState('');
  const [cartoes, setCartoes] = useState<Cartao[]>([]);
  const [substituicoes, setSubstituicoes] = useState<Substituicao[]>([]);
  const [ladoGol, setLadoGol] = useState<Lado>('MANDANTE');
  const [atletaGol, setAtletaGol] = useState(String(mandante[0]?.id ?? ''));
  const [periodoGol, setPeriodoGol] = useState<Periodo>('SEGUNDO_TEMPO');
  const [minutoGol, setMinutoGol] = useState('');
  const [acrescimoGol, setAcrescimoGol] = useState('');
  const [ladoCartao, setLadoCartao] = useState<Lado>('MANDANTE');
  const [atletaCartao, setAtletaCartao] = useState(
    String(mandante[0]?.id ?? ''),
  );
  const [tipoCartao, setTipoCartao] = useState<'AMARELO' | 'VERMELHO'>(
    'AMARELO',
  );
  const [periodoCartao, setPeriodoCartao] = useState<Periodo>('SEGUNDO_TEMPO');
  const [minutoCartao, setMinutoCartao] = useState('');
  const [ladoSubstituicao, setLadoSubstituicao] = useState<Lado>('MANDANTE');
  const [atletaSai, setAtletaSai] = useState(String(mandante[0]?.id ?? ''));
  const [atletaEntra, setAtletaEntra] = useState(String(mandante[1]?.id ?? ''));
  const [periodoSubstituicao, setPeriodoSubstituicao] =
    useState<Periodo>('SEGUNDO_TEMPO');
  const [minutoSubstituicao, setMinutoSubstituicao] = useState('');
  const [relatorio, setRelatorio] = useState('');
  const [confirmacao, setConfirmacao] = useState(false);
  const [revisando, setRevisando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const atletasDoLado = (lado: Lado) =>
    lado === 'MANDANTE' ? mandante : visitante;
  const nomeTime = (lado: Lado) =>
    lado === 'MANDANTE' ? detalhe.mandante.nome : detalhe.visitante.nome;

  const atualizarEscalacao = (
    lado: Lado,
    atletaId: number,
    alteracao: Partial<Escalado>,
  ) => {
    const setter =
      lado === 'MANDANTE' ? setEscalacaoMandante : setEscalacaoVisitante;
    setter((atual) =>
      atual.map((item) =>
        item.atletaId === atletaId ? { ...item, ...alteracao } : item,
      ),
    );
  };

  const seletorPeriodo = (
    value: Periodo,
    onChange: (valor: Periodo) => void,
    label: string,
  ) => (
    <label className="text-sm font-semibold">
      {label}
      <select
        className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3"
        value={value}
        onChange={(event) => onChange(event.target.value as Periodo)}
      >
        {periodos.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );

  const renderEscalacao = (
    lado: Lado,
    atletas: Atleta[],
    escalacao: Escalado[],
  ) => (
    <div className="space-y-3">
      {atletas.map((atleta) => {
        const item = escalacao.find((valor) => valor.atletaId === atleta.id)!;
        return (
          <div
            key={atleta.id}
            className="border-b border-border pb-3 last:border-0"
          >
            <p className="text-sm font-semibold">{atleta.nome}</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <select
                aria-label={`Situação de ${atleta.nome}`}
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                value={item.situacao}
                onChange={(event) =>
                  atualizarEscalacao(lado, atleta.id, {
                    situacao: event.target.value as Escalado['situacao'],
                  })
                }
              >
                <option value="TITULAR">Titular</option>
                <option value="RESERVA">Reserva</option>
              </select>
              <select
                aria-label={`Posição de ${atleta.nome}`}
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                value={item.posicaoUsada}
                onChange={(event) =>
                  atualizarEscalacao(lado, atleta.id, {
                    posicaoUsada: event.target.value as Posicao,
                  })
                }
              >
                {posicoes.map((posicao) => (
                  <option key={posicao.value} value={posicao.value}>
                    {posicao.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );
      })}
    </div>
  );

  const placarMandante = gols.filter((gol) => gol.lado === 'MANDANTE').length;
  const placarVisitante = gols.filter((gol) => gol.lado === 'VISITANTE').length;

  const validar = () => {
    if (!mandante.length || !visitante.length)
      return 'Os dois times precisam ter elenco.';
    if (Object.values(arbitragem).some((nome) => !nome.trim())) {
      return 'Informe toda a equipe de arbitragem.';
    }
    if (
      placarMandante === placarVisitante &&
      (penaltisMandante === '' ||
        penaltisVisitante === '' ||
        !Number.isInteger(Number(penaltisMandante)) ||
        !Number.isInteger(Number(penaltisVisitante)) ||
        Number(penaltisMandante) < 0 ||
        Number(penaltisVisitante) < 0 ||
        Number(penaltisMandante) === Number(penaltisVisitante))
    ) {
      return 'Informe um vencedor na disputa por pênaltis.';
    }
    if (!confirmacao) return 'Confirme que revisou os dados da súmula.';
    if (
      [...gols, ...cartoes, ...substituicoes].some(
        (evento) => !Number.isInteger(evento.minuto) || evento.minuto < 0,
      )
    ) {
      return 'Revise os minutos informados nos eventos da partida.';
    }
    return '';
  };

  const enviar = async () => {
    const mensagem = validar();
    if (mensagem) return setErro(mensagem);
    if (!revisando) {
      setErro('');
      setRevisando(true);
      return;
    }
    if (!partidasApi.registrarSumulaPrototipo) return;
    setSalvando(true);
    try {
      const resultado = await executarAutenticado((token) =>
        partidasApi.registrarSumulaPrototipo!(detalhe.partidaId, token, {
          golsMandante: placarMandante,
          golsVisitante: placarVisitante,
          placarPenaltis:
            placarMandante === placarVisitante
              ? {
                  mandante: Number(penaltisMandante),
                  visitante: Number(penaltisVisitante),
                }
              : null,
          arbitragem,
          escalacaoMandante,
          escalacaoVisitante,
          gols: gols.map(({ id: _id, ...gol }) => gol),
          cartoes: cartoes.map(({ id: _id, ...cartao }) => cartao),
          substituicoes: substituicoes.map(({ id: _id, ...item }) => item),
          relatorio: relatorio.trim(),
        }),
      );
      router.push(
        `/organizador/campeonato/${detalhe.campeonatoId}/partidas?sumula=confirmada&final=${resultado.finalLiberada ? '1' : '0'}`,
      );
    } catch {
      setErro(
        'Não foi possível confirmar a súmula. Revise os dados e tente novamente.',
      );
      setRevisando(false);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <>
      <Button className="mb-5" variant="ghost" asChild>
        <Link href={`/organizador/campeonato/${detalhe.campeonatoId}/partidas`}>
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
          Mata-mata · rodada {detalhe.rodada}
        </p>
        <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-center">
          <strong className="font-display text-xl">
            {detalhe.mandante.nome}
          </strong>
          <span className="font-display text-3xl font-semibold text-green-dark">
            {placarMandante} × {placarVisitante}
          </span>
          <strong className="font-display text-xl">
            {detalhe.visitante.nome}
          </strong>
        </div>
        <p className="mt-3 text-center text-sm text-muted-foreground">
          O placar é calculado pelos gols registrados abaixo.
        </p>
        {placarMandante === placarVisitante ? (
          <div className="mx-auto mt-5 max-w-md border-t border-green-dark/15 pt-4">
            <p className="text-center text-sm font-semibold">
              Desempate por pênaltis
            </p>
            <div className="mt-3 flex items-center justify-center gap-3">
              <Input
                aria-label={`Pênaltis de ${detalhe.mandante.nome}`}
                className="h-12 w-20 text-center text-xl font-semibold"
                type="number"
                min={0}
                value={penaltisMandante}
                onChange={(event) => {
                  setPenaltisMandante(event.target.value);
                  setRevisando(false);
                }}
              />
              <span className="font-display text-xl">×</span>
              <Input
                aria-label={`Pênaltis de ${detalhe.visitante.nome}`}
                className="h-12 w-20 text-center text-xl font-semibold"
                type="number"
                min={0}
                value={penaltisVisitante}
                onChange={(event) => {
                  setPenaltisVisitante(event.target.value);
                  setRevisando(false);
                }}
              />
            </div>
          </div>
        ) : null}
      </Card>

      <Card className="mb-8 border-blue-900/20 p-5">
        <h2 className="font-display text-lg font-semibold">
          Inscrição de atletas no campeonato
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Estar no elenco de um time não inscreve automaticamente o atleta nesta
          competição. A Súmula permite selecionar somente os atletas inscritos
          na Copa Demonstração 2026.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {[
            {
              nome: detalhe.mandante.nome,
              inscritos: elencoMandante.inscritos.length,
              total:
                elencoMandante.inscritos.length +
                elencoMandante.naoInscritos.length,
              fora: elencoMandante.naoInscritos,
            },
            {
              nome: detalhe.visitante.nome,
              inscritos: elencoVisitante.inscritos.length,
              total:
                elencoVisitante.inscritos.length +
                elencoVisitante.naoInscritos.length,
              fora: elencoVisitante.naoInscritos,
            },
          ].map((time) => (
            <div key={time.nome} className="border-l-2 border-blue-900/40 pl-3">
              <p className="text-sm font-semibold">{time.nome}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {time.inscritos} inscritos de {time.total} atletas no elenco
              </p>
              {time.fora.length ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Fora deste campeonato:{' '}
                  {time.fora.map((item) => item.nome).join(', ')}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </Card>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">Escalações</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="p-5">
            <h3 className="mb-4 font-display text-lg font-semibold">
              {detalhe.mandante.nome}
            </h3>
            {renderEscalacao('MANDANTE', mandante, escalacaoMandante)}
          </Card>
          <Card className="p-5">
            <h3 className="mb-4 font-display text-lg font-semibold">
              {detalhe.visitante.nome}
            </h3>
            {renderEscalacao('VISITANTE', visitante, escalacaoVisitante)}
          </Card>
        </div>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="font-display text-2xl font-semibold">
          Equipe de arbitragem
        </h2>
        <Card className="grid gap-4 p-5 sm:grid-cols-2">
          {(
            [
              ['Árbitro', 'arbitro'],
              ['Primeiro assistente', 'primeiroAssistente'],
              ['Segundo assistente', 'segundoAssistente'],
              ['Quarto árbitro', 'quartoArbitro'],
            ] as const
          ).map(([label, campo]) => (
            <label key={campo} className="text-sm font-semibold">
              {label}
              <Input
                className="mt-2"
                value={arbitragem[campo]}
                onChange={(event) =>
                  setArbitragem((atual) => ({
                    ...atual,
                    [campo]: event.target.value,
                  }))
                }
              />
            </label>
          ))}
        </Card>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="font-display text-2xl font-semibold">Gols</h2>
        <Card className="space-y-4 p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <label className="text-sm font-semibold">
              Time
              <select
                className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3"
                value={ladoGol}
                onChange={(event) => {
                  const lado = event.target.value as Lado;
                  setLadoGol(lado);
                  setAtletaGol(String(atletasDoLado(lado)[0]?.id ?? ''));
                }}
              >
                <option value="MANDANTE">{detalhe.mandante.nome}</option>
                <option value="VISITANTE">{detalhe.visitante.nome}</option>
              </select>
            </label>
            <label className="text-sm font-semibold">
              Autor
              <select
                className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3"
                value={atletaGol}
                onChange={(event) => setAtletaGol(event.target.value)}
              >
                {atletasDoLado(ladoGol).map((atleta) => (
                  <option key={atleta.id} value={atleta.id}>
                    {atleta.nome}
                  </option>
                ))}
              </select>
            </label>
            {seletorPeriodo(periodoGol, setPeriodoGol, 'Período')}
            <label className="text-sm font-semibold">
              Minuto
              <Input
                className="mt-2"
                type="number"
                min={0}
                value={minutoGol}
                onChange={(event) => setMinutoGol(event.target.value)}
              />
            </label>
            <label className="text-sm font-semibold">
              Acréscimo
              <Input
                className="mt-2"
                type="number"
                min={1}
                placeholder="Opcional"
                value={acrescimoGol}
                onChange={(event) => setAcrescimoGol(event.target.value)}
              />
            </label>
          </div>
          <Button
            type="button"
            variant="campoOutline"
            disabled={!atletaGol || minutoGol === ''}
            onClick={() => {
              setGols((atual) => [
                ...atual,
                {
                  id: crypto.randomUUID(),
                  atletaId: Number(atletaGol),
                  lado: ladoGol,
                  periodo: periodoGol,
                  minuto: Number(minutoGol),
                  acrescimo: acrescimoGol ? Number(acrescimoGol) : null,
                },
              ]);
              setMinutoGol('');
              setAcrescimoGol('');
              setRevisando(false);
            }}
          >
            Adicionar gol
          </Button>
          {gols.map((gol) => (
            <div
              key={gol.id}
              className="flex items-center justify-between gap-3 border-t pt-3 text-sm"
            >
              <span>
                {nomeTime(gol.lado)} ·{' '}
                {nomeAtleta(atletasDoLado(gol.lado), gol.atletaId)} ·{' '}
                {momento(gol.periodo, gol.minuto, gol.acrescimo)}
              </span>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setGols((atual) =>
                    atual.filter((item) => item.id !== gol.id),
                  );
                  setRevisando(false);
                }}
              >
                Remover
              </Button>
            </div>
          ))}
        </Card>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="font-display text-2xl font-semibold">Cartões</h2>
        <Card className="space-y-4 p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <label className="text-sm font-semibold">
              Time
              <select
                className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3"
                value={ladoCartao}
                onChange={(event) => {
                  const lado = event.target.value as Lado;
                  setLadoCartao(lado);
                  setAtletaCartao(String(atletasDoLado(lado)[0]?.id ?? ''));
                }}
              >
                <option value="MANDANTE">{detalhe.mandante.nome}</option>
                <option value="VISITANTE">{detalhe.visitante.nome}</option>
              </select>
            </label>
            <label className="text-sm font-semibold">
              Atleta
              <select
                className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3"
                value={atletaCartao}
                onChange={(event) => setAtletaCartao(event.target.value)}
              >
                {atletasDoLado(ladoCartao).map((atleta) => (
                  <option key={atleta.id} value={atleta.id}>
                    {atleta.nome}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold">
              Cartão
              <select
                className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3"
                value={tipoCartao}
                onChange={(event) =>
                  setTipoCartao(event.target.value as 'AMARELO' | 'VERMELHO')
                }
              >
                <option value="AMARELO">Amarelo</option>
                <option value="VERMELHO">Vermelho</option>
              </select>
            </label>
            {seletorPeriodo(periodoCartao, setPeriodoCartao, 'Período')}
            <label className="text-sm font-semibold">
              Minuto
              <Input
                className="mt-2"
                type="number"
                min={0}
                value={minutoCartao}
                onChange={(event) => setMinutoCartao(event.target.value)}
              />
            </label>
          </div>
          <Button
            type="button"
            variant="campoOutline"
            disabled={!atletaCartao || minutoCartao === ''}
            onClick={() => {
              setCartoes((atual) => [
                ...atual,
                {
                  id: crypto.randomUUID(),
                  atletaId: Number(atletaCartao),
                  lado: ladoCartao,
                  tipo: tipoCartao,
                  periodo: periodoCartao,
                  minuto: Number(minutoCartao),
                  acrescimo: null,
                },
              ]);
              setMinutoCartao('');
              setRevisando(false);
            }}
          >
            Adicionar cartão
          </Button>
          {cartoes.map((cartao) => (
            <div
              key={cartao.id}
              className="flex items-center justify-between gap-3 border-t pt-3 text-sm"
            >
              <span>
                {cartao.tipo === 'AMARELO' ? 'Amarelo' : 'Vermelho'} ·{' '}
                {nomeAtleta(atletasDoLado(cartao.lado), cartao.atletaId)} ·{' '}
                {momento(cartao.periodo, cartao.minuto, cartao.acrescimo)}
              </span>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setCartoes((atual) =>
                    atual.filter((item) => item.id !== cartao.id),
                  );
                  setRevisando(false);
                }}
              >
                Remover
              </Button>
            </div>
          ))}
        </Card>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="font-display text-2xl font-semibold">Substituições</h2>
        <Card className="space-y-4 p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <label className="text-sm font-semibold">
              Time
              <select
                className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3"
                value={ladoSubstituicao}
                onChange={(event) => {
                  const lado = event.target.value as Lado;
                  const atletas = atletasDoLado(lado);
                  setLadoSubstituicao(lado);
                  setAtletaSai(String(atletas[0]?.id ?? ''));
                  setAtletaEntra(String(atletas[1]?.id ?? ''));
                }}
              >
                <option value="MANDANTE">{detalhe.mandante.nome}</option>
                <option value="VISITANTE">{detalhe.visitante.nome}</option>
              </select>
            </label>
            <label className="text-sm font-semibold">
              Sai
              <select
                className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3"
                value={atletaSai}
                onChange={(event) => setAtletaSai(event.target.value)}
              >
                {atletasDoLado(ladoSubstituicao).map((atleta) => (
                  <option key={atleta.id} value={atleta.id}>
                    {atleta.nome}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold">
              Entra
              <select
                className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3"
                value={atletaEntra}
                onChange={(event) => setAtletaEntra(event.target.value)}
              >
                {atletasDoLado(ladoSubstituicao).map((atleta) => (
                  <option key={atleta.id} value={atleta.id}>
                    {atleta.nome}
                  </option>
                ))}
              </select>
            </label>
            {seletorPeriodo(
              periodoSubstituicao,
              setPeriodoSubstituicao,
              'Período',
            )}
            <label className="text-sm font-semibold">
              Minuto
              <Input
                className="mt-2"
                type="number"
                min={0}
                value={minutoSubstituicao}
                onChange={(event) => setMinutoSubstituicao(event.target.value)}
              />
            </label>
          </div>
          <Button
            type="button"
            variant="campoOutline"
            disabled={
              !atletaSai ||
              !atletaEntra ||
              atletaSai === atletaEntra ||
              minutoSubstituicao === ''
            }
            onClick={() => {
              setSubstituicoes((atual) => [
                ...atual,
                {
                  id: crypto.randomUUID(),
                  lado: ladoSubstituicao,
                  atletaSaiId: Number(atletaSai),
                  atletaEntraId: Number(atletaEntra),
                  periodo: periodoSubstituicao,
                  minuto: Number(minutoSubstituicao),
                  acrescimo: null,
                },
              ]);
              setMinutoSubstituicao('');
              setRevisando(false);
            }}
          >
            Adicionar substituição
          </Button>
          {substituicoes.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 border-t pt-3 text-sm"
            >
              <span>
                {nomeTime(item.lado)} · sai{' '}
                {nomeAtleta(atletasDoLado(item.lado), item.atletaSaiId)} · entra{' '}
                {nomeAtleta(atletasDoLado(item.lado), item.atletaEntraId)} ·{' '}
                {momento(item.periodo, item.minuto, item.acrescimo)}
              </span>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setSubstituicoes((atual) =>
                    atual.filter((valor) => valor.id !== item.id),
                  );
                  setRevisando(false);
                }}
              >
                Remover
              </Button>
            </div>
          ))}
        </Card>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="font-display text-2xl font-semibold">
          Relatório oficial
        </h2>
        <Card className="p-5">
          <Textarea
            rows={6}
            value={relatorio}
            onChange={(event) => {
              setRelatorio(event.target.value);
              setRevisando(false);
            }}
            placeholder="Registre ocorrências relevantes da partida"
          />
        </Card>
      </section>

      <Card className="mt-8 space-y-4 border-warning/50 bg-warning/10 p-5">
        <h2 className="font-display text-xl font-semibold">Envio definitivo</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          A confirmação encerra a partida, registra a Súmula e classifica o
          vencedor para o próximo confronto.
        </p>
        <label className="flex items-start gap-3 text-sm font-semibold">
          <input
            className="mt-1"
            type="checkbox"
            checked={confirmacao}
            onChange={(event) => {
              setConfirmacao(event.target.checked);
              setRevisando(false);
            }}
          />
          Revisei as escalações, eventos, arbitragem e o resultado.
        </label>
        {revisando ? (
          <p className="border-y border-warning/40 py-3 text-sm font-semibold">
            Confirme: {detalhe.mandante.nome} {placarMandante} ×{' '}
            {placarVisitante} {detalhe.visitante.nome}. Esta operação não poderá
            ser refeita.
          </p>
        ) : null}
        {erro ? (
          <p role="alert" className="text-sm font-semibold text-destructive">
            {erro}
          </p>
        ) : null}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="campoOutline"
            onClick={() =>
              router.push(
                `/organizador/campeonato/${detalhe.campeonatoId}/partidas`,
              )
            }
          >
            Voltar para partidas
          </Button>
          <Button
            variant="campo"
            disabled={salvando}
            onClick={() => void enviar()}
          >
            {salvando
              ? 'Enviando...'
              : revisando
                ? 'Confirmar Súmula definitiva'
                : 'Revisar Súmula'}
          </Button>
        </div>
      </Card>
    </>
  );
}

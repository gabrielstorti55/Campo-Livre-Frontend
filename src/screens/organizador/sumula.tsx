'use client';

import { useRef, useState } from 'react';

import { useSessao } from '@/hooks/use-sessao';
import { catalogoOrganizadorMock } from '@/services/organizador/catalogo-organizador.mock';
import {
  atualizarEscalado,
  criarRascunhoEscalacao,
  type AtletaEscaladoRascunho,
  type PosicaoEscalacao,
  type SituacaoEscalacao,
} from '@/services/organizador/rascunho-escalacao';
import {
  criarTempoEvento,
  formatarTempoEvento,
  type PeriodoEvento,
  type TempoEvento,
} from '@/services/organizador/tempo-evento';
import {
  type FatoDefinitivoPartida,
  useEstadoOperacionalOrganizador,
} from '@/stores/estado-operacional-organizador';
import {
  obterNomeCampoPartida,
  obterNomeTimePublico,
  catalogoPublicoMock,
} from '@/services/publico/catalogo-publico.mock';
import { Cartao } from '@/components/layout/cartao';
import { CampoFormulario } from '@/components/layout/campo-formulario';
import { CabecalhoPagina } from '@/components/layout/cabecalho-pagina';
import { Secao } from '@/components/layout/secao';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type Evento = {
  id: number;
  resumo: string;
  lado: 'casa' | 'fora';
  tempo: TempoEvento;
};

const posicoesEscalacao: Array<{
  valor: PosicaoEscalacao;
  rotulo: string;
}> = [
  { valor: 'GOLEIRO', rotulo: 'Goleiro' },
  { valor: 'ZAGUEIRO', rotulo: 'Zagueiro' },
  { valor: 'LATERAL', rotulo: 'Lateral' },
  { valor: 'MEIO_CAMPO', rotulo: 'Meio-campo' },
  { valor: 'ATACANTE', rotulo: 'Atacante' },
];

export function TelaSumula({ campeonatoId }: { campeonatoId: string }) {
  const { session, hydrated } = useSessao();
  const [agora] = useState(() => Date.now());
  const operacional = useEstadoOperacionalOrganizador(Number(campeonatoId));
  const campeonato = catalogoOrganizadorMock.obterCampeonato(
    campeonatoId,
    session?.account.id ?? '',
    session?.links.organizedChampionshipIds ?? [],
  );
  const partidasElegiveis = catalogoPublicoMock
    .listarPartidas()
    .filter((item) => {
      const estadoPartida =
        operacional.estado?.partidaEstados[item.id] ?? item.estado;
      return (
        item.campeonatoId === Number(campeonatoId) &&
        !item.resultadoPublicado &&
        !operacional.estado?.fatosDefinitivos[item.id] &&
        estadoPartida === 'AGENDADA' &&
        Boolean(item.data && item.hora) &&
        new Date(`${item.data}T${item.hora}:00`).getTime() <= agora
      );
    });
  const [partidaSelecionadaId, setPartidaSelecionadaId] = useState(
    partidasElegiveis[0]?.id ?? 0,
  );
  const partida =
    partidasElegiveis.find((item) => item.id === partidaSelecionadaId) ??
    partidasElegiveis[0];
  const elencoCasa = partida
    ? (catalogoPublicoMock.obterTime(partida.timeCasaId)?.elenco ?? []).filter(
        (atleta) => (partida.escalacaoCasaAtletaIds ?? []).includes(atleta.id),
      )
    : [];
  const elencoFora = partida
    ? (catalogoPublicoMock.obterTime(partida.timeForaId)?.elenco ?? []).filter(
        (atleta) => (partida.escalacaoForaAtletaIds ?? []).includes(atleta.id),
      )
    : [];
  const elenco = [...elencoCasa, ...elencoFora];
  const [escalacaoCasa, setEscalacaoCasa] = useState(() =>
    criarRascunhoEscalacao(elencoCasa),
  );
  const [escalacaoFora, setEscalacaoFora] = useState(() =>
    criarRascunhoEscalacao(elencoFora),
  );
  const jogo = {
    id: partida?.id ?? 0,
    casa: partida ? obterNomeTimePublico(partida.timeCasaId) : 'Time da casa',
    fora: partida ? obterNomeTimePublico(partida.timeForaId) : 'Time visitante',
    data: partida?.data ?? 'Data a definir',
    hora: partida?.hora ?? 'Horário a definir',
    campo: obterNomeCampoPartida(partida?.campoId),
  };
  const [casa, setCasa] = useState(0);
  const [fora, setFora] = useState(0);
  const [jogadorGol, setJogadorGol] = useState(String(elencoCasa[0]?.id ?? ''));
  const [timeGol, setTimeGol] = useState<'casa' | 'fora'>('casa');
  const [periodoGol, setPeriodoGol] = useState<PeriodoEvento>('segundo-tempo');
  const [minutoGol, setMinutoGol] = useState('');
  const [acrescimoGol, setAcrescimoGol] = useState('');
  const [gols, setGols] = useState<Evento[]>([]);
  const [jogadorCartao, setJogadorCartao] = useState(
    String(elencoCasa[0]?.id ?? ''),
  );
  const [timeCartao, setTimeCartao] = useState<'casa' | 'fora'>('casa');
  const [tipoCartao, setTipoCartao] = useState('amarelo');
  const [periodoCartao, setPeriodoCartao] =
    useState<PeriodoEvento>('segundo-tempo');
  const [minutoCartao, setMinutoCartao] = useState('');
  const [acrescimoCartao, setAcrescimoCartao] = useState('');
  const [cartoes, setCartoes] = useState<Evento[]>([]);
  const [timeSubstituicao, setTimeSubstituicao] = useState<'casa' | 'fora'>(
    'casa',
  );
  const [jogadorSaiu, setJogadorSaiu] = useState(
    String(elencoCasa[0]?.id ?? ''),
  );
  const [jogadorEntrou, setJogadorEntrou] = useState(
    String(elencoCasa[1]?.id ?? ''),
  );
  const [periodoSubstituicao, setPeriodoSubstituicao] =
    useState<PeriodoEvento>('segundo-tempo');
  const [minutoSubstituicao, setMinutoSubstituicao] = useState('');
  const [acrescimoSubstituicao, setAcrescimoSubstituicao] = useState('');
  const [substituicoes, setSubstituicoes] = useState<Evento[]>([]);
  const [confirmacao, setConfirmacao] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [enviada, setEnviada] = useState(false);
  const abrirConfirmacaoRef = useRef<HTMLButtonElement>(null);
  const [sumulaRevisada, setSumulaRevisada] = useState<{
    partidaId: number;
    fato: FatoDefinitivoPartida;
  } | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const nomeJogador = (id: string) =>
    elenco.find((item) => String(item.id) === id)?.nome ?? 'Atleta';
  const nomeTime = (lado: 'casa' | 'fora') =>
    lado === 'casa' ? jogo.casa : jogo.fora;
  const elencoDoLado = (lado: 'casa' | 'fora') =>
    lado === 'casa' ? elencoCasa : elencoFora;
  const atletaElegivel = (
    lado: 'casa' | 'fora',
    atletaId: string,
    indiceFallback = 0,
  ) =>
    elencoDoLado(lado).find((item) => String(item.id) === atletaId) ??
    elencoDoLado(lado)[indiceFallback];
  const jogadorGolEfetivo = String(
    atletaElegivel(timeGol, jogadorGol)?.id ?? '',
  );
  const jogadorCartaoEfetivo = String(
    atletaElegivel(timeCartao, jogadorCartao)?.id ?? '',
  );
  const jogadorSaiuEfetivo = String(
    atletaElegivel(timeSubstituicao, jogadorSaiu)?.id ?? '',
  );
  const jogadorEntrouEfetivo = String(
    atletaElegivel(timeSubstituicao, jogadorEntrou, 1)?.id ?? '',
  );
  const remover = (
    id: number,
    setter: React.Dispatch<React.SetStateAction<Evento[]>>,
  ) => setter((eventos) => eventos.filter((evento) => evento.id !== id));
  const tempoSeguro = (
    periodo: PeriodoEvento,
    minuto: string,
    acrescimo: string,
  ) => {
    try {
      return criarTempoEvento(periodo, minuto, acrescimo);
    } catch (error) {
      setErro(
        error instanceof Error ? error.message : 'Tempo do evento inválido.',
      );
      return null;
    }
  };
  const atualizarEscalacao = (
    lado: 'casa' | 'fora',
    atletaId: number,
    campo: 'situacao' | 'posicaoUsada',
    valor: SituacaoEscalacao | PosicaoEscalacao,
  ) => {
    const setter = lado === 'casa' ? setEscalacaoCasa : setEscalacaoFora;
    setter((atletas) =>
      atletas.map((atleta) =>
        atleta.atletaId === atletaId
          ? atualizarEscalado(atleta, {
              situacao:
                campo === 'situacao'
                  ? (valor as SituacaoEscalacao)
                  : atleta.situacao,
              posicaoUsada:
                campo === 'posicaoUsada'
                  ? (valor as PosicaoEscalacao)
                  : atleta.posicaoUsada,
            })
          : atleta,
      ),
    );
  };
  const renderEscalacao = (
    lado: 'casa' | 'fora',
    atletas: AtletaEscaladoRascunho[],
  ) => (
    <ul className="mt-2 space-y-3">
      {atletas.map((atleta) => (
        <li key={atleta.atletaId} className="rounded-md border p-3">
          <p className="text-sm font-semibold">{atleta.nome}</p>
          <p className="text-xs text-muted-foreground">
            Posição principal: {atleta.posicaoPrincipal}
          </p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <select
              aria-label={`Situação de ${atleta.nome}`}
              className="h-9 rounded-md border border-input bg-background px-2 text-sm"
              value={atleta.situacao ?? ''}
              onChange={(event) =>
                atualizarEscalacao(
                  lado,
                  atleta.atletaId,
                  'situacao',
                  event.target.value as SituacaoEscalacao,
                )
              }
            >
              <option value="" disabled>
                Titular ou reserva
              </option>
              <option value="TITULAR">Titular</option>
              <option value="RESERVA">Reserva</option>
            </select>
            <select
              aria-label={`Posição usada por ${atleta.nome}`}
              className="h-9 rounded-md border border-input bg-background px-2 text-sm"
              value={atleta.posicaoUsada ?? ''}
              onChange={(event) =>
                atualizarEscalacao(
                  lado,
                  atleta.atletaId,
                  'posicaoUsada',
                  event.target.value as PosicaoEscalacao,
                )
              }
            >
              <option value="" disabled>
                Posição usada
              </option>
              {posicoesEscalacao.map((posicao) => (
                <option key={posicao.valor} value={posicao.valor}>
                  {posicao.rotulo}
                </option>
              ))}
            </select>
          </div>
        </li>
      ))}
    </ul>
  );

  function adicionarGol() {
    if (!minutoGol) return setErro('Informe o minuto do gol.');
    if (!jogadorGolEfetivo) {
      return setErro(
        'O autor do gol deve pertencer à escalação do time escolhido.',
      );
    }
    const tempo = tempoSeguro(periodoGol, minutoGol, acrescimoGol);
    if (!tempo) return;
    setGols((eventos) => [
      ...eventos,
      {
        id: Date.now(),
        lado: timeGol,
        tempo,
        resumo: `${nomeTime(timeGol)} · ${nomeJogador(jogadorGolEfetivo)} · ${formatarTempoEvento(tempo)}`,
      },
    ]);
    setMinutoGol('');
    setAcrescimoGol('');
    setErro(null);
  }

  function adicionarCartao() {
    if (!minutoCartao) return setErro('Informe o minuto do cartão.');
    if (!jogadorCartaoEfetivo) {
      return setErro(
        'O atleta advertido deve pertencer à escalação do time escolhido.',
      );
    }
    const tempo = tempoSeguro(periodoCartao, minutoCartao, acrescimoCartao);
    if (!tempo) return;
    setCartoes((eventos) => [
      ...eventos,
      {
        id: Date.now(),
        lado: timeCartao,
        tempo,
        resumo: `${nomeTime(timeCartao)} · ${nomeJogador(jogadorCartaoEfetivo)} · ${tipoCartao} · ${formatarTempoEvento(tempo)}`,
      },
    ]);
    setMinutoCartao('');
    setAcrescimoCartao('');
    setErro(null);
  }

  function adicionarSubstituicao() {
    const elencoElegivel = elencoDoLado(timeSubstituicao);
    if (
      !minutoSubstituicao ||
      jogadorSaiuEfetivo === jogadorEntrouEfetivo ||
      !elencoElegivel.some((item) => String(item.id) === jogadorSaiuEfetivo) ||
      !elencoElegivel.some((item) => String(item.id) === jogadorEntrouEfetivo)
    ) {
      return setErro('Informe atletas diferentes e o minuto da substituição.');
    }
    const tempo = tempoSeguro(
      periodoSubstituicao,
      minutoSubstituicao,
      acrescimoSubstituicao,
    );
    if (!tempo) return;
    setSubstituicoes((eventos) => [
      ...eventos,
      {
        id: Date.now(),
        lado: timeSubstituicao,
        tempo,
        resumo: `${nomeTime(timeSubstituicao)} · sai ${nomeJogador(jogadorSaiuEfetivo)} · entra ${nomeJogador(jogadorEntrouEfetivo)} · ${formatarTempoEvento(tempo)}`,
      },
    ]);
    setMinutoSubstituicao('');
    setAcrescimoSubstituicao('');
    setErro(null);
  }

  function revisarEnvio(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!partida) return;
    const escalados = [...escalacaoCasa, ...escalacaoFora];
    if (escalados.some((atleta) => !atleta.situacao || !atleta.posicaoUsada)) {
      setErro(
        'Informe titular ou reserva e a posição usada por cada atleta escalado.',
      );
      return;
    }
    const golsCasa = gols.filter((gol) => gol.lado === 'casa').length;
    const golsFora = gols.filter((gol) => gol.lado === 'fora').length;
    if (golsCasa !== casa || golsFora !== fora) {
      setErro(
        `Os gols registrados por equipe (${golsCasa} × ${golsFora}) devem corresponder ao placar (${casa} × ${fora}).`,
      );
      return;
    }
    const dados = new FormData(event.currentTarget);
    setSumulaRevisada({
      partidaId: partida.id,
      fato: {
        tipo: 'SUMULA',
        placarCasa: casa,
        placarFora: fora,
        arbitragem: [
          'arbitro',
          'primeiro-assistente',
          'segundo-assistente',
          'quarto-arbitro',
        ].map((campo) => String(dados.get(campo) ?? '')),
        escalacaoCasa,
        escalacaoFora,
        gols: gols.map(({ resumo, tempo }) => ({ resumo, tempo })),
        cartoes: cartoes.map(({ resumo, tempo }) => ({ resumo, tempo })),
        substituicoes: substituicoes.map(({ resumo, tempo }) => ({
          resumo,
          tempo,
        })),
        relatorio: String(dados.get('relatorio-jogo') ?? ''),
      },
    });
    setErro(null);
    setConfirmando(true);
  }

  if (!hydrated) return <p role="status">Carregando súmula...</p>;
  if (!campeonato) return <h1>Sem acesso administrativo</h1>;
  if ((operacional.estado?.estado ?? campeonato.estado) !== 'EM_ANDAMENTO') {
    return (
      <Cartao>
        <h1 className="font-display text-2xl font-semibold">
          Súmula indisponível
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Apenas campeonatos em andamento admitem registro de uma nova súmula.
        </p>
      </Cartao>
    );
  }
  if (!partida) {
    return (
      <Cartao>
        <h1 className="font-display text-2xl font-semibold">
          Nenhuma partida elegível para súmula
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Resultados já publicados, partidas canceladas e jogos concluídos por
          WO não admitem uma nova súmula.
        </p>
      </Cartao>
    );
  }

  return (
    <>
      <CabecalhoPagina
        title="Súmula da partida"
        subtitle="Registre somente fatos ocorridos; o envio confirmado é definitivo"
      />
      <Cartao className="mb-6">
        <label htmlFor="partida-sumula" className="text-sm font-semibold">
          Partida da súmula
        </label>
        <select
          id="partida-sumula"
          className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3"
          value={partida?.id ?? 0}
          disabled={
            confirmando ||
            gols.length > 0 ||
            cartoes.length > 0 ||
            substituicoes.length > 0
          }
          onChange={(event) => {
            const proximaId = Number(event.target.value);
            const proxima = partidasElegiveis.find(
              (item) => item.id === proximaId,
            );
            setPartidaSelecionadaId(proximaId);
            if (!proxima) return;
            const casa =
              catalogoPublicoMock.obterTime(proxima.timeCasaId)?.elenco ?? [];
            const fora =
              catalogoPublicoMock.obterTime(proxima.timeForaId)?.elenco ?? [];
            setEscalacaoCasa(
              criarRascunhoEscalacao(
                casa.filter((atleta) =>
                  (proxima.escalacaoCasaAtletaIds ?? []).includes(atleta.id),
                ),
              ),
            );
            setEscalacaoFora(
              criarRascunhoEscalacao(
                fora.filter((atleta) =>
                  (proxima.escalacaoForaAtletaIds ?? []).includes(atleta.id),
                ),
              ),
            );
          }}
        >
          {partidasElegiveis.map((item) => (
            <option key={item.id} value={item.id}>
              Partida {item.id} · {obterNomeTimePublico(item.timeCasaId)} ×{' '}
              {obterNomeTimePublico(item.timeForaId)}
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs text-muted-foreground">
          Partidas a definir, canceladas, adiadas, com WO ou resultado publicado
          não entram nesta seleção.
        </p>
      </Cartao>
      <Cartao className="mb-6">
        <p className="font-display font-semibold">
          {jogo.casa} × {jogo.fora}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {campeonato.nome} · partida {jogo.id} · jogo já realizado
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {jogo.data} · {jogo.hora} · {jogo.campo}
        </p>
      </Cartao>
      <Cartao className="mb-6">
        <h2 className="font-display font-semibold">Escalações da partida</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm font-semibold">{jogo.casa}</p>
            {renderEscalacao('casa', escalacaoCasa)}
          </div>
          <div>
            <p className="text-sm font-semibold">{jogo.fora}</p>
            {renderEscalacao('fora', escalacaoFora)}
          </div>
        </div>
      </Cartao>

      <form onSubmit={revisarEnvio}>
        <fieldset disabled={enviada || confirmando} className="contents">
          <Secao title="Resultado do jogo">
            <Cartao className="flex items-center justify-center gap-6">
              <CampoFormulario
                label={`Gols de ${jogo.casa}`}
                htmlFor="placar-casa"
              >
                <Input
                  id="placar-casa"
                  type="number"
                  min={0}
                  value={casa}
                  onChange={(event) => setCasa(Number(event.target.value))}
                  className="h-16 w-24 text-center text-2xl font-bold"
                />
              </CampoFormulario>
              <span className="pt-7 font-display text-2xl text-muted-foreground">
                ×
              </span>
              <CampoFormulario
                label={`Gols de ${jogo.fora}`}
                htmlFor="placar-fora"
              >
                <Input
                  id="placar-fora"
                  type="number"
                  min={0}
                  value={fora}
                  onChange={(event) => setFora(Number(event.target.value))}
                  className="h-16 w-24 text-center text-2xl font-bold"
                />
              </CampoFormulario>
            </Cartao>
          </Secao>

          <Secao title="Equipe de arbitragem">
            <Cartao className="grid gap-4 sm:grid-cols-2">
              {[
                ['Árbitro', 'arbitro'],
                ['Primeiro assistente', 'primeiro-assistente'],
                ['Segundo assistente', 'segundo-assistente'],
                ['Quarto árbitro', 'quarto-arbitro'],
              ].map(([label, id]) => (
                <CampoFormulario key={id} label={label!} htmlFor={id!}>
                  <Input id={id} name={id} required />
                </CampoFormulario>
              ))}
            </Cartao>
          </Secao>

          <Secao title="Gols">
            <Cartao className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <CampoFormulario label="Time do gol" htmlFor="time-gol">
                  <Select
                    value={timeGol}
                    onValueChange={(value) => {
                      const lado = value as 'casa' | 'fora';
                      setTimeGol(lado);
                      setJogadorGol(String(elencoDoLado(lado)[0]?.id ?? ''));
                    }}
                  >
                    <SelectTrigger id="time-gol">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casa">{jogo.casa}</SelectItem>
                      <SelectItem value="fora">{jogo.fora}</SelectItem>
                    </SelectContent>
                  </Select>
                </CampoFormulario>
                <CampoFormulario label="Autor do gol" htmlFor="autor-gol">
                  <Select
                    value={jogadorGolEfetivo}
                    onValueChange={setJogadorGol}
                  >
                    <SelectTrigger id="autor-gol">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {elencoDoLado(timeGol).map((jogador) => (
                        <SelectItem key={jogador.id} value={String(jogador.id)}>
                          {jogador.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CampoFormulario>
                <CampoFormulario label="Período do gol" htmlFor="periodo-gol">
                  <Select
                    value={periodoGol}
                    onValueChange={(value) =>
                      setPeriodoGol(value as PeriodoEvento)
                    }
                  >
                    <SelectTrigger id="periodo-gol">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primeiro-tempo">
                        Primeiro tempo
                      </SelectItem>
                      <SelectItem value="segundo-tempo">
                        Segundo tempo
                      </SelectItem>
                      <SelectItem value="prorrogacao">Prorrogação</SelectItem>
                    </SelectContent>
                  </Select>
                </CampoFormulario>
                <CampoFormulario label="Minuto do gol" htmlFor="minuto-gol">
                  <Input
                    id="minuto-gol"
                    type="number"
                    min={0}
                    value={minutoGol}
                    onChange={(event) => setMinutoGol(event.target.value)}
                  />
                </CampoFormulario>
                <CampoFormulario
                  label="Acréscimo do gol"
                  htmlFor="acrescimo-gol"
                >
                  <Input
                    id="acrescimo-gol"
                    type="number"
                    min={1}
                    value={acrescimoGol}
                    onChange={(event) => setAcrescimoGol(event.target.value)}
                    placeholder="Opcional"
                  />
                </CampoFormulario>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="campoOutline"
                    className="w-full"
                    onClick={adicionarGol}
                  >
                    Adicionar gol
                  </Button>
                </div>
              </div>
              {gols.map((evento) => (
                <div
                  key={evento.id}
                  className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm"
                >
                  <span>{evento.resumo}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => remover(evento.id, setGols)}
                  >
                    Remover gol
                  </Button>
                </div>
              ))}
            </Cartao>
          </Secao>

          <Secao title="Cartões">
            <Cartao className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <CampoFormulario label="Time do cartão" htmlFor="time-cartao">
                  <Select
                    value={timeCartao}
                    onValueChange={(value) => {
                      const lado = value as 'casa' | 'fora';
                      setTimeCartao(lado);
                      setJogadorCartao(String(elencoDoLado(lado)[0]?.id ?? ''));
                    }}
                  >
                    <SelectTrigger id="time-cartao">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casa">{jogo.casa}</SelectItem>
                      <SelectItem value="fora">{jogo.fora}</SelectItem>
                    </SelectContent>
                  </Select>
                </CampoFormulario>
                <CampoFormulario
                  label="Jogador advertido"
                  htmlFor="jogador-cartao"
                >
                  <Select
                    value={jogadorCartaoEfetivo}
                    onValueChange={setJogadorCartao}
                  >
                    <SelectTrigger id="jogador-cartao">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {elencoDoLado(timeCartao).map((jogador) => (
                        <SelectItem key={jogador.id} value={String(jogador.id)}>
                          {jogador.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CampoFormulario>
                <CampoFormulario label="Tipo de cartão" htmlFor="tipo-cartao">
                  <Select value={tipoCartao} onValueChange={setTipoCartao}>
                    <SelectTrigger id="tipo-cartao">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="amarelo">Amarelo</SelectItem>
                      <SelectItem value="vermelho">Vermelho</SelectItem>
                    </SelectContent>
                  </Select>
                </CampoFormulario>
                <CampoFormulario
                  label="Período do cartão"
                  htmlFor="periodo-cartao"
                >
                  <Select
                    value={periodoCartao}
                    onValueChange={(value) =>
                      setPeriodoCartao(value as PeriodoEvento)
                    }
                  >
                    <SelectTrigger id="periodo-cartao">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primeiro-tempo">
                        Primeiro tempo
                      </SelectItem>
                      <SelectItem value="segundo-tempo">
                        Segundo tempo
                      </SelectItem>
                      <SelectItem value="prorrogacao">Prorrogação</SelectItem>
                    </SelectContent>
                  </Select>
                </CampoFormulario>
                <CampoFormulario
                  label="Minuto regulamentar do cartão"
                  htmlFor="minuto-cartao"
                >
                  <Input
                    id="minuto-cartao"
                    type="number"
                    min={0}
                    value={minutoCartao}
                    onChange={(event) => setMinutoCartao(event.target.value)}
                  />
                </CampoFormulario>
                <CampoFormulario
                  label="Acréscimo do cartão"
                  htmlFor="acrescimo-cartao"
                >
                  <Input
                    id="acrescimo-cartao"
                    type="number"
                    min={1}
                    value={acrescimoCartao}
                    onChange={(event) => setAcrescimoCartao(event.target.value)}
                    placeholder="Opcional"
                  />
                </CampoFormulario>
              </div>
              <Button
                type="button"
                variant="campoOutline"
                onClick={adicionarCartao}
              >
                Adicionar cartão
              </Button>
              {cartoes.map((evento) => (
                <div
                  key={evento.id}
                  className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm"
                >
                  <span>{evento.resumo}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => remover(evento.id, setCartoes)}
                  >
                    Remover cartão
                  </Button>
                </div>
              ))}
            </Cartao>
          </Secao>

          <Secao title="Substituições">
            <Cartao className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <CampoFormulario
                  label="Time da substituição"
                  htmlFor="time-substituicao"
                >
                  <Select
                    value={timeSubstituicao}
                    onValueChange={(value) => {
                      const lado = value as 'casa' | 'fora';
                      const elegiveis = elencoDoLado(lado);
                      setTimeSubstituicao(lado);
                      setJogadorSaiu(String(elegiveis[0]?.id ?? ''));
                      setJogadorEntrou(String(elegiveis[1]?.id ?? ''));
                    }}
                  >
                    <SelectTrigger id="time-substituicao">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casa">{jogo.casa}</SelectItem>
                      <SelectItem value="fora">{jogo.fora}</SelectItem>
                    </SelectContent>
                  </Select>
                </CampoFormulario>
                <CampoFormulario
                  label="Jogador que saiu"
                  htmlFor="jogador-saiu"
                >
                  <Select
                    value={jogadorSaiuEfetivo}
                    onValueChange={setJogadorSaiu}
                  >
                    <SelectTrigger id="jogador-saiu">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {elencoDoLado(timeSubstituicao).map((jogador) => (
                        <SelectItem key={jogador.id} value={String(jogador.id)}>
                          {jogador.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CampoFormulario>
                <CampoFormulario
                  label="Jogador que entrou"
                  htmlFor="jogador-entrou"
                >
                  <Select
                    value={jogadorEntrouEfetivo}
                    onValueChange={setJogadorEntrou}
                  >
                    <SelectTrigger id="jogador-entrou">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {elencoDoLado(timeSubstituicao).map((jogador) => (
                        <SelectItem key={jogador.id} value={String(jogador.id)}>
                          {jogador.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CampoFormulario>
                <CampoFormulario
                  label="Período da substituição"
                  htmlFor="periodo-substituicao"
                >
                  <Select
                    value={periodoSubstituicao}
                    onValueChange={(value) =>
                      setPeriodoSubstituicao(value as PeriodoEvento)
                    }
                  >
                    <SelectTrigger id="periodo-substituicao">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primeiro-tempo">
                        Primeiro tempo
                      </SelectItem>
                      <SelectItem value="segundo-tempo">
                        Segundo tempo
                      </SelectItem>
                      <SelectItem value="prorrogacao">Prorrogação</SelectItem>
                    </SelectContent>
                  </Select>
                </CampoFormulario>
                <CampoFormulario
                  label="Minuto regulamentar da substituição"
                  htmlFor="minuto-substituicao"
                >
                  <Input
                    id="minuto-substituicao"
                    type="number"
                    min={0}
                    value={minutoSubstituicao}
                    onChange={(event) =>
                      setMinutoSubstituicao(event.target.value)
                    }
                  />
                </CampoFormulario>
                <CampoFormulario
                  label="Acréscimo da substituição"
                  htmlFor="acrescimo-substituicao"
                >
                  <Input
                    id="acrescimo-substituicao"
                    type="number"
                    min={1}
                    value={acrescimoSubstituicao}
                    onChange={(event) =>
                      setAcrescimoSubstituicao(event.target.value)
                    }
                    placeholder="Opcional"
                  />
                </CampoFormulario>
              </div>
              <Button
                type="button"
                variant="campoOutline"
                onClick={adicionarSubstituicao}
              >
                Adicionar substituição
              </Button>
              {substituicoes.map((evento) => (
                <div
                  key={evento.id}
                  className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm"
                >
                  <span>{evento.resumo}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => remover(evento.id, setSubstituicoes)}
                  >
                    Remover substituição
                  </Button>
                </div>
              ))}
            </Cartao>
          </Secao>

          <Secao title="Relatório oficial">
            <Cartao>
              <CampoFormulario
                label="Relatório do jogo"
                htmlFor="relatorio-jogo"
              >
                <Textarea
                  id="relatorio-jogo"
                  name="relatorio-jogo"
                  rows={6}
                  placeholder="Opcional no caso normal; obrigatório para ocorrência excepcional, WO ou divergência"
                />
              </CampoFormulario>
            </Cartao>
          </Secao>

          <Cartao className="space-y-4 border-amber-300 bg-amber-50">
            <p className="font-semibold text-amber-950">O envio é definitivo</p>
            <p className="text-sm text-amber-900">
              Após a confirmação, o resultado será computado e não poderá ser
              corrigido ou reenviado. A súmula oficial será gerada em PDF.
            </p>
            {erro ? (
              <p role="alert" className="text-sm font-semibold text-red-700">
                {erro}
              </p>
            ) : null}
            <label className="flex items-start gap-3 text-sm font-medium text-amber-950">
              <input
                type="checkbox"
                aria-label="Confirmar envio definitivo"
                checked={confirmacao}
                onChange={(event) => setConfirmacao(event.target.checked)}
                className="mt-1"
                required
              />
              Revisei os dados e confirmo o envio definitivo.
            </label>
            <Button
              ref={abrirConfirmacaoRef}
              type="submit"
              variant="campo"
              className="w-full"
              disabled={enviada}
            >
              Confirmar resultado e súmula
            </Button>
          </Cartao>
        </fieldset>
      </form>

      <Dialog
        open={confirmando && !enviada}
        onOpenChange={(open) => setConfirmando(open)}
      >
        <DialogContent
          role="alertdialog"
          aria-label="Confirmar envio da súmula"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            abrirConfirmacaoRef.current?.focus();
          }}
          className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-y-auto rounded-md border-amber-300 bg-card sm:max-w-lg"
        >
          <DialogTitle className="font-display text-2xl text-amber-950">
            Confirma o envio definitivo?
          </DialogTitle>
          <DialogDescription className="text-amber-900">
            A operação publicará os fatos em conjunto e não permitirá correção
            ou reenvio.
          </DialogDescription>
          <DialogFooter className="gap-2 sm:space-x-0">
            <Button
              variant="campoOutline"
              onClick={() => setConfirmando(false)}
            >
              Cancelar envio
            </Button>
            <Button
              variant="campo"
              disabled={!sumulaRevisada}
              onClick={() => {
                if (!sumulaRevisada) return;
                operacional.registrarPartidaDefinitiva(
                  sumulaRevisada.partidaId,
                  sumulaRevisada.fato,
                );
                setEnviada(true);
                setConfirmando(false);
              }}
            >
              Enviar súmula definitiva
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {enviada ? (
        <p
          role="status"
          className="mt-4 rounded-md bg-green-pale p-4 text-sm font-semibold text-green-dark"
        >
          Súmula confirmada. PDF oficial com geração pendente e idempotente pela
          API.
        </p>
      ) : null}
    </>
  );
}

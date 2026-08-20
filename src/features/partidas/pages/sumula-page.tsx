'use client';

import { useState } from 'react';

import { useSession } from '@/features/auth/session/session-context';
import { organizerCatalogMock } from '@/features/organizador/services/organizer-catalog.mock';
import {
  type FatoDefinitivoPartida,
  useOrganizerOperationalState,
} from '@/features/organizador/state/organizer-operational-store';
import {
  getMatchVenueName,
  getPublicTeamName,
  publicCatalogMock,
} from '@/features/publico/services/public-catalog.mock';
import {
  Card,
  Field,
  PageHeader,
  Section,
} from '@/shared/components/campo-livre-ui';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';

type Evento = { id: number; resumo: string; lado: 'casa' | 'fora' };

export function Sumula({ campeonatoId }: { campeonatoId: string }) {
  const { session, hydrated } = useSession();
  const [agora] = useState(() => Date.now());
  const operacional = useOrganizerOperationalState(Number(campeonatoId));
  const campeonato = organizerCatalogMock.obterCampeonato(
    campeonatoId,
    session?.account.id ?? '',
    session?.links.organizedChampionshipIds ?? [],
  );
  const partidasElegiveis = publicCatalogMock
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
    ? (publicCatalogMock.obterTime(partida.timeCasaId)?.elenco ?? []).filter(
        (atleta) => (partida.escalacaoCasaAtletaIds ?? []).includes(atleta.id),
      )
    : [];
  const elencoFora = partida
    ? (publicCatalogMock.obterTime(partida.timeForaId)?.elenco ?? []).filter(
        (atleta) => (partida.escalacaoForaAtletaIds ?? []).includes(atleta.id),
      )
    : [];
  const elenco = [...elencoCasa, ...elencoFora];
  const jogo = {
    id: partida?.id ?? 0,
    casa: partida ? getPublicTeamName(partida.timeCasaId) : 'Time da casa',
    fora: partida ? getPublicTeamName(partida.timeForaId) : 'Time visitante',
    data: partida?.data ?? 'Data a definir',
    hora: partida?.hora ?? 'Horário a definir',
    campo: getMatchVenueName(partida?.campoId),
  };
  const [casa, setCasa] = useState(0);
  const [fora, setFora] = useState(0);
  const [jogadorGol, setJogadorGol] = useState(String(elencoCasa[0]?.id ?? ''));
  const [timeGol, setTimeGol] = useState<'casa' | 'fora'>('casa');
  const [periodoGol, setPeriodoGol] = useState('segundo-tempo');
  const [minutoGol, setMinutoGol] = useState('');
  const [acrescimoGol, setAcrescimoGol] = useState('');
  const [gols, setGols] = useState<Evento[]>([]);
  const [jogadorCartao, setJogadorCartao] = useState(
    String(elencoCasa[0]?.id ?? ''),
  );
  const [timeCartao, setTimeCartao] = useState<'casa' | 'fora'>('casa');
  const [tipoCartao, setTipoCartao] = useState('amarelo');
  const [minutoCartao, setMinutoCartao] = useState('');
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
  const [minutoSubstituicao, setMinutoSubstituicao] = useState('');
  const [substituicoes, setSubstituicoes] = useState<Evento[]>([]);
  const [confirmacao, setConfirmacao] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [enviada, setEnviada] = useState(false);
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

  function adicionarGol() {
    if (!minutoGol) return setErro('Informe o minuto do gol.');
    if (!jogadorGolEfetivo) {
      return setErro(
        'O autor do gol deve pertencer à escalação do time escolhido.',
      );
    }
    const acrescimo = acrescimoGol ? `+${acrescimoGol}` : '';
    setGols((eventos) => [
      ...eventos,
      {
        id: Date.now(),
        lado: timeGol,
        resumo: `${nomeTime(timeGol)} · ${nomeJogador(jogadorGolEfetivo)} · ${periodoGol} · ${minutoGol}${acrescimo}'`,
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
    setCartoes((eventos) => [
      ...eventos,
      {
        id: Date.now(),
        lado: timeCartao,
        resumo: `${nomeTime(timeCartao)} · ${nomeJogador(jogadorCartaoEfetivo)} · ${tipoCartao} · ${minutoCartao}'`,
      },
    ]);
    setMinutoCartao('');
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
    setSubstituicoes((eventos) => [
      ...eventos,
      {
        id: Date.now(),
        lado: timeSubstituicao,
        resumo: `${nomeTime(timeSubstituicao)} · sai ${nomeJogador(jogadorSaiuEfetivo)} · entra ${nomeJogador(jogadorEntrouEfetivo)} · ${minutoSubstituicao}'`,
      },
    ]);
    setMinutoSubstituicao('');
    setErro(null);
  }

  function revisarEnvio(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!partida) return;
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
        gols: gols.map((item) => item.resumo),
        cartoes: cartoes.map((item) => item.resumo),
        substituicoes: substituicoes.map((item) => item.resumo),
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
      <Card>
        <h1 className="font-display text-2xl font-semibold">
          Súmula indisponível
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Apenas campeonatos em andamento admitem registro de uma nova súmula.
        </p>
      </Card>
    );
  }
  if (!partida) {
    return (
      <Card>
        <h1 className="font-display text-2xl font-semibold">
          Nenhuma partida elegível para súmula
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Resultados já publicados, partidas canceladas e jogos concluídos por
          WO não admitem uma nova súmula.
        </p>
      </Card>
    );
  }

  return (
    <>
      <PageHeader
        title="Súmula da partida"
        subtitle="Registre somente fatos ocorridos; o envio confirmado é definitivo"
      />
      <Card className="mb-6">
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
          onChange={(event) =>
            setPartidaSelecionadaId(Number(event.target.value))
          }
        >
          {partidasElegiveis.map((item) => (
            <option key={item.id} value={item.id}>
              Partida {item.id} · {getPublicTeamName(item.timeCasaId)} ×{' '}
              {getPublicTeamName(item.timeForaId)}
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs text-muted-foreground">
          Partidas a definir, canceladas, adiadas, com WO ou resultado publicado
          não entram nesta seleção.
        </p>
      </Card>
      <Card className="mb-6">
        <p className="font-display font-semibold">
          {jogo.casa} × {jogo.fora}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {campeonato.nome} · partida {jogo.id} · jogo já realizado
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {jogo.data} · {jogo.hora} · {jogo.campo}
        </p>
      </Card>
      <Card className="mb-6">
        <h2 className="font-display font-semibold">Escalações da partida</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm font-semibold">{jogo.casa}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {elencoCasa.map((jogador) => jogador.nome).join(', ')}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold">{jogo.fora}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {elencoFora.map((jogador) => jogador.nome).join(', ')}
            </p>
          </div>
        </div>
      </Card>

      <form onSubmit={revisarEnvio}>
        <fieldset disabled={enviada || confirmando} className="contents">
          <Section title="Resultado do jogo">
            <Card className="flex items-center justify-center gap-6">
              <Field label={`Gols de ${jogo.casa}`} htmlFor="placar-casa">
                <Input
                  id="placar-casa"
                  type="number"
                  min={0}
                  value={casa}
                  onChange={(event) => setCasa(Number(event.target.value))}
                  className="h-16 w-24 text-center text-2xl font-bold"
                />
              </Field>
              <span className="pt-7 font-display text-2xl text-muted-foreground">
                ×
              </span>
              <Field label={`Gols de ${jogo.fora}`} htmlFor="placar-fora">
                <Input
                  id="placar-fora"
                  type="number"
                  min={0}
                  value={fora}
                  onChange={(event) => setFora(Number(event.target.value))}
                  className="h-16 w-24 text-center text-2xl font-bold"
                />
              </Field>
            </Card>
          </Section>

          <Section title="Equipe de arbitragem">
            <Card className="grid gap-4 sm:grid-cols-2">
              {[
                ['Árbitro', 'arbitro'],
                ['Primeiro assistente', 'primeiro-assistente'],
                ['Segundo assistente', 'segundo-assistente'],
                ['Quarto árbitro', 'quarto-arbitro'],
              ].map(([label, id]) => (
                <Field key={id} label={label!} htmlFor={id!}>
                  <Input id={id} name={id} required />
                </Field>
              ))}
            </Card>
          </Section>

          <Section title="Gols">
            <Card className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Time do gol" htmlFor="time-gol">
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
                </Field>
                <Field label="Autor do gol" htmlFor="autor-gol">
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
                </Field>
                <Field label="Período do gol" htmlFor="periodo-gol">
                  <Select value={periodoGol} onValueChange={setPeriodoGol}>
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
                </Field>
                <Field label="Minuto do gol" htmlFor="minuto-gol">
                  <Input
                    id="minuto-gol"
                    type="number"
                    min={0}
                    max={45}
                    value={minutoGol}
                    onChange={(event) => setMinutoGol(event.target.value)}
                  />
                </Field>
                <Field label="Acréscimo do gol" htmlFor="acrescimo-gol">
                  <Input
                    id="acrescimo-gol"
                    type="number"
                    min={0}
                    max={30}
                    value={acrescimoGol}
                    onChange={(event) => setAcrescimoGol(event.target.value)}
                    placeholder="Opcional"
                  />
                </Field>
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
            </Card>
          </Section>

          <Section title="Cartões">
            <Card className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-4">
                <Field label="Time do cartão" htmlFor="time-cartao">
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
                </Field>
                <Field label="Jogador advertido" htmlFor="jogador-cartao">
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
                </Field>
                <Field label="Tipo de cartão" htmlFor="tipo-cartao">
                  <Select value={tipoCartao} onValueChange={setTipoCartao}>
                    <SelectTrigger id="tipo-cartao">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="amarelo">Amarelo</SelectItem>
                      <SelectItem value="vermelho">Vermelho</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Minuto do cartão" htmlFor="minuto-cartao">
                  <Input
                    id="minuto-cartao"
                    type="number"
                    min={0}
                    max={150}
                    value={minutoCartao}
                    onChange={(event) => setMinutoCartao(event.target.value)}
                  />
                </Field>
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
            </Card>
          </Section>

          <Section title="Substituições">
            <Card className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-4">
                <Field label="Time da substituição" htmlFor="time-substituicao">
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
                </Field>
                <Field label="Jogador que saiu" htmlFor="jogador-saiu">
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
                </Field>
                <Field label="Jogador que entrou" htmlFor="jogador-entrou">
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
                </Field>
                <Field
                  label="Minuto da substituição"
                  htmlFor="minuto-substituicao"
                >
                  <Input
                    id="minuto-substituicao"
                    type="number"
                    min={0}
                    max={150}
                    value={minutoSubstituicao}
                    onChange={(event) =>
                      setMinutoSubstituicao(event.target.value)
                    }
                  />
                </Field>
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
            </Card>
          </Section>

          <Section title="Relatório oficial">
            <Card>
              <Field label="Relatório do jogo" htmlFor="relatorio-jogo">
                <Textarea
                  id="relatorio-jogo"
                  name="relatorio-jogo"
                  rows={6}
                  placeholder="Opcional no caso normal; obrigatório para ocorrência excepcional, WO ou divergência"
                />
              </Field>
            </Card>
          </Section>

          <Card className="space-y-4 border-amber-300 bg-amber-50">
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
              type="submit"
              variant="campo"
              className="w-full"
              disabled={enviada}
            >
              Confirmar resultado e súmula
            </Button>
          </Card>
        </fieldset>
      </form>

      {confirmando && !enviada ? (
        <div
          className="mt-4 space-y-3 rounded-xl border border-amber-300 bg-white p-4"
          role="alertdialog"
          aria-label="Confirmar envio da súmula"
        >
          <p className="font-semibold text-amber-950">
            Confirma o envio definitivo?
          </p>
          <p className="text-sm text-amber-900">
            A operação publicará os fatos em conjunto e não permitirá correção
            ou reenvio.
          </p>
          <div className="flex flex-wrap gap-2">
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
          </div>
        </div>
      ) : null}
      {enviada ? (
        <p
          role="status"
          className="mt-4 rounded-xl bg-green-pale p-4 text-sm font-semibold text-green-dark"
        >
          Súmula confirmada. PDF oficial com geração pendente e idempotente pela
          API.
        </p>
      ) : null}
    </>
  );
}

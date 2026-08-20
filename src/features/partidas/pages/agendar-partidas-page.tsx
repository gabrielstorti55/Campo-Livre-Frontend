'use client';

import { useState } from 'react';
import { ptBR } from 'date-fns/locale';

import { useSession } from '@/features/auth/session/session-context';
import { organizerCatalogMock } from '@/features/organizador/services/organizer-catalog.mock';
import { useOrganizerOperationalState } from '@/features/organizador/state/organizer-operational-store';
import {
  getMatchVenueName,
  getPublicTeamName,
  publicCatalogMock,
} from '@/features/publico/services/public-catalog.mock';
import { Field, PageHeader, Section } from '@/shared/components/campo-livre-ui';
import { Button } from '@/shared/components/ui/button';
import { Calendar } from '@/shared/components/ui/calendar';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/shared/components/ui/toggle-group';
import { cn } from '@/shared/lib/utils';

const agosto2026 = new Date(2026, 7, 1);
const horarios = ['09:00', '11:00', '14:00', '15:00', '17:00', '19:00'];
type OperacaoPartida = 'AGENDAR' | 'REAGENDAR' | 'ADIAR' | 'CANCELAR';

export function AgendarPartidas({ campeonatoId }: { campeonatoId: string }) {
  const { session, hydrated } = useSession();
  const operacional = useOrganizerOperationalState(Number(campeonatoId));
  const campeonato = organizerCatalogMock.obterCampeonato(
    campeonatoId,
    session?.account.id ?? '',
    session?.links.organizedChampionshipIds ?? [],
  );
  const partidas = publicCatalogMock
    .listarPartidas()
    .filter((partida) => partida.campeonatoId === Number(campeonatoId));
  const [partidaWO, setPartidaWO] = useState<number | null>(null);
  const [vencedorWO, setVencedorWO] = useState('');
  const [justificativaWO, setJustificativaWO] = useState(
    'Ausência da equipe adversária',
  );
  const [data, setData] = useState(new Date(2026, 7, 14));
  const [hora, setHora] = useState('15:00');
  const [campo, setCampo] = useState('1');
  const [selecionada, setSelecionada] = useState<string | null>(null);
  const [operacao, setOperacao] = useState<{
    partidaId: number;
    tipo: OperacaoPartida;
  } | null>(null);
  const [motivo, setMotivo] = useState('');
  const [feedback, setFeedback] = useState('');
  const estadoDaPartida = (partidaId: number) =>
    operacional.estado?.partidaEstados[partidaId] ??
    partidas.find((partida) => partida.id === partidaId)?.estado ??
    'A_DEFINIR';

  if (!hydrated) return <p role="status">Carregando partidas...</p>;
  if (!campeonato) return <h1>Sem acesso administrativo</h1>;
  if ((operacional.estado?.estado ?? campeonato.estado) !== 'EM_ANDAMENTO') {
    return (
      <>
        <PageHeader
          title={`Partidas · ${campeonato.nome}`}
          subtitle="Histórico operacional somente leitura"
        />
        <Card className="p-5">
          <h2 className="font-display text-xl font-semibold">
            Operações indisponíveis
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Agendamento, reagendamento, adiamento, cancelamento e WO exigem um
            campeonato em andamento.
          </p>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={`Partidas · ${campeonato.nome}`}
        subtitle="Agendamento e exceções sem alterar fatos já publicados"
      />

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <p className="mb-3 font-display font-semibold">Selecione a data</p>
          <Calendar
            mode="single"
            locale={ptBR}
            month={agosto2026}
            hideNavigation
            showOutsideDays={false}
            selected={data}
            onSelect={(nextDate) => nextDate && setData(nextDate)}
            className="p-0"
          />
        </Card>
        <Card className="p-5">
          <p className="mb-3 font-display font-semibold">Selecione o horário</p>
          <ToggleGroup
            type="single"
            value={hora}
            onValueChange={(nextHora) => nextHora && setHora(nextHora)}
            aria-label="Selecione o horário"
            variant="outline"
            className="grid grid-cols-3 gap-2"
          >
            {horarios.map((horario) => (
              <ToggleGroupItem key={horario} value={horario}>
                {horario}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <div className="mt-4">
            <Field label="Campo" htmlFor="campo-agendamento">
              <Select value={campo} onValueChange={setCampo}>
                <SelectTrigger id="campo-agendamento">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Campo Vera Cruz</SelectItem>
                  <SelectItem value="2">Campo Santa Rita</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
        </Card>
      </div>

      <Section title="Partidas pendentes de agendamento">
        <RadioGroup
          value={selecionada}
          onValueChange={setSelecionada}
          aria-label="Partidas pendentes de agendamento"
          className="gap-3"
        >
          {partidas
            .filter((partida) => estadoDaPartida(partida.id) === 'A_DEFINIR')
            .map((partida) => (
              <RadioGroupItem
                key={partida.id}
                value={String(partida.id)}
                aria-label={`${getPublicTeamName(partida.timeCasaId)} vs ${getPublicTeamName(partida.timeForaId)}, ${partida.rodada}`}
                className="h-auto w-full rounded-lg border-0 text-left"
              >
                <Card
                  className={cn(
                    'flex w-full items-center justify-between gap-3 p-4',
                    selecionada === String(partida.id) &&
                      'border-green-mid bg-green-pale',
                  )}
                >
                  <span className="font-display text-sm font-semibold">
                    {getPublicTeamName(partida.timeCasaId)} vs{' '}
                    {getPublicTeamName(partida.timeForaId)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {partida.rodada}
                  </span>
                </Card>
              </RadioGroupItem>
            ))}
        </RadioGroup>
        <Button
          variant="campo"
          className="mt-4 w-full"
          aria-label={`Salvar agendamento para ${String(data.getDate()).padStart(2, '0')}/08/2026 às ${hora}`}
          disabled={!selecionada}
          onClick={() => {
            operacional.atualizarEstadoPartida(Number(selecionada), 'AGENDADA');
            setFeedback(
              `Agendamento preparado localmente para ${String(data.getDate()).padStart(2, '0')}/08/2026 às ${hora}.`,
            );
          }}
        >
          Salvar Data e Horário
        </Button>
      </Section>

      <div className="space-y-4">
        {partidas.map((partida) => {
          const casa = getPublicTeamName(partida.timeCasaId);
          const fora = getPublicTeamName(partida.timeForaId);
          const podeOperar =
            !partida.resultadoPublicado &&
            !operacional.estado?.fatosDefinitivos[partida.id] &&
            estadoDaPartida(partida.id) !== 'AGUARDANDO_PUBLICACAO' &&
            estadoDaPartida(partida.id) !== 'CANCELADA';
          return (
            <Card key={partida.id} className="p-5">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                <div>
                  <h2 className="font-display text-lg font-semibold">
                    {casa} × {fora}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Partida {partida.id} · {partida.rodada} ·{' '}
                    {estadoDaPartida(partida.id)}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {partida.data ?? 'Data a definir'} ·{' '}
                    {partida.hora ?? 'Horário a definir'} ·{' '}
                    {getMatchVenueName(partida.campoId)}
                  </p>
                  {partida.resultadoPublicado ? (
                    <p className="mt-2 text-sm font-semibold text-green-dark">
                      Resultado publicado: {partida.golsCasa} ×{' '}
                      {partida.golsFora}
                    </p>
                  ) : null}
                </div>
                {podeOperar ? (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="campoOutline"
                      aria-label={`${estadoDaPartida(partida.id) === 'A_DEFINIR' ? 'Agendar' : 'Reagendar'} partida ${partida.id}`}
                      onClick={() => {
                        setMotivo('');
                        setOperacao({
                          partidaId: partida.id,
                          tipo:
                            estadoDaPartida(partida.id) === 'A_DEFINIR'
                              ? 'AGENDAR'
                              : 'REAGENDAR',
                        });
                      }}
                    >
                      {estadoDaPartida(partida.id) === 'A_DEFINIR'
                        ? 'Agendar'
                        : 'Reagendar'}
                    </Button>
                    {estadoDaPartida(partida.id) === 'AGENDADA' ? (
                      <Button
                        size="sm"
                        variant="campoOutline"
                        onClick={() => {
                          setMotivo('');
                          setOperacao({ partidaId: partida.id, tipo: 'ADIAR' });
                        }}
                      >
                        Adiar
                      </Button>
                    ) : null}
                    {estadoDaPartida(partida.id) !== 'A_DEFINIR' ? (
                      <Button
                        size="sm"
                        variant="campoOutline"
                        aria-label={`Cancelar partida ${partida.id}`}
                        onClick={() => {
                          setMotivo('');
                          setOperacao({
                            partidaId: partida.id,
                            tipo: 'CANCELAR',
                          });
                        }}
                      >
                        Cancelar
                      </Button>
                    ) : null}
                    {estadoDaPartida(partida.id) === 'AGENDADA' ? (
                      <Button
                        size="sm"
                        variant="campo"
                        aria-label={`Registrar WO na partida ${partida.id}`}
                        onClick={() => {
                          setPartidaWO(partida.id);
                          setVencedorWO(String(partida.timeCasaId));
                        }}
                      >
                        Registrar WO
                      </Button>
                    ) : null}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {partida.resultadoPublicado
                      ? 'Fato publicado e bloqueado para edição'
                      : 'Aguardando publicação ou partida cancelada'}
                  </p>
                )}
              </div>
            </Card>
          );
        })}
      </div>

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
                defaultValue="2026-08-28"
              />
              <Input
                aria-label="Novo horário"
                type="time"
                defaultValue="15:00"
              />
              <select
                aria-label="Novo campo"
                className="h-10 rounded-md border border-input bg-background px-3"
                defaultValue="1"
              >
                <option value="1">Campo Vera Cruz</option>
                <option value="2">Campo Santa Rita</option>
              </select>
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
          <div className="mt-4 flex gap-2">
            <Button
              variant="campo"
              disabled={operacao.tipo !== 'AGENDAR' && !motivo.trim()}
              onClick={() => {
                operacional.atualizarEstadoPartida(
                  operacao.partidaId,
                  operacao.tipo === 'ADIAR'
                    ? 'ADIADA'
                    : operacao.tipo === 'CANCELAR'
                      ? 'CANCELADA'
                      : 'AGENDADA',
                );
                setFeedback(
                  `${operacao.tipo} da partida ${operacao.partidaId} preparado localmente com histórico preservado.`,
                );
                setOperacao(null);
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

      {partidaWO ? (
        <Card className="mt-6 p-5">
          <h2 className="font-display text-lg font-semibold">
            Registrar WO na partida {partidaWO}
          </h2>
          <label
            className="mt-4 block text-sm font-semibold"
            htmlFor="vencedor-wo"
          >
            Time vencedor por WO
          </label>
          <select
            id="vencedor-wo"
            className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3"
            value={vencedorWO}
            onChange={(event) => setVencedorWO(event.target.value)}
          >
            {(() => {
              const partida = partidas.find((item) => item.id === partidaWO)!;
              return [partida.timeCasaId, partida.timeForaId].map((timeId) => (
                <option key={timeId} value={timeId}>
                  {getPublicTeamName(timeId)}
                </option>
              ));
            })()}
          </select>
          <label
            className="mt-4 block text-sm font-semibold"
            htmlFor="motivo-wo"
          >
            Justificativa do WO
          </label>
          <Input
            id="motivo-wo"
            value={justificativaWO}
            onChange={(event) => setJustificativaWO(event.target.value)}
          />
          <Button
            className="mt-4"
            variant="campo"
            disabled={!vencedorWO || !justificativaWO.trim()}
            onClick={() => {
              operacional.registrarPartidaDefinitiva(partidaWO, {
                tipo: 'WO',
                vencedorTimeId: Number(vencedorWO),
                justificativa: justificativaWO.trim(),
              });
              setPartidaWO(null);
              setFeedback(
                'WO registrado localmente; aguarda persistência e publicação pela API.',
              );
            }}
          >
            Confirmar WO
          </Button>
        </Card>
      ) : null}

      {feedback ? (
        <p
          role="status"
          className="mt-5 rounded-xl bg-green-pale p-3 text-sm font-semibold text-green-dark"
        >
          {feedback}
        </p>
      ) : null}
    </>
  );
}

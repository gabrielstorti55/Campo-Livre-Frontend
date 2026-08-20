'use client';

import { useState } from 'react';

import { useSession } from '@/features/auth/session/session-context';
import { organizerCatalogMock } from '@/features/organizador/services/organizer-catalog.mock';
import { Card, Field, PageHeader } from '@/shared/components/campo-livre-ui';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Progress } from '@/shared/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';

const passos = ['Dados', 'Convidar times', 'Revisar rascunho'];
const timesDisponiveis = ['Time A', 'Leões FC', 'Estrela Azul'];

export function NovoCampeonato() {
  const { session } = useSession();
  const comercial = organizerCatalogMock.obterSituacaoComercial(
    session?.account.id ?? '',
  );
  const [passo, setPasso] = useState(0);
  const [contexto, setContexto] = useState('pessoal');
  const [timeConvidado, setTimeConvidado] = useState(timesDisponiveis[0] ?? '');
  const [convites, setConvites] = useState<string[]>([]);
  const [salvo, setSalvo] = useState(false);

  function convidarTime() {
    if (!timeConvidado || convites.includes(timeConvidado)) return;
    setConvites((atuais) => [...atuais, timeConvidado]);
  }

  return (
    <>
      <PageHeader
        title="Novo Campeonato"
        subtitle={`Passo ${passo + 1} de ${passos.length} — ${passos[passo]}`}
        actions={
          <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900">
            Rascunho
          </span>
        }
      />
      <Progress
        value={((passo + 1) / passos.length) * 100}
        aria-label={`Passo ${passo + 1} de ${passos.length}`}
      />
      <section
        aria-label="Elegibilidade comercial"
        className="mt-5 max-w-2xl rounded-2xl border border-border bg-card p-4 text-sm"
      >
        <h2 className="font-display text-base font-semibold">
          Elegibilidade comercial
        </h2>
        {contexto === 'prefeitura' ? (
          <p className="mt-2 text-muted-foreground">
            Contexto Prefeitura isento. A criação exige vínculo institucional
            ativo e não consome o benefício pessoal.
          </p>
        ) : (
          <p className="mt-2 text-muted-foreground">
            Primeiro campeonato gratuito utilizado. Há{' '}
            {comercial.direitosAdicionaisDisponiveis}{' '}
            {comercial.direitosAdicionaisDisponiveis === 1
              ? 'direito adicional disponível'
              : 'direitos adicionais disponíveis'}{' '}
            para reservar ao salvar este rascunho.
          </p>
        )}
      </section>
      <p className="mt-3 text-sm text-muted-foreground">
        Responsável:{' '}
        <strong className="text-foreground">
          {session?.account.name ?? 'Conta pessoal'}
        </strong>
      </p>

      {passo === 0 ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setPasso(1);
          }}
        >
          <Card className="max-w-2xl space-y-4">
            <p className="text-sm text-muted-foreground">
              O campeonato permanece em configuração até que regulamento, fases,
              critérios e participantes sejam validados.
            </p>
            <Field
              label="Nome do campeonato"
              htmlFor="nome-do-campeonato-field"
            >
              <Input
                id="nome-do-campeonato-field"
                placeholder="Ex.: Copa Franca 2026"
                required
              />
            </Field>
            <Field
              label="Contexto responsável"
              htmlFor="contexto-responsavel-field"
            >
              <Select value={contexto} onValueChange={setContexto}>
                <SelectTrigger id="contexto-responsavel-field">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pessoal">
                    Pessoal — {session?.account.name ?? 'Conta pessoal'}
                  </SelectItem>
                  {session?.links.institutionalOrganizationIds.includes(
                    'prefeitura-franca',
                  ) ? (
                    <SelectItem value="prefeitura">
                      Prefeitura de Franca
                    </SelectItem>
                  ) : null}
                </SelectContent>
              </Select>
            </Field>
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_8rem]">
              <Field label="Município" htmlFor="municipio-field">
                <Input id="municipio-field" placeholder="Franca" required />
              </Field>
              <Field label="UF" htmlFor="uf-field">
                <Select defaultValue="SP">
                  <SelectTrigger id="uf-field">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SP">SP</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="Visibilidade" htmlFor="visibilidade-field">
              <Select defaultValue="publico">
                <SelectTrigger id="visibilidade-field">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="publico">Público</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Modalidade" htmlFor="modalidade-field">
              <Select defaultValue="Society">
                <SelectTrigger id="modalidade-field">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Society">Society</SelectItem>
                  <SelectItem value="Futebol de Campo">
                    Futebol de Campo
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Formato pretendido" htmlFor="formato-field">
              <Select defaultValue="Pontos corridos">
                <SelectTrigger id="formato-field">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pontos corridos">
                    Pontos corridos
                  </SelectItem>
                  <SelectItem value="Mata-mata">Mata-mata</SelectItem>
                  <SelectItem value="Grupos e mata-mata">
                    Grupos e mata-mata
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Data inicial prevista" htmlFor="data-inicio-field">
                <Input id="data-inicio-field" type="date" required />
              </Field>
              <Field label="Data final prevista" htmlFor="data-fim-field">
                <Input id="data-fim-field" type="date" />
              </Field>
            </div>
            <Field label="Regulamento inicial" htmlFor="regulamento-field">
              <Textarea
                id="regulamento-field"
                rows={4}
                placeholder="Regras esportivas e operacionais"
              />
            </Field>
            <Button type="submit" variant="campo" className="w-full">
              Continuar
            </Button>
          </Card>
        </form>
      ) : null}

      {passo === 1 ? (
        <Card className="max-w-2xl space-y-5">
          <div>
            <h2 className="font-display text-xl font-semibold">
              Convidar times
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              A participação ocorre somente após o capitão aceitar o convite. O
              elenco permanente será inscrito separadamente no campeonato.
            </p>
          </div>
          <Field label="Time convidado" htmlFor="time-convidado-field">
            <Select value={timeConvidado} onValueChange={setTimeConvidado}>
              <SelectTrigger id="time-convidado-field">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timesDisponiveis.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Button
            variant="campoOutline"
            className="w-full"
            onClick={convidarTime}
          >
            Enviar convite ao time
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => setSalvo(true)}
          >
            Salvar rascunho
          </Button>
          {salvo ? (
            <p role="status" className="text-sm font-semibold text-green-dark">
              Rascunho salvo localmente.
            </p>
          ) : null}
          <div className="space-y-2" aria-label="Convites enviados">
            {convites.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum convite enviado.
              </p>
            ) : (
              convites.map((time) => (
                <div
                  key={time}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border px-4 py-3 text-sm"
                >
                  <span>{time} · aguardando resposta do capitão</span>
                  <Button
                    type="button"
                    variant="ghost"
                    tone="danger"
                    onClick={() =>
                      setConvites((atuais) =>
                        atuais.filter((item) => item !== time),
                      )
                    }
                  >
                    Cancelar convite de {time}
                  </Button>
                </div>
              ))
            )}
          </div>
          <div className="flex gap-3">
            <Button
              variant="campoOutline"
              className="flex-1"
              onClick={() => setPasso(0)}
            >
              Voltar
            </Button>
            <Button
              variant="campo"
              className="flex-1"
              onClick={() => setPasso(2)}
            >
              Revisar
            </Button>
          </div>
        </Card>
      ) : null}

      {passo === 2 ? (
        <Card className="max-w-2xl space-y-5">
          <h2 className="font-display text-xl font-semibold">
            Revisar rascunho
          </h2>
          <p className="text-sm text-muted-foreground">
            Salvar não abre inscrições nem inicia o campeonato. Essas transições
            exigem configuração válida e ação posterior do responsável.
          </p>
          <p className="text-sm">Convites enviados: {convites.length}</p>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
            <p className="font-semibold text-amber-950">
              Pendências para validação
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-amber-900">
              <li>Confirmar regulamento e critérios de desempate</li>
              <li>Obter aceite dos times convidados</li>
              <li>Definir e validar os elencos inscritos</li>
            </ul>
          </div>
          <Button
            variant="campo"
            className="w-full"
            onClick={() => setSalvo(true)}
          >
            Salvar rascunho
          </Button>
          {salvo ? (
            <p role="status" className="text-sm font-semibold text-green-dark">
              Rascunho salvo localmente.
            </p>
          ) : null}
          <Button
            variant="campoOutline"
            className="w-full"
            onClick={() => setPasso(1)}
          >
            Voltar
          </Button>
        </Card>
      ) : null}
    </>
  );
}

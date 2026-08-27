'use client';

import Link from 'next/link';
import { type FormEvent, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  ShieldCheck,
  Trophy,
} from 'lucide-react';

import { CampoFormulario } from '@/components/layout/campo-formulario';
import { Cartao } from '@/components/layout/cartao';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSessao } from '@/hooks/use-sessao';
import { catalogoOrganizadorMock } from '@/services/organizador/catalogo-organizador.mock';
import { cn } from '@/utils/classes';

type ContextoCampeonato = 'pessoal' | 'prefeitura';
type FormatoCampeonato =
  | 'PONTOS_CORRIDOS'
  | 'MATA_MATA'
  | 'GRUPOS_E_MATA_MATA';

type DadosCampeonato = {
  nome: string;
  contexto: ContextoCampeonato;
  municipioId: string;
  formato: FormatoCampeonato;
  inicioPrevistoEm: string;
};

const formatos: Array<{
  valor: FormatoCampeonato;
  titulo: string;
}> = [
  { valor: 'PONTOS_CORRIDOS', titulo: 'Pontos corridos' },
  { valor: 'MATA_MATA', titulo: 'Mata-mata' },
  { valor: 'GRUPOS_E_MATA_MATA', titulo: 'Grupos + mata-mata' },
];

export function TelaCriarCampeonato() {
  const { session } = useSessao();
  const comercial = catalogoOrganizadorMock.obterSituacaoComercial(
    session?.account.id ?? '',
  );
  const podeOrganizarComoPrefeitura =
    session?.links.institutionalOrganizationIds.includes('prefeitura-franca') ??
    false;

  const [dados, setDados] = useState<DadosCampeonato>({
    nome: '',
    contexto: 'pessoal',
    municipioId: 'franca-sp',
    formato: 'PONTOS_CORRIDOS',
    inicioPrevistoEm: '',
  });
  const [criado, setCriado] = useState(false);

  const contextoPrefeitura = dados.contexto === 'prefeitura';

  function atualizar<K extends keyof DadosCampeonato>(
    campo: K,
    valor: DadosCampeonato[K],
  ) {
    setDados((atual) => ({ ...atual, [campo]: valor }));
  }

  function criarCampeonato(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCriado(true);
  }

  if (criado) {
    return (
      <main className="mx-auto flex w-full max-w-xl justify-center py-6 sm:py-10">
        <Cartao className="w-full overflow-hidden p-0">
          <div className="border-t-4 border-green-mid bg-card px-6 py-7 text-center sm:px-8">
            <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-green-pale text-green-dark">
              <CheckCircle2 className="size-5" aria-hidden="true" />
            </span>
            <p className="mt-4 text-xs font-semibold tracking-[0.12em] text-green-dark uppercase">
              Campeonato criado
            </p>
            <h1 className="mt-1 font-display text-3xl font-bold tracking-[0.01em] text-foreground uppercase">
              {dados.nome}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Franca - SP ·{' '}
              {contextoPrefeitura
                ? 'Prefeitura de Franca'
                : session?.account.name ?? 'Conta pessoal'}
            </p>
          </div>

          <div className="border-t border-border px-6 py-5 sm:px-8">
            <div className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Formato
                </p>
                <p className="mt-1 font-medium text-foreground">
                  {formatos.find((item) => item.valor === dados.formato)?.titulo}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Início previsto
                </p>
                <p className="mt-1 font-medium text-foreground">
                  {new Date(`${dados.inicioPrevistoEm}T12:00:00`).toLocaleDateString(
                    'pt-BR',
                  )}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-md border border-border bg-muted/35 p-4">
              <p className="text-sm font-semibold text-foreground">
                Próxima etapa: configurar o campeonato
              </p>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                Regulamento, fases, critérios e participantes ficam na área de
                gerenciamento.
              </p>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <Button
                type="button"
                variant="campoOutline"
                tone="green"
                onClick={() => setCriado(false)}
              >
                Voltar
              </Button>
              <Button asChild variant="campo" tone="green">
                <Link href="/organizador/campeonatos">Continuar configuração</Link>
              </Button>
            </div>
          </div>
        </Cartao>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-xl justify-center py-6 sm:py-10">
      <form onSubmit={criarCampeonato} className="w-full">
        <Cartao className="w-full overflow-hidden p-0">
          <div className="border-t-4 border-green-mid px-6 pt-7 pb-5 text-center sm:px-8">
            <span className="mx-auto flex size-10 items-center justify-center rounded-full bg-green-pale text-green-dark">
              <Trophy className="size-5" aria-hidden="true" />
            </span>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-[0.01em] text-foreground uppercase sm:text-4xl">
              Novo campeonato
            </h1>
            <p className="mx-auto mt-1.5 max-w-sm text-sm leading-5 text-muted-foreground">
              Informe só o necessário para criar a competição. O restante será
              configurado depois.
            </p>
          </div>

          <div
            className={cn(
              'mx-6 flex items-start gap-2.5 rounded-md border px-3.5 py-3 text-sm sm:mx-8',
              contextoPrefeitura
                ? 'border-green-mid/25 bg-green-pale/70'
                : 'border-warning/20 bg-accent/15',
            )}
          >
            {contextoPrefeitura ? (
              <ShieldCheck
                className="mt-0.5 size-4 shrink-0 text-green-dark"
                aria-hidden="true"
              />
            ) : (
              <CircleDollarSign
                className="mt-0.5 size-4 shrink-0 text-warning"
                aria-hidden="true"
              />
            )}
            <p className="leading-5 text-foreground">
              {contextoPrefeitura
                ? 'Criação institucional pela Prefeitura de Franca.'
                : comercial.primeiroCampeonatoUtilizado
                  ? 'Seu benefício gratuito já foi utilizado. A elegibilidade será validada na criação.'
                  : 'Seu primeiro campeonato pessoal é gratuito.'}
            </p>
          </div>

          <div className="space-y-5 px-6 py-6 sm:px-8">
            <CampoFormulario
              label="Nome do campeonato *"
              htmlFor="nome-do-campeonato-field"
            >
              <Input
                id="nome-do-campeonato-field"
                value={dados.nome}
                onChange={(event) => atualizar('nome', event.target.value)}
                placeholder="Ex.: Copa Municipal de Franca 2026"
                autoComplete="off"
                required
              />
            </CampoFormulario>

            <div className="grid gap-4 sm:grid-cols-2">
              <fieldset>
                <legend className="mb-1.5 text-sm font-medium text-foreground">
                  Organizar como *
                </legend>
                <RadioGroup
                  value={dados.contexto}
                  onValueChange={(valor) =>
                    atualizar('contexto', valor as ContextoCampeonato)
                  }
                  className="grid gap-2"
                  aria-label="Contexto responsável"
                >
                  <label
                    htmlFor="contexto-pessoal"
                    className={cn(
                      'flex cursor-pointer items-center gap-2.5 rounded-md border px-3 py-2.5 text-sm transition-colors',
                      dados.contexto === 'pessoal'
                        ? 'border-green-mid bg-green-pale/70 font-medium'
                        : 'border-border hover:border-green-light',
                    )}
                  >
                    <RadioGroupItem id="contexto-pessoal" value="pessoal" />
                    Minha conta
                  </label>

                  {podeOrganizarComoPrefeitura ? (
                    <label
                      htmlFor="contexto-prefeitura"
                      className={cn(
                        'flex cursor-pointer items-center gap-2.5 rounded-md border px-3 py-2.5 text-sm transition-colors',
                        dados.contexto === 'prefeitura'
                          ? 'border-green-mid bg-green-pale/70 font-medium'
                          : 'border-border hover:border-green-light',
                      )}
                    >
                      <RadioGroupItem
                        id="contexto-prefeitura"
                        value="prefeitura"
                      />
                      Prefeitura
                    </label>
                  ) : null}
                </RadioGroup>
              </fieldset>

              <CampoFormulario label="Município *" htmlFor="municipio-field">
                <Select
                  value={dados.municipioId}
                  onValueChange={(valor) => atualizar('municipioId', valor)}
                  disabled={contextoPrefeitura}
                >
                  <SelectTrigger id="municipio-field">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="franca-sp">Franca - SP</SelectItem>
                  </SelectContent>
                </Select>
              </CampoFormulario>
            </div>

            <fieldset>
              <legend className="mb-1.5 text-sm font-medium text-foreground">
                Formato *
              </legend>
              <RadioGroup
                value={dados.formato}
                onValueChange={(valor) =>
                  atualizar('formato', valor as FormatoCampeonato)
                }
                className="grid gap-2"
                aria-label="Formato do campeonato"
              >
                {formatos.map((formato) => {
                  const selecionado = dados.formato === formato.valor;
                  return (
                    <label
                      key={formato.valor}
                      htmlFor={`formato-${formato.valor}`}
                      className={cn(
                        'flex cursor-pointer items-center gap-2.5 rounded-md border px-3 py-2.5 text-sm transition-colors',
                        selecionado
                          ? 'border-green-mid bg-green-pale/70 font-medium'
                          : 'border-border hover:border-green-light',
                      )}
                    >
                      <RadioGroupItem
                        id={`formato-${formato.valor}`}
                        value={formato.valor}
                      />
                      {formato.titulo}
                    </label>
                  );
                })}
              </RadioGroup>
            </fieldset>

            <CampoFormulario
              label="Início previsto *"
              htmlFor="data-inicio-field"
            >
              <div className="relative">
                <CalendarDays
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="data-inicio-field"
                  type="date"
                  className="pl-9"
                  value={dados.inicioPrevistoEm}
                  onChange={(event) =>
                    atualizar('inicioPrevistoEm', event.target.value)
                  }
                  required
                />
              </div>
            </CampoFormulario>
          </div>

          <div className="border-t border-border bg-muted/25 px-6 py-4 sm:px-8">
            <Button type="submit" variant="campo" tone="green" className="w-full">
              Criar campeonato
            </Button>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Times, regulamento e fases serão adicionados depois.
            </p>
          </div>
        </Cartao>
      </form>
    </main>
  );
}

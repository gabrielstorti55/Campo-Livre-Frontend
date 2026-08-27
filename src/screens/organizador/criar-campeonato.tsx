'use client';

import Link from 'next/link';
import { type FormEvent, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  MapPin,
  ShieldCheck,
  Trophy,
} from 'lucide-react';

import { CabecalhoPagina } from '@/components/layout/cabecalho-pagina';
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
  descricao: string;
}> = [
  {
    valor: 'PONTOS_CORRIDOS',
    titulo: 'Pontos corridos',
    descricao: 'Classificação única ao longo da competição.',
  },
  {
    valor: 'MATA_MATA',
    titulo: 'Mata-mata',
    descricao: 'Confrontos eliminatórios até a final.',
  },
  {
    valor: 'GRUPOS_E_MATA_MATA',
    titulo: 'Grupos + mata-mata',
    descricao: 'Grupos primeiro, eliminatórias depois.',
  },
];

function TituloSecao({
  icon: Icone,
  titulo,
}: {
  icon: typeof Trophy;
  titulo: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icone className="size-4 text-green-dark" aria-hidden="true" />
      <h2 className="font-display text-lg font-bold tracking-[0.02em] text-foreground uppercase">
        {titulo}
      </h2>
    </div>
  );
}

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
      <div className="mx-auto w-full max-w-2xl">
        <CabecalhoPagina
          title="Campeonato criado"
          subtitle="A competição foi criada e já pode receber as configurações restantes."
        />

        <Cartao className="mt-6 overflow-hidden p-0">
          <div className="border-b border-border bg-green-pale px-5 py-5 sm:px-6">
            <div className="flex gap-3">
              <CheckCircle2
                className="mt-0.5 size-5 shrink-0 text-green-dark"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold tracking-[0.08em] text-green-dark uppercase">
                  Em inscrições
                </p>
                <h2 className="mt-1 font-display text-2xl font-bold text-foreground">
                  {dados.nome}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Franca - SP ·{' '}
                  {contextoPrefeitura
                    ? 'Prefeitura de Franca'
                    : session?.account.name ?? 'Conta pessoal'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid border-b border-border sm:grid-cols-2">
            <div className="border-b border-border px-5 py-4 sm:border-r sm:border-b-0 sm:px-6">
              <span className="text-xs font-semibold text-muted-foreground uppercase">
                Formato
              </span>
              <p className="mt-1 text-sm font-medium">
                {formatos.find((item) => item.valor === dados.formato)?.titulo}
              </p>
            </div>
            <div className="px-5 py-4 sm:px-6">
              <span className="text-xs font-semibold text-muted-foreground uppercase">
                Início previsto
              </span>
              <p className="mt-1 text-sm font-medium">
                {new Date(`${dados.inicioPrevistoEm}T12:00:00`).toLocaleDateString(
                  'pt-BR',
                )}
              </p>
            </div>
          </div>

          <div className="px-5 py-5 sm:px-6">
            <h3 className="font-display text-lg font-bold uppercase">
              Complete a configuração
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Regulamento, fases, critérios, times e programação ficam para a
              área de gerenciamento do campeonato.
            </p>
          </div>
        </Cartao>

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="campoOutline"
            tone="green"
            onClick={() => setCriado(false)}
          >
            Voltar ao formulário
          </Button>
          <Button asChild variant="campo" tone="green">
            <Link href="/organizador/campeonatos">Ver meus campeonatos</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <CabecalhoPagina
        title="Novo Campeonato"
        subtitle="Preencha apenas os dados iniciais. O restante será configurado depois."
      />

      <form onSubmit={criarCampeonato} className="mt-6">
        <Cartao className="overflow-hidden p-0">
          <div
            className={cn(
              'flex gap-3 border-b border-border px-5 py-3.5 sm:px-6',
              contextoPrefeitura ? 'bg-green-pale' : 'bg-accent/20',
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
            <p className="text-sm leading-5 text-foreground">
              {contextoPrefeitura
                ? 'Criação institucional pela Prefeitura de Franca, sem consumo do benefício pessoal.'
                : comercial.primeiroCampeonatoUtilizado
                  ? 'Seu primeiro campeonato gratuito já foi utilizado. A elegibilidade será validada antes da criação.'
                  : 'Seu primeiro campeonato pessoal pode ser criado gratuitamente.'}
            </p>
          </div>

          <div className="space-y-6 px-5 py-5 sm:px-6 sm:py-6">
            <section aria-labelledby="dados-basicos-titulo" className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <TituloSecao icon={Trophy} titulo="Dados do campeonato" />
                <span className="text-xs text-muted-foreground">* obrigatório</span>
              </div>

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
                          : 'border-border bg-card hover:border-green-light',
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
                            : 'border-border bg-card hover:border-green-light',
                        )}
                      >
                        <RadioGroupItem
                          id="contexto-prefeitura"
                          value="prefeitura"
                        />
                        Prefeitura de Franca
                      </label>
                    ) : null}
                  </RadioGroup>
                </fieldset>

                <div>
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

                  <div className="mt-2 flex items-start gap-2 text-xs text-muted-foreground">
                    <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                    <span>
                      {contextoPrefeitura
                        ? 'Município definido pelo vínculo institucional.'
                        : 'UF é obtida automaticamente a partir do município.'}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section
              aria-labelledby="formato-inicio-titulo"
              className="space-y-4 border-t border-border pt-5"
            >
              <TituloSecao icon={CalendarDays} titulo="Formato e início" />

              <fieldset>
                <legend className="mb-2 text-sm font-medium text-foreground">
                  Formato *
                </legend>
                <RadioGroup
                  value={dados.formato}
                  onValueChange={(valor) =>
                    atualizar('formato', valor as FormatoCampeonato)
                  }
                  className="grid gap-2 sm:grid-cols-3"
                  aria-label="Formato do campeonato"
                >
                  {formatos.map((formato) => {
                    const selecionado = dados.formato === formato.valor;

                    return (
                      <label
                        key={formato.valor}
                        htmlFor={`formato-${formato.valor}`}
                        className={cn(
                          'cursor-pointer rounded-md border p-3 transition-colors',
                          selecionado
                            ? 'border-green-mid bg-green-pale/70'
                            : 'border-border bg-card hover:border-green-light',
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <RadioGroupItem
                            id={`formato-${formato.valor}`}
                            value={formato.valor}
                          />
                          <span className="text-sm font-semibold text-foreground">
                            {formato.titulo}
                          </span>
                        </div>
                        <p className="mt-1.5 pl-6 text-xs leading-4 text-muted-foreground">
                          {formato.descricao}
                        </p>
                      </label>
                    );
                  })}
                </RadioGroup>
              </fieldset>

              <CampoFormulario
                label="Data prevista de início *"
                htmlFor="data-inicio-field"
              >
                <Input
                  id="data-inicio-field"
                  type="date"
                  value={dados.inicioPrevistoEm}
                  onChange={(event) =>
                    atualizar('inicioPrevistoEm', event.target.value)
                  }
                  required
                />
              </CampoFormulario>
            </section>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-border bg-muted/30 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-xs text-muted-foreground sm:max-w-xs">
              Times, regulamento e fases serão configurados após a criação.
            </p>
            <Button type="submit" variant="campo" tone="green">
              Criar campeonato
            </Button>
          </div>
        </Cartao>
      </form>
    </div>
  );
}

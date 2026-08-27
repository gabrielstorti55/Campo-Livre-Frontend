'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  ListChecks,
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
    descricao: 'Todos disputam uma classificação ao longo da competição.',
  },
  {
    valor: 'MATA_MATA',
    titulo: 'Mata-mata',
    descricao: 'Confrontos eliminatórios até a definição do campeão.',
  },
  {
    valor: 'GRUPOS_E_MATA_MATA',
    titulo: 'Grupos + mata-mata',
    descricao: 'Fase de grupos seguida por confrontos eliminatórios.',
  },
];

function TituloSecao({
  icon: Icone,
  titulo,
  descricao,
}: {
  icon: typeof Trophy;
  titulo: string;
  descricao: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md border border-green-mid/30 bg-green-pale text-green-dark">
        <Icone className="size-4" aria-hidden="true" />
      </span>
      <div>
        <h2 className="font-display text-xl font-bold tracking-[0.01em] text-foreground uppercase">
          {titulo}
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">{descricao}</p>
      </div>
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

  function criarCampeonato(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCriado(true);
  }

  if (criado) {
    return (
      <>
        <CabecalhoPagina
          title="Campeonato criado"
          subtitle="As informações iniciais foram registradas. Agora a competição pode ser configurada."
        />

        <div className="mt-6 max-w-4xl space-y-5">
          <Cartao className="overflow-hidden p-0">
            <div className="border-b border-border bg-green-pale px-5 py-4 sm:px-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    className="mt-1 size-5 shrink-0 text-green-dark"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-xs font-semibold tracking-[0.08em] text-green-dark uppercase">
                      Em inscrições
                    </p>
                    <h2 className="mt-1 font-display text-2xl font-bold text-foreground sm:text-3xl">
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
            </div>

            <div className="grid gap-0 sm:grid-cols-3">
              <div className="border-b border-border px-5 py-4 sm:border-r sm:border-b-0 sm:px-6">
                <p className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                  Formato
                </p>
                <p className="mt-1 font-medium text-foreground">
                  {formatos.find((item) => item.valor === dados.formato)?.titulo}
                </p>
              </div>
              <div className="border-b border-border px-5 py-4 sm:border-r sm:border-b-0 sm:px-6">
                <p className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                  Início previsto
                </p>
                <p className="mt-1 font-medium text-foreground">
                  {new Date(`${dados.inicioPrevistoEm}T12:00:00`).toLocaleDateString(
                    'pt-BR',
                  )}
                </p>
              </div>
              <div className="px-5 py-4 sm:px-6">
                <p className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                  Responsável
                </p>
                <p className="mt-1 font-medium text-foreground">
                  {session?.account.name ?? 'Conta pessoal'}
                </p>
              </div>
            </div>
          </Cartao>

          <section
            aria-labelledby="proximos-passos-titulo"
            className="border-y border-border py-5"
          >
            <div className="flex items-start gap-3">
              <ListChecks
                className="mt-1 size-5 shrink-0 text-green-dark"
                aria-hidden="true"
              />
              <div>
                <h2
                  id="proximos-passos-titulo"
                  className="font-display text-xl font-bold tracking-[0.01em] text-foreground uppercase"
                >
                  Próximos passos
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Complete a configuração antes de iniciar a competição.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {[
                'Definir regulamento',
                'Configurar estrutura das fases',
                'Ordenar critérios de desempate',
                'Convidar times participantes',
                'Validar elencos inscritos',
                'Preparar distribuição e programação',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm">
                  <span
                    className="size-2 shrink-0 rounded-full border border-muted-foreground"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="campoOutline"
              tone="green"
              onClick={() => setCriado(false)}
            >
              Voltar ao formulário
            </Button>
            <Button asChild variant="campo" tone="green">
              <Link href="/organizador/campeonatos">Ir para meus campeonatos</Link>
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <CabecalhoPagina
        title="Novo Campeonato"
        subtitle="Cadastre as informações iniciais. Regulamento, fases e participantes serão configurados depois."
      />

      <form onSubmit={criarCampeonato} className="mt-6 max-w-4xl">
        <Cartao className="overflow-hidden p-0">
          <div
            className={cn(
              'flex gap-3 border-b border-border px-5 py-4 sm:px-6',
              contextoPrefeitura ? 'bg-green-pale' : 'bg-accent/25',
            )}
          >
            {contextoPrefeitura ? (
              <ShieldCheck
                className="mt-0.5 size-5 shrink-0 text-green-dark"
                aria-hidden="true"
              />
            ) : (
              <CircleDollarSign
                className="mt-0.5 size-5 shrink-0 text-warning"
                aria-hidden="true"
              />
            )}
            <div>
              <p className="text-sm font-semibold text-foreground">
                {contextoPrefeitura
                  ? 'Criação institucional'
                  : comercial.primeiroCampeonatoUtilizado
                    ? 'Situação comercial da conta'
                    : 'Primeiro campeonato pessoal gratuito'}
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {contextoPrefeitura
                  ? 'O campeonato será criado em nome da Prefeitura de Franca e não consome o benefício pessoal.'
                  : comercial.primeiroCampeonatoUtilizado
                    ? 'Seu primeiro campeonato gratuito já foi utilizado. A elegibilidade comercial será validada antes da criação.'
                    : 'Este campeonato utiliza o benefício gratuito disponível para sua conta pessoal.'}
              </p>
            </div>
          </div>

          <div className="space-y-7 px-5 py-6 sm:px-6 sm:py-7">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                Responsável:{' '}
                <strong className="font-semibold text-foreground">
                  {session?.account.name ?? 'Conta pessoal'}
                </strong>
              </p>
              <p className="text-xs font-medium text-muted-foreground">
                * obrigatório
              </p>
            </div>

            <section aria-labelledby="identificacao-titulo" className="space-y-5">
              <TituloSecao
                icon={Trophy}
                titulo="Identificação"
                descricao="Dê um nome claro para localizar e administrar a competição."
              />
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
            </section>

            <section
              aria-labelledby="organizacao-titulo"
              className="space-y-5 border-t border-border pt-7"
            >
              <TituloSecao
                icon={ShieldCheck}
                titulo="Organização"
                descricao="Defina em qual contexto o campeonato será administrado."
              />

              <fieldset>
                <legend className="mb-2 text-sm font-medium text-foreground">
                  Organizar como *
                </legend>
                <RadioGroup
                  value={dados.contexto}
                  onValueChange={(valor) =>
                    atualizar('contexto', valor as ContextoCampeonato)
                  }
                  className="grid gap-3 sm:grid-cols-2"
                  aria-label="Contexto responsável"
                >
                  <label
                    htmlFor="contexto-pessoal"
                    className={cn(
                      'flex min-h-20 cursor-pointer items-start gap-3 rounded-md border p-4 transition-colors',
                      dados.contexto === 'pessoal'
                        ? 'border-green-mid bg-green-pale/70'
                        : 'border-border bg-card hover:border-green-light',
                    )}
                  >
                    <RadioGroupItem
                      id="contexto-pessoal"
                      value="pessoal"
                      className="mt-0.5"
                    />
                    <span>
                      <span className="block font-semibold text-foreground">
                        Minha conta
                      </span>
                      <span className="mt-1 block text-sm text-muted-foreground">
                        {session?.account.name ?? 'Conta pessoal'} será o responsável.
                      </span>
                    </span>
                  </label>

                  {podeOrganizarComoPrefeitura ? (
                    <label
                      htmlFor="contexto-prefeitura"
                      className={cn(
                        'flex min-h-20 cursor-pointer items-start gap-3 rounded-md border p-4 transition-colors',
                        dados.contexto === 'prefeitura'
                          ? 'border-green-mid bg-green-pale/70'
                          : 'border-border bg-card hover:border-green-light',
                      )}
                    >
                      <RadioGroupItem
                        id="contexto-prefeitura"
                        value="prefeitura"
                        className="mt-0.5"
                      />
                      <span>
                        <span className="block font-semibold text-foreground">
                          Prefeitura de Franca
                        </span>
                        <span className="mt-1 block text-sm text-muted-foreground">
                          Criação vinculada à instituição municipal.
                        </span>
                      </span>
                    </label>
                  ) : null}
                </RadioGroup>
              </fieldset>
            </section>

            <section
              aria-labelledby="localizacao-titulo"
              className="space-y-5 border-t border-border pt-7"
            >
              <TituloSecao
                icon={MapPin}
                titulo="Localização"
                descricao="O município define a referência territorial do campeonato."
              />
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
                {contextoPrefeitura ? (
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Definido pelo vínculo institucional da Prefeitura.
                  </p>
                ) : null}
              </CampoFormulario>
            </section>

            <section
              aria-labelledby="formato-titulo"
              className="space-y-5 border-t border-border pt-7"
            >
              <TituloSecao
                icon={ListChecks}
                titulo="Formato"
                descricao="Escolha a estrutura geral. Os detalhes das fases serão configurados depois."
              />

              <fieldset>
                <legend className="sr-only">Formato do campeonato</legend>
                <RadioGroup
                  value={dados.formato}
                  onValueChange={(valor) =>
                    atualizar('formato', valor as FormatoCampeonato)
                  }
                  className="grid gap-3 md:grid-cols-3"
                  aria-label="Formato do campeonato"
                >
                  {formatos.map((formato) => {
                    const selecionado = dados.formato === formato.valor;
                    const id = `formato-${formato.valor.toLowerCase()}`;

                    return (
                      <label
                        key={formato.valor}
                        htmlFor={id}
                        className={cn(
                          'cursor-pointer rounded-md border p-4 transition-colors',
                          selecionado
                            ? 'border-green-mid bg-green-pale/70'
                            : 'border-border bg-card hover:border-green-light',
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <RadioGroupItem
                            id={id}
                            value={formato.valor}
                            className="mt-0.5"
                          />
                          <span>
                            <span className="block font-display text-lg font-bold text-foreground">
                              {formato.titulo}
                            </span>
                            <span className="mt-1.5 block text-sm leading-5 text-muted-foreground">
                              {formato.descricao}
                            </span>
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </RadioGroup>
              </fieldset>
            </section>

            <section
              aria-labelledby="previsao-titulo"
              className="space-y-5 border-t border-border pt-7"
            >
              <TituloSecao
                icon={CalendarDays}
                titulo="Previsão"
                descricao="Informe quando a competição está prevista para começar."
              />
              <div className="max-w-sm">
                <CampoFormulario
                  label="Início previsto *"
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
              </div>
            </section>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-border bg-muted/35 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <Button asChild type="button" variant="ghost">
              <Link href="/organizador/campeonatos">Cancelar</Link>
            </Button>
            <Button type="submit" variant="campo" tone="green">
              Criar campeonato
            </Button>
          </div>
        </Cartao>
      </form>
    </>
  );
}

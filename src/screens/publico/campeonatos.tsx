'use client';

import { ArrowUpRight, MapPin, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { BarraBusca } from '@/components/layout/barra-busca';
import { DestaquePagina } from '@/components/layout/destaque-pagina';
import { EstadoRecurso } from '@/components/layout/estado-recurso';
import { Button } from '@/components/ui/button';
import { useCampeonatosApi } from '@/contexts/campeonatos-api';
import { useMunicipiosApi } from '@/contexts/municipios-api';
import type { CampeonatoPublicoResumo, Pagina } from '@/types/api/campeonatos';
import type { Municipio } from '@/types/api/municipios';
import { cn } from '@/utils/classes';

const cardFocus =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';
const selectClass =
  'h-11 min-w-0 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

const estadoLabel: Record<CampeonatoPublicoResumo['status'], string> = {
  EM_ANDAMENTO: 'Em andamento',
  ENCERRADO: 'Encerrado',
  CANCELADO: 'Cancelado',
};

export function TelaCampeonatos() {
  const api = useCampeonatosApi();
  const municipiosApi = useMunicipiosApi();
  const [busca, setBusca] = useState('');
  const [estado, setEstado] = useState<
    CampeonatoPublicoResumo['status'] | 'TODOS'
  >('TODOS');
  const [uf, setUf] = useState('');
  const [municipioId, setMunicipioId] = useState('');
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [pagina, setPagina] = useState(1);
  const [tentativa, setTentativa] = useState(0);
  const [resultado, setResultado] =
    useState<Pagina<CampeonatoPublicoResumo> | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [falhou, setFalhou] = useState(false);
  const geracao = useRef(0);

  useEffect(() => {
    let ativo = true;
    void municipiosApi
      .listarMunicipios({ pagina: 1, tamanho: 100 })
      .then((resposta) => {
        if (ativo) setMunicipios(resposta.itens);
      })
      .catch(() => {
        if (ativo) setMunicipios([]);
      });
    return () => {
      ativo = false;
    };
  }, [municipiosApi]);

  useEffect(() => {
    const geracaoAtual = ++geracao.current;
    const timer = window.setTimeout(
      () => {
        setCarregando(true);
        setFalhou(false);
        setResultado(null);
        const filtros = {
          pagina,
          tamanho: 18,
          ...(busca.trim() ? { nome: busca.trim() } : {}),
          ...(municipioId ? { municipioId } : {}),
          ...(uf.trim() ? { uf: uf.trim().toUpperCase() } : {}),
          ...(estado !== 'TODOS' ? { status: estado } : {}),
        };
        void api.listarCampeonatosPublicos(filtros).then(
          (resposta) => {
            if (geracao.current !== geracaoAtual) return;
            setResultado(resposta);
            setCarregando(false);
          },
          () => {
            if (geracao.current !== geracaoAtual) return;
            setFalhou(true);
            setCarregando(false);
          },
        );
      },
      busca ? 250 : 0,
    );

    return () => {
      geracao.current += 1;
      window.clearTimeout(timer);
    };
  }, [api, busca, estado, municipioId, pagina, tentativa, uf]);

  function reiniciarPagina(acao: () => void) {
    acao();
    setPagina(1);
  }

  return (
    <div className="mx-auto w-full max-w-[1380px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <DestaquePagina
        eyebrow="Competições públicas"
        title="Campeonatos"
        description="Acompanhe competições publicadas, seus participantes, estrutura, classificação e resultados."
      />

      <section
        aria-label="Filtros de campeonatos"
        className="mb-7 rounded-md border border-border/70 bg-card p-4 shadow-none sm:p-5"
      >
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_14rem_12rem_8rem]">
          <label className="grid gap-1 text-xs font-semibold">
            Pesquisar
            <BarraBusca
              placeholder="Buscar campeonatos..."
              value={busca}
              onChange={(valor) => reiniciarPagina(() => setBusca(valor))}
            />
          </label>
          <label className="grid gap-1 text-xs font-semibold">
            Município
            <select
              className={selectClass}
              value={municipioId}
              onChange={(event) =>
                reiniciarPagina(() => setMunicipioId(event.target.value))
              }
            >
              <option value="">Todos</option>
              {municipios.map((municipio) => (
                <option key={municipio.id} value={municipio.id}>
                  {municipio.nome}/{municipio.uf}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-xs font-semibold">
            Estado do campeonato
            <select
              className={selectClass}
              value={estado}
              onChange={(event) =>
                reiniciarPagina(() =>
                  setEstado(
                    event.target.value as
                      CampeonatoPublicoResumo['status'] | 'TODOS',
                  ),
                )
              }
            >
              <option value="TODOS">Todos</option>
              {Object.entries(estadoLabel).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-xs font-semibold">
            UF
            <input
              className={selectClass}
              value={uf}
              maxLength={2}
              placeholder="Todas"
              onChange={(event) =>
                reiniciarPagina(() => setUf(event.target.value.toUpperCase()))
              }
            />
          </label>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          <strong className="text-foreground">
            {resultado?.totalItens ?? 0}
          </strong>{' '}
          competições públicas
        </p>
      </section>

      {carregando ? <p role="status">Carregando campeonatos...</p> : null}
      {falhou ? (
        <div className="space-y-4">
          <EstadoRecurso
            kind="error"
            title="Não foi possível consultar os campeonatos"
            description="Tente novamente. Nenhum catálogo local será usado como substituto."
          />
          <div className="flex justify-center">
            <Button
              variant="campoOutline"
              onClick={() => setTentativa((valor) => valor + 1)}
            >
              Tentar novamente
            </Button>
          </div>
        </div>
      ) : null}
      {!carregando && !falhou && resultado?.itens.length === 0 ? (
        <EstadoRecurso
          kind="empty"
          title="Nenhum campeonato encontrado"
          description="Tente outro nome, UF ou estado. Competições ainda não publicadas nunca aparecem nesta consulta."
        />
      ) : null}

      {resultado?.itens.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {resultado.itens.map((campeonato, index) => (
            <Link
              key={campeonato.id}
              href={`/campeonatos/${campeonato.id}`}
              className={cn(
                'group relative overflow-hidden rounded-md border border-border/70 bg-card p-5 shadow-none transition hover:border-green-light hover:shadow-none sm:p-6',
                cardFocus,
              )}
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-green-mid/70" />
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-green-pale text-green-dark">
                    <Trophy className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <p className="text-xs font-semibold tracking-[0.15em] text-muted-foreground uppercase">
                    {index === 0 ? 'Em destaque' : 'Competição publicada'}
                  </p>
                  <h2 className="mt-1.5 font-display text-xl font-semibold sm:text-2xl">
                    {campeonato.nome}
                  </h2>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                    {campeonato.municipio.nome}/{campeonato.municipio.uf}
                  </p>
                </div>
                <span className="rounded-full bg-green-pale px-3 py-1 text-xs font-semibold text-green-dark">
                  {estadoLabel[campeonato.status]}
                </span>
              </div>
              <div className="mt-6 flex min-h-11 items-center justify-between border-t border-border/70 pt-4 text-sm font-semibold text-green-dark">
                Ver campeonato
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
      ) : null}

      {resultado && resultado.totalPaginas > 1 ? (
        <nav
          aria-label="Paginação dos campeonatos"
          className="mt-7 flex items-center justify-center gap-4"
        >
          <Button
            variant="campoOutline"
            disabled={carregando || resultado.pagina <= 1}
            onClick={() => setPagina((valor) => valor - 1)}
          >
            Anterior
          </Button>
          <span className="text-sm">
            Página {resultado.pagina} de {resultado.totalPaginas}
          </span>
          <Button
            variant="campoOutline"
            disabled={carregando || resultado.pagina >= resultado.totalPaginas}
            onClick={() => setPagina((valor) => valor + 1)}
          >
            Próxima
          </Button>
        </nav>
      ) : null}
    </div>
  );
}

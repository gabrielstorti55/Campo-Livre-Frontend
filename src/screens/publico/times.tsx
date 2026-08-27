'use client';

import { ArrowUpRight, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { BarraBusca } from '@/components/layout/barra-busca';
import { DestaquePagina } from '@/components/layout/destaque-pagina';
import { EstadoRecurso } from '@/components/layout/estado-recurso';
import { Button } from '@/components/ui/button';
import { useTimesApi } from '@/contexts/times-api';
import type { PaginaTimes } from '@/types/api/times';
import { cn } from '@/utils/classes';

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

export function TelaTimes() {
  const api = useTimesApi();
  const [busca, setBusca] = useState('');
  const [uf, setUf] = useState('');
  const [pagina, setPagina] = useState(1);
  const [resultado, setResultado] = useState<PaginaTimes | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [falhou, setFalhou] = useState(false);

  useEffect(() => {
    let ativo = true;
    const timer = window.setTimeout(() => {
      setCarregando(true);
      setFalhou(false);
      setResultado(null);
      const filtros = {
        pagina,
        tamanho: 18,
        ...(busca.trim() ? { nome: busca.trim() } : {}),
        ...(uf ? { uf } : {}),
      };
      void api.listarTimes(filtros).then(
        (resposta) => {
          if (!ativo) return;
          setResultado(resposta);
          setCarregando(false);
        },
        () => {
          if (!ativo) return;
          setFalhou(true);
          setCarregando(false);
        },
      );
    }, 250);
    return () => {
      ativo = false;
      window.clearTimeout(timer);
    };
  }, [api, busca, pagina, uf]);

  function alterarBusca(valor: string) {
    setBusca(valor);
    setPagina(1);
  }

  return (
    <div className="mx-auto w-full max-w-[1380px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <DestaquePagina
        eyebrow="Clubes e equipes"
        title="Times"
        description="Consulte equipes ativas e abra sua projeção esportiva pública autorizada."
      />

      <div className="mb-7 grid gap-4 rounded-md border border-border/70 bg-card p-4 sm:grid-cols-[minmax(0,1fr)_10rem_auto] sm:items-center sm:p-5">
        <BarraBusca
          placeholder="Buscar times por nome..."
          value={busca}
          onChange={alterarBusca}
        />
        <label className="text-sm font-semibold">
          <span className="sr-only">Filtrar por UF</span>
          <input
            value={uf}
            maxLength={2}
            placeholder="UF"
            aria-label="Filtrar por UF"
            onChange={(event) => {
              setUf(event.target.value.toUpperCase());
              setPagina(1);
            }}
            className="min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 uppercase"
          />
        </label>
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">
            {resultado?.totalItens ?? 0}
          </strong>{' '}
          times ativos
        </p>
      </div>

      {carregando ? <p role="status">Carregando times...</p> : null}
      {falhou ? (
        <EstadoRecurso
          kind="error"
          title="Não foi possível consultar os times"
          description="Tente novamente. Nenhum catálogo local será usado como substituto."
        />
      ) : null}
      {!carregando && !falhou && resultado?.itens.length === 0 ? (
        <EstadoRecurso
          kind="empty"
          title="Nenhum time encontrado"
          description="Tente outro nome ou UF. A listagem mostra somente times ativos."
        />
      ) : null}

      {resultado?.itens.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {resultado.itens.map((time) => (
            <Link
              key={time.id}
              href={`/times/${time.id}`}
              className={cn(
                'group rounded-md border border-border/70 bg-card p-5 shadow-none transition hover:border-green-light sm:p-6',
                focusRing,
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-md bg-green-dark font-display text-lg font-bold text-white">
                    {time.escudoUrl ? (
                      <img
                        src={time.escudoUrl}
                        alt=""
                        className="h-full w-full rounded-md object-cover"
                      />
                    ) : (
                      time.sigla.slice(0, 3)
                    )}
                  </div>
                  <h2 className="font-display text-xl font-semibold sm:text-2xl">
                    {time.nome}
                  </h2>
                  <p className="mt-1 text-xs font-semibold text-green-dark">
                    {time.sigla}
                  </p>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                    {time.municipio.nome}/{time.municipio.uf}
                  </p>
                </div>
                <span className="border-l-2 border-accent pl-2 text-xs font-semibold text-green-dark">
                  Ativo
                </span>
              </div>
              <div className="mt-6 flex min-h-11 items-center justify-between border-t border-border/70 pt-4 text-sm font-semibold text-green-dark">
                Ver time
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
      ) : null}

      {resultado && resultado.totalPaginas > 1 ? (
        <nav
          aria-label="Paginação dos times"
          className="mt-7 flex items-center justify-center gap-4"
        >
          <Button
            variant="campoOutline"
            disabled={carregando || resultado.pagina <= 1}
            onClick={() => setPagina((atual) => atual - 1)}
          >
            Anterior
          </Button>
          <span className="text-sm">
            Página {resultado.pagina} de {resultado.totalPaginas}
          </span>
          <Button
            variant="campoOutline"
            disabled={carregando || resultado.pagina >= resultado.totalPaginas}
            onClick={() => setPagina((atual) => atual + 1)}
          >
            Próxima
          </Button>
        </nav>
      ) : null}
    </div>
  );
}

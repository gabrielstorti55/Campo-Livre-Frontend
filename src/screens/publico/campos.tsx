'use client';

import { MapPin } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { DestaquePagina } from '@/components/layout/destaque-pagina';
import { EstadoRecurso } from '@/components/layout/estado-recurso';
import { Button } from '@/components/ui/button';
import { useCamposApi } from '@/contexts/campos-api';
import type { PaginaCampos } from '@/types/api/campos';

const rotulosEstado = {
  ATIVO: 'Ativo',
  INATIVO: 'Inativo',
  EM_MANUTENCAO: 'Em manutenção',
} as const;

export function TelaCampos() {
  const api = useCamposApi();
  const [pagina, setPagina] = useState(1);
  const [estado, setEstado] = useState<{
    paginaSolicitada: number | null;
    resultado: PaginaCampos | null;
    falhou: boolean;
  }>({ paginaSolicitada: null, resultado: null, falhou: false });

  useEffect(() => {
    let ativo = true;
    void api.listarCampos({ pagina, tamanho: 20 }).then(
      (resultado) => {
        if (ativo)
          setEstado({ paginaSolicitada: pagina, resultado, falhou: false });
      },
      () => {
        if (ativo)
          setEstado({
            paginaSolicitada: pagina,
            resultado: null,
            falhou: true,
          });
      },
    );
    return () => {
      ativo = false;
    };
  }, [api, pagina]);

  const carregando = estado.paginaSolicitada !== pagina;

  return (
    <div className="mx-auto w-full max-w-[1380px] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <DestaquePagina
        eyebrow="Equipamentos municipais"
        title="Campos"
        description="Consulte os campos cadastrados e o estado operacional informado pelas Prefeituras. O cadastro não representa reserva ou autorização de uso."
      />

      {carregando ? <p role="status">Carregando campos...</p> : null}
      {!carregando && estado.falhou ? (
        <EstadoRecurso
          kind="error"
          title="Não foi possível consultar os campos"
          description="Tente novamente em alguns instantes."
        />
      ) : null}
      {!carregando && !estado.falhou && estado.resultado?.itens.length === 0 ? (
        <EstadoRecurso
          kind="empty"
          title="Nenhum campo encontrado"
          description="Não há campos ativos disponíveis para esta consulta."
        />
      ) : null}

      {!carregando && estado.resultado?.itens.length ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {estado.resultado.itens.map((campo) => (
              <article
                key={campo.id}
                className="border-t-2 border-green-dark bg-card p-5"
              >
                <p className="text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                  {rotulosEstado[campo.statusOperacional]}
                </p>
                <h2 className="mt-2 font-display text-2xl font-bold">
                  {campo.nome}
                </h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  {campo.endereco}
                </p>
                <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  {campo.municipio.nome}/{campo.municipio.uf}
                </p>
                <Button className="mt-5" variant="campoOutline" asChild>
                  <Link href={`/campos/${campo.id}`}>Consultar campo</Link>
                </Button>
              </article>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="campoOutline"
              disabled={pagina <= 1}
              onClick={() => setPagina((atual) => atual - 1)}
            >
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {estado.resultado.pagina} de{' '}
              {Math.max(1, estado.resultado.totalPaginas)}
            </span>
            <Button
              variant="campoOutline"
              disabled={pagina >= estado.resultado.totalPaginas}
              onClick={() => setPagina((atual) => atual + 1)}
            >
              Próxima
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}

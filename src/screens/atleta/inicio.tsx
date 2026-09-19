'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { CabecalhoPagina } from '@/components/layout/cabecalho-pagina';
import { EstadoRecurso } from '@/components/layout/estado-recurso';
import { Button } from '@/components/ui/button';
import { useTimesApi } from '@/contexts/times-api';
import { useSessao } from '@/hooks/use-sessao';
import type { PaginaTimesDaConta } from '@/types/api/times';

export function TelaInicioAtleta() {
  const api = useTimesApi();
  const { session, executarAutenticado } = useSessao();
  const [pagina, setPagina] = useState<PaginaTimesDaConta | null>(null);
  const [falhou, setFalhou] = useState(false);

  useEffect(() => {
    if (!session) return;
    let ativo = true;
    executarAutenticado((accessToken) =>
      api.listarMeusTimes(accessToken, 1, 100),
    )
      .then((resultado) => {
        if (ativo) setPagina(resultado);
      })
      .catch(() => {
        if (ativo) setFalhou(true);
      });

    return () => {
      ativo = false;
    };
  }, [api, executarAutenticado, session]);

  if (!session) return <p role="status">Carregando sua área...</p>;

  return (
    <>
      <CabecalhoPagina
        title={`Olá, ${session.minhaConta.nome}`}
        subtitle="Conta pessoal · área esportiva"
      />

      {!pagina && !falhou ? (
        <p role="status">Carregando seus times...</p>
      ) : null}
      {falhou ? (
        <EstadoRecurso
          kind="error"
          title="Não foi possível carregar seus times"
          description="Tente novamente em alguns instantes."
        />
      ) : null}
      {pagina?.itens.length === 0 ? (
        <EstadoRecurso
          kind="empty"
          title="Você ainda não participa de um time"
          description="Consulte convites recebidos ou encontre times ativos."
        />
      ) : null}
      {pagina && pagina.itens.length > 0 ? (
        <section aria-labelledby="seus-times">
          <h2 id="seus-times" className="font-display text-2xl font-semibold">
            Seus times
          </h2>
          <div className="mt-4 divide-y divide-border border-y border-border">
            {pagina.itens.map((vinculo) => (
              <Link
                key={vinculo.membroId}
                href={
                  vinculo.funcao === 'CAPITAO'
                    ? `/atleta/time/${vinculo.time.id}`
                    : `/times/${vinculo.time.id}`
                }
                className="flex items-center justify-between gap-4 py-4 text-sm hover:text-green-dark"
              >
                <span>
                  <strong className="block text-base">
                    {vinculo.time.nome}
                  </strong>
                  <span className="text-muted-foreground">
                    {vinculo.time.sigla} ·{' '}
                    {vinculo.funcao === 'CAPITAO' ? 'Capitão' : 'Atleta'}
                  </span>
                </span>
                <span className="font-semibold">
                  {vinculo.time.status === 'ATIVO' ? 'Acessar' : 'Desativado'}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <Button variant="campo" asChild>
          <Link href="/atleta/time/buscar">Buscar times e ver convites</Link>
        </Button>
        <Button variant="campoOutline" asChild>
          <Link href="/atleta/perfil">Editar perfil básico</Link>
        </Button>
      </div>
    </>
  );
}

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { EstadoRecurso } from '@/components/layout/estado-recurso';
import { useTimesApi } from '@/contexts/times-api';
import { useSessao } from '@/hooks/use-sessao';
import type { PaginaTimesDaConta } from '@/types/api/times';

export function ConteudoMeusTimes() {
  const api = useTimesApi();
  const { session, executarAutenticado } = useSessao();
  const [pagina, setPagina] = useState<PaginaTimesDaConta | null>(null);
  const [falhou, setFalhou] = useState(false);

  useEffect(() => {
    if (!session) return;
    let ativo = true;
    setPagina(null);
    setFalhou(false);
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

  if (!session) return <p role="status">Carregando seus times...</p>;

  if (!pagina && !falhou) {
    return <p role="status">Carregando seus times...</p>;
  }

  if (falhou) {
    return (
      <EstadoRecurso
        kind="error"
        title="Não foi possível carregar seus times"
        description="Tente novamente em alguns instantes."
      />
    );
  }

  if (pagina?.itens.length === 0) {
    return (
      <EstadoRecurso
        kind="empty"
        title="Você ainda não participa de um time"
        description="Consulte os convites recebidos ou encontre times ativos abaixo."
      />
    );
  }

  return pagina ? (
    <section aria-labelledby="seus-times">
      <h2 id="seus-times" className="font-display text-2xl font-semibold">
        Seus times
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Equipes às quais sua conta está vinculada como atleta ou capitão.
      </p>
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
              <strong className="block text-base">{vinculo.time.nome}</strong>
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
  ) : null;
}

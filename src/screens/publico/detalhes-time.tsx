'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { DestaquePagina } from '@/components/layout/destaque-pagina';
import { EstadoRecurso } from '@/components/layout/estado-recurso';
import { Iniciais } from '@/components/layout/iniciais';
import { Button } from '@/components/ui/button';
import { useTimesApi } from '@/contexts/times-api';
import type { PaginaElenco, TimeDetalhado } from '@/types/api/times';

function anoEntrada(valor: string): string {
  return new Intl.DateTimeFormat('pt-BR', { year: 'numeric' }).format(
    new Date(valor),
  );
}

export function TelaDetalhesTime() {
  const { id } = useParams<{ id: string }>();
  const api = useTimesApi();
  const [paginaAtual, setPaginaAtual] = useState(1);
  const chaveAtual = `${id}:${paginaAtual}`;
  const [estado, setEstado] = useState<{
    chave: string | null;
    detalhe: TimeDetalhado | null;
    elenco: PaginaElenco | null;
    falhou: boolean;
  }>({ chave: null, detalhe: null, elenco: null, falhou: false });

  useEffect(() => {
    let ativo = true;
    void Promise.all([
      api.consultarTime(id),
      api.listarElenco(id, paginaAtual, 20),
    ]).then(
      ([detalhe, elenco]) => {
        if (ativo) {
          setEstado({ chave: chaveAtual, detalhe, elenco, falhou: false });
        }
      },
      () => {
        if (ativo) {
          setEstado({
            chave: chaveAtual,
            detalhe: null,
            elenco: null,
            falhou: true,
          });
        }
      },
    );
    return () => {
      ativo = false;
    };
  }, [api, chaveAtual, id, paginaAtual]);

  if (estado.chave !== chaveAtual) {
    return (
      <div className="mx-auto w-full max-w-[1100px] px-4 py-10">
        <p role="status">Carregando time...</p>
      </div>
    );
  }

  if (estado.falhou || !estado.detalhe || !estado.elenco) {
    return (
      <div className="mx-auto w-full max-w-[1100px] px-4 py-10">
        <EstadoRecurso
          kind="error"
          title="Time não encontrado"
          description="O link pode estar incorreto ou este time não está disponível publicamente."
        />
      </div>
    );
  }

  const { detalhe, elenco } = estado;
  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <DestaquePagina
        eyebrow={`${detalhe.sigla} · ${detalhe.municipio.nome}, ${detalhe.municipio.uf}`}
        title={detalhe.nome}
        description={
          detalhe.descricao ??
          'Projeção esportiva pública do time, sem contatos ou dados pessoais.'
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <section
          role="region"
          aria-label="Elenco público"
          className="border-y border-border bg-card py-5 sm:p-6"
        >
          <h2 className="font-display text-xl font-semibold">Elenco público</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Capitão: {detalhe.capitao.nome} · somente vínculos ativos
            permitidos.
          </p>

          <div className="mt-5 grid gap-3">
            {elenco.itens.map((atleta) => (
              <article
                key={atleta.membroId}
                className="flex items-center gap-3 border-l-2 border-green-mid py-2 pl-3"
              >
                <div role="img" aria-label={`Foto de ${atleta.nome}`}>
                  <Iniciais name={atleta.nome} className="h-10 w-10" />
                </div>
                <div className="text-sm">
                  <h3 className="font-semibold">{atleta.nome}</h3>
                  <p className="text-muted-foreground">
                    {atleta.funcao === 'CAPITAO' ? 'Capitão' : 'Atleta'} · desde{' '}
                    {anoEntrada(atleta.entrouEm)} ·{' '}
                    {atleta.estatisticas.partidas} partidas ·{' '}
                    {atleta.estatisticas.gols} gols
                  </p>
                </div>
              </article>
            ))}
            {elenco.itens.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum membro ativo disponível nesta projeção.
              </p>
            ) : null}
          </div>

          {elenco.totalPaginas > 1 ? (
            <nav
              aria-label="Paginação do elenco"
              className="mt-5 flex items-center justify-between border-t border-border pt-4"
            >
              <Button
                variant="campoOutline"
                disabled={paginaAtual <= 1}
                onClick={() => setPaginaAtual((atual) => atual - 1)}
              >
                Página anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {elenco.pagina} de {elenco.totalPaginas}
              </span>
              <Button
                variant="campoOutline"
                disabled={paginaAtual >= elenco.totalPaginas}
                onClick={() => setPaginaAtual((atual) => atual + 1)}
              >
                Próxima página
              </Button>
            </nav>
          ) : null}
        </section>

        <section className="border-y border-border bg-card py-5 sm:p-6">
          <h2 className="font-display text-xl font-semibold">
            Resumo esportivo
          </h2>
          <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Partidas</dt>
              <dd className="font-display text-2xl font-bold">
                {detalhe.estatisticasGerais.partidas}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Vitórias</dt>
              <dd className="font-display text-2xl font-bold">
                {detalhe.estatisticasGerais.vitorias}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Gols</dt>
              <dd className="font-display text-2xl font-bold">
                {detalhe.estatisticasGerais.gols}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Status</dt>
              <dd className="font-semibold">{detalhe.status}</dd>
            </div>
          </dl>
          <p className="mt-4 text-sm text-muted-foreground">
            {detalhe.estatisticasGerais.partidas} partidas registradas na
            projeção pública.
          </p>
        </section>
      </div>
    </div>
  );
}

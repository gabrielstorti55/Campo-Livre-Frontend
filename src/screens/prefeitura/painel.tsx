'use client';

import { useEffect, useState } from 'react';

import { CabecalhoPagina } from '@/components/layout/cabecalho-pagina';
import { EstadoRecurso } from '@/components/layout/estado-recurso';
import { Secao } from '@/components/layout/secao';
import { usePrefeiturasApi } from '@/contexts/prefeituras-api';
import { useSessao } from '@/hooks/use-sessao';
import type { PaginaPrefeiturasDaConta } from '@/types/api/prefeituras';

export function TelaPainelPrefeitura() {
  const api = usePrefeiturasApi();
  const { session, executarAutenticado } = useSessao();
  const identidade = session?.account.id ?? null;
  const [estado, setEstado] = useState<{
    identidade: string | null;
    pagina: PaginaPrefeiturasDaConta | null;
    falhou: boolean;
  }>({ identidade: null, pagina: null, falhou: false });

  useEffect(() => {
    if (!session) return;
    let ativo = true;
    void executarAutenticado((accessToken) =>
      api.listarMinhasPrefeituras(accessToken, 1, 100),
    ).then(
      (resultado) => {
        if (ativo) {
          setEstado({ identidade, pagina: resultado, falhou: false });
        }
      },
      () => {
        if (ativo) {
          setEstado({ identidade, pagina: null, falhou: true });
        }
      },
    );
    return () => {
      ativo = false;
    };
  }, [api, executarAutenticado, identidade, session]);

  const pagina = estado.identidade === identidade ? estado.pagina : null;
  const falhou = estado.identidade === identidade && estado.falhou;

  return (
    <>
      <CabecalhoPagina
        title="Gestão municipal"
        subtitle="Vínculos institucionais confirmados pela API do CampoLivre"
      />

      {!pagina && !falhou ? (
        <p role="status">Carregando seus vínculos institucionais...</p>
      ) : null}

      {falhou ? (
        <EstadoRecurso
          kind="error"
          title="Não foi possível carregar seus vínculos"
          description="Tente novamente em alguns instantes."
        />
      ) : null}

      {pagina?.itens.length === 0 ? (
        <EstadoRecurso
          kind="empty"
          title="Nenhuma Prefeitura vinculada"
          description="Sua conta está ativa, mas não possui vínculo institucional municipal."
        />
      ) : null}

      {pagina && pagina.itens.length > 0 ? (
        <Secao title="Prefeituras vinculadas">
          <div className="divide-y divide-border border-y border-border">
            {pagina.itens.map((vinculo) => (
              <article key={vinculo.membroId} className="py-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-xl font-semibold text-foreground">
                      {vinculo.prefeitura.nomeOficial}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {vinculo.prefeitura.municipio.nome}/
                      {vinculo.prefeitura.municipio.uf}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-navy-mid">
                    {vinculo.papel === 'RESPONSAVEL'
                      ? 'Responsável institucional'
                      : 'Membro institucional'}
                  </span>
                </div>
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground">Situação</dt>
                    <dd className="font-medium">
                      {vinculo.prefeitura.status === 'ATIVA'
                        ? 'Ativa'
                        : 'Inativa'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Contato público</dt>
                    <dd className="font-medium">
                      {vinculo.prefeitura.emailContatoPublico}
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </Secao>
      ) : null}
    </>
  );
}

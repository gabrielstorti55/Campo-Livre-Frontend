'use client';

import { useSessao } from '@/hooks/use-sessao';
import { catalogoOrganizadorMock } from '@/services/organizador/catalogo-organizador.mock';
import { CabecalhoPagina } from '@/components/layout/cabecalho-pagina';
import { Card } from '@/components/ui/card';

const estadoLabel = {
  EM_CONFIGURACAO: 'Em configuração',
  EM_ANDAMENTO: 'Em andamento',
  ENCERRADO: 'Encerrado',
  CANCELADO: 'Cancelado',
} as const;

export function TelaPerfilOrganizador() {
  const { session } = useSessao();
  const campeonatos = catalogoOrganizadorMock.listarCampeonatos(
    session?.account.id ?? '',
    session?.links.organizedChampionshipIds ?? [],
  );
  const comercial = catalogoOrganizadorMock.obterSituacaoComercial(
    session?.account.id ?? '',
  );

  return (
    <>
      <CabecalhoPagina
        title="Histórico do organizador"
        subtitle={session?.account.name ?? 'Conta pessoal'}
      />

      <section aria-label="Participações como organizador" className="mb-8">
        <h2 className="font-display text-xl font-semibold">
          Participações como organizador
        </h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {campeonatos.map((campeonato) => (
            <Card key={campeonato.id} className="p-5">
              <h3 className="font-display text-lg font-semibold">
                {campeonato.nome}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {campeonato.contexto.nome}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded-full bg-muted px-3 py-1">
                  {campeonato.papelDaConta === 'RESPONSAVEL'
                    ? 'Responsável'
                    : 'Colaborador'}
                </span>
                <span className="rounded-full bg-muted px-3 py-1">
                  {estadoLabel[campeonato.estado]}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section aria-label="Histórico comercial">
        <h2 className="font-display text-xl font-semibold">
          Histórico comercial
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Registros locais de pagamentos vinculados a um campeonato específico;
          não são comprovantes reais.
        </p>
        <div className="mt-4 space-y-3">
          {comercial.pagamentos.length === 0 ? (
            <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
              Nenhum pagamento vinculado a campeonato.
            </p>
          ) : null}
          {comercial.pagamentos.map((pagamento) => (
            <Card key={pagamento.id} className="p-5">
              <div className="flex flex-col justify-between gap-2 sm:flex-row">
                <div>
                  <h3 className="font-semibold">{pagamento.campeonato}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Mercado Pago · {pagamento.valor} · {pagamento.data}
                  </p>
                </div>
                <strong className="text-sm">{pagamento.estado}</strong>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}

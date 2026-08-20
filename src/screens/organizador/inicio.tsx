'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';

import { useSessao } from '@/hooks/use-sessao';
import { catalogoOrganizadorMock } from '@/services/organizador/catalogo-organizador.mock';
import { CabecalhoPagina } from '@/components/layout/cabecalho-pagina';
import { IndicadorSituacao } from '@/components/layout/indicador-situacao';
import { Button } from '@/components/ui/button';

const papelLabel = {
  RESPONSAVEL: 'Responsável',
  ORGANIZADOR: 'Colaborador',
} as const;

export function TelaInicioOrganizador() {
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
        title={session?.account.name ?? 'Painel do organizador'}
        subtitle="Organize apenas os campeonatos vinculados à sua conta"
        actions={
          <Button variant="campo" asChild>
            <Link href="/organizador/novo">
              <Plus className="h-4 w-4" /> Novo campeonato
            </Link>
          </Button>
        }
      />

      <section
        aria-label="Situação comercial"
        className="mb-8 rounded-3xl border border-border/70 bg-card p-5"
      >
        <h2 className="font-display text-xl font-semibold">
          Situação comercial
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-muted p-4 text-sm">
            <strong>
              {comercial.primeiroCampeonatoUtilizado
                ? 'Primeiro campeonato gratuito utilizado'
                : 'Primeiro campeonato gratuito disponível'}
            </strong>
            <p className="mt-1 text-muted-foreground">
              O benefício pessoal é consumido uma única vez.
            </p>
          </div>
          <div className="rounded-2xl bg-muted p-4 text-sm">
            <strong>
              {comercial.direitosAdicionaisDisponiveis}{' '}
              {comercial.direitosAdicionaisDisponiveis === 1
                ? 'direito adicional disponível'
                : 'direitos adicionais disponíveis'}
            </strong>
            <p className="mt-1 text-muted-foreground">
              Campeonatos de Prefeitura elegível são isentos e não consomem o
              benefício pessoal.
            </p>
          </div>
        </div>
      </section>

      <section aria-label="Meus campeonatos" className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">
          Meus campeonatos
        </h2>
        {campeonatos.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-6">
            <p className="font-semibold">Nenhum vínculo com campeonato</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Ativar o painel não concede acesso a competições de terceiros.
              Crie um campeonato para se tornar responsável por ele.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {campeonatos.map((campeonato) => (
              <Link
                key={campeonato.id}
                href={`/organizador/campeonato/${campeonato.id}`}
                className="rounded-3xl border border-border/70 bg-card p-5 shadow-sm transition hover:border-green-light"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg font-semibold">
                      {campeonato.nome}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {campeonato.modalidade} · {campeonato.municipio}/
                      {campeonato.uf}
                    </p>
                  </div>
                  <IndicadorSituacao status={campeonato.estado} />
                </div>
                <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="rounded-full bg-green-pale px-3 py-1 text-green-dark">
                    {papelLabel[campeonato.papelDaConta]}
                  </span>
                  <span className="rounded-full bg-muted px-3 py-1">
                    {campeonato.contexto.nome}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

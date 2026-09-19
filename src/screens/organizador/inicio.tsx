'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';

import { useCampeonatosAdministrados } from '@/hooks/use-campeonatos-administrados';
import { useSessao } from '@/hooks/use-sessao';
import { CabecalhoPagina } from '@/components/layout/cabecalho-pagina';
import { IndicadorSituacao } from '@/components/layout/indicador-situacao';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function TelaInicioOrganizador() {
  const { session } = useSessao();
  const { campeonatos, carregando, erro } = useCampeonatosAdministrados();

  return (
    <>
      <CabecalhoPagina
        title={session?.account.name ?? 'Painel do organizador'}
        subtitle="Organize apenas os Campeonatos vinculados à sua conta"
        actions={
          <Button variant="campo" asChild>
            <Link href="/organizador/novo">
              <Plus className="h-4 w-4" /> Novo campeonato
            </Link>
          </Button>
        }
      />
      <section aria-label="Meus campeonatos" className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">
          Meus campeonatos
        </h2>
        {carregando ? <p role="status">Carregando Campeonatos...</p> : null}
        {erro ? (
          <Card role="alert" className="p-5 text-sm">
            {erro}
          </Card>
        ) : null}
        {!carregando && !erro && campeonatos.length === 0 ? (
          <Card className="border-dashed p-6">
            <p className="font-semibold">Nenhum vínculo com Campeonato</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Crie um Campeonato para se tornar responsável por ele.
            </p>
          </Card>
        ) : null}
        <div className="grid gap-4 md:grid-cols-2">
          {campeonatos.map((campeonato) => (
            <Link
              key={campeonato.campeonatoId}
              href={`/organizador/campeonato/${campeonato.campeonatoId}`}
              className="rounded-md border border-border/70 bg-card p-5 transition hover:border-green-light"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg font-semibold">
                    {campeonato.nome}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {campeonato.prefeitura?.nome ?? 'Contexto pessoal'}
                  </p>
                </div>
                <IndicadorSituacao status={campeonato.status} />
              </div>
              <p className="mt-4 text-xs font-semibold text-green-dark">
                {campeonato.vinculo.funcao === 'RESPONSAVEL'
                  ? 'Responsável'
                  : 'Organizador'}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

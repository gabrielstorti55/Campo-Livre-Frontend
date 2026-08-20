'use client';

import Link from 'next/link';

import { useSessao } from '@/hooks/use-sessao';
import { catalogoOrganizadorMock } from '@/services/organizador/catalogo-organizador.mock';
import { CabecalhoPagina } from '@/components/layout/cabecalho-pagina';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function TelaCampeonatosOrganizador() {
  const { session } = useSessao();
  const campeonatos = catalogoOrganizadorMock.listarCampeonatos(
    session?.account.id ?? '',
    session?.links.organizedChampionshipIds ?? [],
  );

  return (
    <>
      <CabecalhoPagina
        title="Campeonatos administrados"
        subtitle="Somente vínculos ativos da conta"
        actions={
          <Button asChild variant="campo">
            <Link href="/organizador/novo">Novo campeonato</Link>
          </Button>
        }
      />
      <div className="space-y-4">
        {campeonatos.map((campeonato) => (
          <Card key={campeonato.id} className="p-5">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-display text-lg font-semibold">
                  {campeonato.nome}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {campeonato.papelDaConta === 'RESPONSAVEL'
                    ? 'Responsável'
                    : 'Colaborador'}{' '}
                  · {campeonato.contexto.nome} · {campeonato.estado}
                </p>
              </div>
              <Button asChild variant="campoOutline">
                <Link href={`/organizador/campeonato/${campeonato.id}`}>
                  Administrar
                </Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

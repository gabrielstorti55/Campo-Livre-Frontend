'use client';

import { MapPin, Trophy } from 'lucide-react';
import Link from 'next/link';

import { CabecalhoPagina } from '@/components/layout/cabecalho-pagina';
import { EstadoRecurso } from '@/components/layout/estado-recurso';
import { Button } from '@/components/ui/button';
import { useSessao } from '@/hooks/use-sessao';
import { campeonatosPublicosMock } from '@/mocks/publico/dados-publicos';

const estadoLabel = {
  EM_CONFIGURACAO: 'Em configuração',
  EM_ANDAMENTO: 'Em andamento',
  ENCERRADO: 'Encerrado',
  CANCELADO: 'Cancelado',
} as const;

export function TelaCampeonatosAtleta() {
  const { session } = useSessao();
  const campeonatos = campeonatosPublicosMock.filter(
    (campeonato) => campeonato.publicado && campeonato.timeIds.includes(1),
  );

  return (
    <>
      <CabecalhoPagina
        title="Meus campeonatos"
        subtitle="Competições vinculadas ao Vila Nova FC"
      />

      {!session?.prototipo ? (
        <EstadoRecurso
          kind="empty"
          title="Vínculos esportivos ainda indisponíveis"
          description="A área integrada aguarda a projeção de campeonatos vinculados à conta."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {campeonatos.map((campeonato) => (
            <article
              key={campeonato.id}
              className="border-t-4 border-green-mid bg-card p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <Trophy className="h-6 w-6 text-green-mid" aria-hidden="true" />
                <span className="text-xs font-semibold tracking-wide text-green-dark uppercase">
                  {estadoLabel[campeonato.estado]}
                </span>
              </div>
              <h2 className="mt-5 font-display text-2xl font-bold uppercase">
                {campeonato.nome}
              </h2>
              <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                {campeonato.municipio}/{campeonato.uf} · {campeonato.rodada}
              </p>
              <Button className="mt-5" variant="campoOutline" asChild>
                <Link href={`/campeonatos/${campeonato.id}`}>
                  Consultar campeonato
                </Link>
              </Button>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

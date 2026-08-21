'use client';

import Link from 'next/link';
import { useState } from 'react';

import { catalogoPublicoMock } from '@/services/publico/catalogo-publico.mock';
import { Iniciais } from '@/components/layout/iniciais';
import { BarraBusca } from '@/components/layout/barra-busca';
import { DestaquePagina } from '@/components/layout/destaque-pagina';
import { EstadoRecurso } from '@/components/layout/estado-recurso';

export function TelaAtletas() {
  const [busca, setBusca] = useState('');
  const atletas = catalogoPublicoMock.listarAtletas(busca);
  return (
    <div className="mx-auto w-full max-w-[1380px] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <DestaquePagina
        eyebrow="Descoberta esportiva"
        title="Atletas"
        description="Perfis autorizados com fatos derivados somente de resultados publicados."
      />
      <div className="mb-7 max-w-xl rounded-md border border-border/70 bg-card p-4">
        <BarraBusca
          placeholder="Buscar atletas..."
          value={busca}
          onChange={setBusca}
        />
      </div>
      {atletas.length === 0 ? (
        <EstadoRecurso
          kind="empty"
          title="Nenhum atleta encontrado"
          description="Perfis privados não aparecem na busca pública."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {atletas.map((atleta) => (
            <Link
              key={atleta.id}
              href={`/atletas/${atleta.id}`}
              className="flex items-center gap-4 rounded-md border border-border/70 bg-card p-5 shadow-none"
            >
              <Iniciais name={atleta.nome} className="h-12 w-12" />
              <div>
                <h2 className="font-display text-lg font-semibold">
                  {atleta.nome}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {atleta.posicao} · {atleta.municipio}, {atleta.uf}
                </p>
                <p className="mt-1 text-sm font-semibold text-green-dark">
                  {atleta.golsPublicados} gols publicados
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

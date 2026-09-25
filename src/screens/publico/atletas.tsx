'use client';

import { MapPin, Shield, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { BarraBusca } from '@/components/layout/barra-busca';
import { DestaquePagina } from '@/components/layout/destaque-pagina';
import { EstadoRecurso } from '@/components/layout/estado-recurso';
import { Iniciais } from '@/components/layout/iniciais';
import { atletasPublicosMock } from '@/mocks/publico/dados-publicos';

export function TelaAtletas({ prototipo = false }: { prototipo?: boolean }) {
  const [busca, setBusca] = useState('');
  const atletas = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR');
    return atletasPublicosMock.filter(
      (atleta) =>
        !termo ||
        atleta.nome.toLocaleLowerCase('pt-BR').includes(termo) ||
        atleta.posicao.toLocaleLowerCase('pt-BR').includes(termo),
    );
  }, [busca]);

  return (
    <div className="mx-auto w-full max-w-[1380px] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <DestaquePagina
        eyebrow="Descoberta esportiva"
        title="Atletas"
        description="Conheça atletas do futebol local por meio de perfis, vínculos e estatísticas esportivas publicadas."
      />

      {!prototipo ? (
        <EstadoRecurso
          kind="empty"
          title="Catálogo de atletas ainda indisponível"
          description="A projeção pública depende do contrato completo de perfis esportivos no backend integrado."
        />
      ) : (
        <>
          <section
            aria-label="Busca de atletas"
            className="mb-7 rounded-md border border-border/70 bg-card p-4 sm:p-5"
          >
            <BarraBusca
              placeholder="Buscar por atleta ou posição..."
              value={busca}
              onChange={setBusca}
            />
            <p className="mt-4 text-sm text-muted-foreground">
              <strong className="text-foreground">{atletas.length}</strong>{' '}
              atletas com perfil público
            </p>
          </section>

          {atletas.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {atletas.map((atleta) => (
                <Link
                  key={atleta.id}
                  href={`/atletas/${atleta.id}`}
                  className="group border-t-4 border-green-mid bg-card p-5 transition hover:bg-green-pale/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="flex items-start gap-4">
                    <Iniciais
                      name={atleta.nome}
                      className="h-14 w-14 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold tracking-[0.12em] text-green-mid uppercase">
                        {atleta.posicao}
                      </p>
                      <h2 className="mt-1 font-display text-2xl font-bold uppercase">
                        {atleta.nome}
                      </h2>
                      <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" aria-hidden="true" />
                        {atleta.municipio}/{atleta.uf}
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border/70 pt-4 text-sm">
                    <span className="flex items-center gap-2">
                      <Trophy
                        className="h-4 w-4 text-green-mid"
                        aria-hidden="true"
                      />
                      {atleta.golsPublicados} gols
                    </span>
                    <span className="flex items-center gap-2">
                      <Shield
                        className="h-4 w-4 text-green-mid"
                        aria-hidden="true"
                      />
                      {atleta.partidasPublicadas} partidas
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EstadoRecurso
              kind="empty"
              title="Nenhum atleta encontrado"
              description="Tente buscar por outro nome ou posição."
            />
          )}
        </>
      )}
    </div>
  );
}

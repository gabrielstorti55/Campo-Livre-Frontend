'use client';

import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { useState } from 'react';

import { InformacoesCampeonato } from '@/components/modules/campeonatos/informacoes-campeonato';
import { IndicadorSituacao } from '@/components/layout/indicador-situacao';
import { EstadoRecurso } from '@/components/layout/estado-recurso';
import { Cartao } from '@/components/layout/cartao';
import { CabecalhoPagina } from '@/components/layout/cabecalho-pagina';
import { BarraBusca } from '@/components/layout/barra-busca';
import { campeonatos } from '@/mocks/dados-gerais';

export function TelaCampeonatosAtleta() {
  const [busca, setBusca] = useState('');
  const lista = campeonatos.filter((c) =>
    c.nome.toLowerCase().includes(busca.toLowerCase()),
  );

  return (
    <>
      <CabecalhoPagina
        title="Campeonatos"
        subtitle="Campeonatos disponíveis na sua região"
      />
      <BarraBusca
        placeholder="Buscar campeonatos..."
        value={busca}
        onChange={setBusca}
      />

      {lista.length === 0 ? (
        <EstadoRecurso
          kind="empty"
          title="Nenhum campeonato encontrado"
          description="Revise o termo de busca ou consulte novamente quando novos campeonatos forem publicados."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {lista.map((c) => (
            <section
              key={c.id}
              role="region"
              aria-label={`Campeonato ${c.nome}`}
            >
              <Cartao className="flex h-full flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link
                      href={`/campeonatos/${c.id}`}
                      className="truncate font-display font-semibold text-foreground hover:text-green-mid"
                    >
                      {c.nome}
                    </Link>
                    <InformacoesCampeonato cidade={c.cidade} icon={MapPin} />
                  </div>
                  <IndicadorSituacao status={c.status} />
                </div>
                <InformacoesCampeonato
                  times={c.times}
                  modalidade={c.modalidade}
                  formato={c.formato}
                />
                <p className="rounded-lg bg-green-pale px-3 py-2 text-center text-xs font-semibold text-green-dark">
                  Participação por convite do organizador ao capitão
                </p>
              </Cartao>
            </section>
          ))}
        </div>
      )}
    </>
  );
}

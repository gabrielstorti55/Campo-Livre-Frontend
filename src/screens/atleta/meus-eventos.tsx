'use client';

import Link from 'next/link';

import { CabecalhoPagina } from '@/components/layout/cabecalho-pagina';
import { EstadoRecurso } from '@/components/layout/estado-recurso';
import { Button } from '@/components/ui/button';

export function TelaMeusEventos() {
  return (
    <>
      <CabecalhoPagina
        title="Meus eventos"
        subtitle="Agenda derivada dos vínculos da conta"
      />
      <EstadoRecurso
        kind="empty"
        title="Agenda pessoal ainda indisponível"
        description="Os Times e vínculos ativos da conta já são consultáveis, mas ainda não existe uma projeção de agenda pessoal que relacione esses vínculos às partidas. A listagem pública de campeonatos não será usada como substituta."
      />
      <div className="mt-4 flex justify-center">
        <Button variant="campo" asChild>
          <Link href="/atleta/time/buscar">Consultar times e convites</Link>
        </Button>
      </div>
    </>
  );
}

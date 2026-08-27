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
        description="Não existe contrato publicado para consultar os times e vínculos ativos da conta nem uma API de agenda de partidas. A listagem pública de campeonatos não comprova participação e não será usada como substituta."
      />
      <div className="mt-4 flex justify-center">
        <Button variant="campo" asChild>
          <Link href="/atleta/time/buscar">Consultar times e convites</Link>
        </Button>
      </div>
    </>
  );
}

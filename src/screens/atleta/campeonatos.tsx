'use client';

import Link from 'next/link';

import { CabecalhoPagina } from '@/components/layout/cabecalho-pagina';
import { EstadoRecurso } from '@/components/layout/estado-recurso';
import { Button } from '@/components/ui/button';

export function TelaCampeonatosAtleta() {
  return (
    <>
      <CabecalhoPagina
        title="Campeonatos"
        subtitle="Consulta esportiva sem dados simulados"
      />
      <EstadoRecurso
        kind="error"
        title="Contrato de campeonatos aguardando publicação coerente"
        description="O Drive contém rotas materializadas, mas o catálogo e os casos de uso ainda declaram estados incompatíveis e contrato adiado. A integração permanece suspensa para não assumir status, formatos ou projeções incorretas."
      />
      <div className="mt-4 flex justify-center">
        <Button variant="campoOutline" asChild>
          <Link href="/atleta/inicio">Voltar para a área esportiva</Link>
        </Button>
      </div>
    </>
  );
}

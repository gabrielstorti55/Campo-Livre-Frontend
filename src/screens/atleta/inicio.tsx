'use client';

import Link from 'next/link';

import { CabecalhoPagina } from '@/components/layout/cabecalho-pagina';
import { EstadoRecurso } from '@/components/layout/estado-recurso';
import { Button } from '@/components/ui/button';
import { useSessao } from '@/hooks/use-sessao';

export function TelaInicioAtleta() {
  const { session } = useSessao();
  if (!session) return <p role="status">Carregando sua área...</p>;

  return (
    <>
      <CabecalhoPagina
        title={`Olá, ${session.minhaConta.nome}`}
        subtitle="Conta pessoal · área esportiva"
      />

      <EstadoRecurso
        kind="empty"
        title="Contexto esportivo ainda não selecionado"
        description="O backend ainda não publica os times e vínculos ativos da sua conta. Enquanto esse contrato não existe, consulte times e convites sem fabricar um vínculo local."
      />
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <Button variant="campo" asChild>
          <Link href="/atleta/time/buscar">Buscar times e ver convites</Link>
        </Button>
        <Button variant="campoOutline" asChild>
          <Link href="/atleta/perfil">Editar perfil básico</Link>
        </Button>
      </div>
    </>
  );
}

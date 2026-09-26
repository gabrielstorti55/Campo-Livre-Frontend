'use client';

import Link from 'next/link';

import { CabecalhoPagina } from '@/components/layout/cabecalho-pagina';
import { Button } from '@/components/ui/button';
import { useSessao } from '@/hooks/use-sessao';
import { ConteudoMeusTimes } from '@/screens/atleta/meus-times';

export function TelaInicioAtleta() {
  const { session } = useSessao();

  if (!session) return <p role="status">Carregando sua área...</p>;

  return (
    <>
      <CabecalhoPagina
        title={`Olá, ${session.minhaConta.nome}`}
        subtitle="Conta pessoal · área esportiva"
      />

      <ConteudoMeusTimes />

      <div className="mt-6 flex flex-wrap gap-3">
        <Button variant="campo" asChild>
          <Link href="/atleta/time/buscar">Abrir Times e convites</Link>
        </Button>
        <Button variant="campoOutline" asChild>
          <Link href="/atleta/perfil">Editar perfil básico</Link>
        </Button>
      </div>
    </>
  );
}

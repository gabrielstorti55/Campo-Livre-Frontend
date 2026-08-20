'use client';

import Link from 'next/link';

import { PaginaEstado } from '@/components/layout/pagina-estado';
import { Button } from '@/components/ui/button';

export function TelaPaginaNaoEncontrada() {
  return (
    <PaginaEstado
      code="404"
      title="Página não encontrada"
      description="A página que você está procurando não existe ou foi movida."
      actions={
        <Button variant="campo" asChild>
          <Link href="/login">Voltar ao acesso</Link>
        </Button>
      }
    />
  );
}

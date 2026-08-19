'use client';

import Link from 'next/link';

import { StatusPage } from '@/shared/components/status-page';
import { Button } from '@/shared/components/ui/button';

export function NotFoundPage() {
  return (
    <StatusPage
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

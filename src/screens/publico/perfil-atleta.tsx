'use client';

import Link from 'next/link';

import { EstadoRecurso } from '@/components/layout/estado-recurso';
import { Button } from '@/components/ui/button';

export function TelaPerfilAtleta() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <EstadoRecurso
        kind="empty"
        title="Perfil esportivo ainda indisponível"
        description="A rota pública foi aprovada, mas o DTO completo da projeção esportiva ainda precisa ser publicado. Estatísticas, histórico e vínculos simulados não substituem esse contrato."
      />
      <div className="mt-4 flex justify-center">
        <Button variant="campoOutline" asChild>
          <Link href="/atletas">Voltar para atletas</Link>
        </Button>
      </div>
    </div>
  );
}

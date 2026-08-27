'use client';

import { DestaquePagina } from '@/components/layout/destaque-pagina';
import { EstadoRecurso } from '@/components/layout/estado-recurso';

export function TelaAtletas() {
  return (
    <div className="mx-auto w-full max-w-[1380px] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <DestaquePagina
        eyebrow="Descoberta esportiva"
        title="Atletas"
        description="Os perfis esportivos são públicos no MVP e serão exibidos a partir da projeção autorizada do backend."
      />
      <EstadoRecurso
        kind="empty"
        title="Catálogo de atletas ainda indisponível"
        description="A rota de perfil já foi aprovada, mas o DTO completo e o contrato de busca ainda não foram publicados. Dados simulados não substituem esses contratos no modo integrado."
      />
    </div>
  );
}

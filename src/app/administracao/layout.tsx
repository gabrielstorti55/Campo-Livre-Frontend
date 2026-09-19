import type { ReactNode } from 'react';
import Link from 'next/link';

import { ControleAcessoAdministracao } from '@/components/layout/controle-acesso-administracao';

export default function AdministracaoLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ControleAcessoAdministracao>
      <div className="mx-auto w-full max-w-[1180px] px-4 py-8 sm:px-6 lg:px-8">
        <nav
          aria-label="Administração Global"
          className="mb-8 flex gap-4 border-b border-border pb-4 text-sm font-semibold"
        >
          <Link href="/administracao/administradores">Administradores</Link>
          <Link href="/administracao/contas">Contas</Link>
          <Link href="/administracao/prefeituras">Prefeituras</Link>
        </nav>
        {children}
      </div>
    </ControleAcessoAdministracao>
  );
}

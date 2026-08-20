import type { ReactNode } from 'react';

import { LayoutOrganizador } from '@/layouts/areas-personas';
import { ControleAcessoOrganizador } from '@/components/layout/controle-acesso-organizador';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <ControleAcessoOrganizador>
      <LayoutOrganizador>{children}</LayoutOrganizador>
    </ControleAcessoOrganizador>
  );
}

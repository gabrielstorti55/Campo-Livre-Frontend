import type { ReactNode } from 'react';

import { LayoutAtleta } from '@/layouts/areas-personas';
import { ControleAcessoAtleta } from '@/components/layout/controle-acesso-atleta';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <ControleAcessoAtleta>
      <LayoutAtleta>{children}</LayoutAtleta>
    </ControleAcessoAtleta>
  );
}

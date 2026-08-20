import type { ReactNode } from 'react';

import { LayoutPrefeitura } from '@/layouts/areas-personas';
import { ControleAcessoPrefeitura } from '@/components/layout/controle-acesso-prefeitura';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <ControleAcessoPrefeitura>
      <LayoutPrefeitura>{children}</LayoutPrefeitura>
    </ControleAcessoPrefeitura>
  );
}

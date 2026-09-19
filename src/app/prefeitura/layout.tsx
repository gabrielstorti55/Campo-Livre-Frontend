import type { ReactNode } from 'react';

import { LayoutPrefeitura } from '@/layouts/areas-personas';
import { ControleAcessoPrefeitura } from '@/components/layout/controle-acesso-prefeitura';
import { ControleModoPrefeitura } from '@/components/prototipo/controle-modo-prefeitura';
import { obterModoAplicacao } from '@/config/modo-aplicacao';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <ControleModoPrefeitura modo={obterModoAplicacao()}>
      <ControleAcessoPrefeitura>
        <LayoutPrefeitura>{children}</LayoutPrefeitura>
      </ControleAcessoPrefeitura>
    </ControleModoPrefeitura>
  );
}

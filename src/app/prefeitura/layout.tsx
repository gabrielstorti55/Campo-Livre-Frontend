import type { ReactNode } from 'react';

import { LayoutPrefeitura } from '@/layouts/areas-personas';
import { ControleAcessoPrefeitura } from '@/components/layout/controle-acesso-prefeitura';
import { ControleModoPrototipo } from '@/components/prototipo/controle-modo-prototipo';
import { obterModoAplicacao } from '@/config/modo-aplicacao';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <ControleModoPrototipo modo={obterModoAplicacao()}>
      <ControleAcessoPrefeitura>
        <LayoutPrefeitura>{children}</LayoutPrefeitura>
      </ControleAcessoPrefeitura>
    </ControleModoPrototipo>
  );
}

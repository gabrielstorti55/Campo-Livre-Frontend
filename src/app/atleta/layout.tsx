import type { ReactNode } from 'react';

import { LayoutAtleta } from '@/layouts/areas-personas';
import { ControleAcessoAtleta } from '@/components/layout/controle-acesso-atleta';
import { ControleModoAtleta } from '@/components/prototipo/controle-modo-atleta';
import { obterModoAplicacao } from '@/config/modo-aplicacao';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <ControleModoAtleta modo={obterModoAplicacao()}>
      <ControleAcessoAtleta>
        <LayoutAtleta>{children}</LayoutAtleta>
      </ControleAcessoAtleta>
    </ControleModoAtleta>
  );
}

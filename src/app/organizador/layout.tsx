import type { ReactNode } from 'react';

import { LayoutOrganizador } from '@/layouts/areas-personas';
import { ControleAcessoOrganizador } from '@/components/layout/controle-acesso-organizador';
import { ControleModoOrganizador } from '@/components/prototipo/controle-modo-organizador';
import { obterModoAplicacao } from '@/config/modo-aplicacao';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <ControleModoOrganizador modo={obterModoAplicacao()}>
      <ControleAcessoOrganizador>
        <LayoutOrganizador>{children}</LayoutOrganizador>
      </ControleAcessoOrganizador>
    </ControleModoOrganizador>
  );
}

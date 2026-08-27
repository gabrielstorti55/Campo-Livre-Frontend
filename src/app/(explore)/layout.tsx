import type { ReactNode } from 'react';

import { ControleModoExploracao } from '@/components/prototipo/controle-modo-exploracao';
import { obterModoAplicacao } from '@/config/modo-aplicacao';
import { LayoutExploracao } from '@/layouts/exploracao-publica';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <ControleModoExploracao modo={obterModoAplicacao()}>
      <LayoutExploracao>{children}</LayoutExploracao>
    </ControleModoExploracao>
  );
}

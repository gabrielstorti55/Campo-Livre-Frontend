import '@fontsource/ibm-plex-sans/400.css';
import '@fontsource/ibm-plex-sans/500.css';
import '@fontsource/ibm-plex-sans/600.css';
import '@fontsource/ibm-plex-sans/700.css';
import '@fontsource/barlow-condensed/500.css';
import '@fontsource/barlow-condensed/600.css';
import '@fontsource/barlow-condensed/700.css';
import '@fontsource/barlow-condensed/800.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { ProvedoresAplicacao } from '@/layouts/provedores-aplicacao';

import './styles.css';

export const metadata: Metadata = {
  title: 'CampoLivre — Futebol local, jogo aberto',
  description:
    'Campeonatos, partidas e histórias do futebol amador em um só campo.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <ProvedoresAplicacao>{children}</ProvedoresAplicacao>
      </body>
    </html>
  );
}

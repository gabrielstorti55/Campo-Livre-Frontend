import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { Providers } from '@/app/providers';

import './styles.css';

export const metadata: Metadata = {
  title: 'CampoLivre LigaPro',
  description: 'Plataforma de gestão de campeonatos amadores de futebol.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

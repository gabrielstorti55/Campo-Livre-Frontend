import type { ReactNode } from 'react';

import { LayoutExploracao } from '@/layouts/exploracao-publica';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return <LayoutExploracao>{children}</LayoutExploracao>;
}

import type { ReactNode } from 'react';

import { AtletaLayout } from '@/app/layouts';

export default function Layout({ children }: { children: ReactNode }) {
  return <AtletaLayout>{children}</AtletaLayout>;
}

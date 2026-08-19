import type { ReactNode } from 'react';

import { PrefeituraLayout } from '@/app/layouts';

export default function Layout({ children }: { children: ReactNode }) {
  return <PrefeituraLayout>{children}</PrefeituraLayout>;
}

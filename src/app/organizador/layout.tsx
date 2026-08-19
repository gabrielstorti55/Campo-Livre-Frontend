import type { ReactNode } from 'react';

import { OrganizadorLayout } from '@/app/layouts';

export default function Layout({ children }: { children: ReactNode }) {
  return <OrganizadorLayout>{children}</OrganizadorLayout>;
}

import type { ReactNode } from 'react';

import { OrganizadorLayout } from '@/app/layouts';
import { OrganizerAccessGate } from '@/features/auth/components/organizer-access-gate';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <OrganizerAccessGate>
      <OrganizadorLayout>{children}</OrganizadorLayout>
    </OrganizerAccessGate>
  );
}

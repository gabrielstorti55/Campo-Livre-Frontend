import type { ReactNode } from 'react';

import { PrefeituraLayout } from '@/app/layouts';
import { MunicipalityAccessGate } from '@/features/auth/components/municipality-access-gate';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <MunicipalityAccessGate>
      <PrefeituraLayout>{children}</PrefeituraLayout>
    </MunicipalityAccessGate>
  );
}

import type { ReactNode } from 'react';

import { AtletaLayout } from '@/app/layouts';
import { AthleteAccessGate } from '@/features/auth/components/athlete-access-gate';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <AthleteAccessGate>
      <AtletaLayout>{children}</AtletaLayout>
    </AthleteAccessGate>
  );
}

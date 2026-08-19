import type { ReactNode } from 'react';

import { ExploreLayout } from '@/app/explore-layout';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return <ExploreLayout>{children}</ExploreLayout>;
}

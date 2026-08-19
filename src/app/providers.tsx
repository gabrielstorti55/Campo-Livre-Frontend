'use client';

import type { ReactNode } from 'react';

import { SessionProvider } from '@/features/auth/session/session-context';

export function Providers({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

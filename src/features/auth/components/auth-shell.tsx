import { Trophy } from 'lucide-react';
import type { ReactNode } from 'react';

import { Card } from '@/shared/components/campo-livre-ui';

/** Casca das telas de autenticação: logo + card centralizado. */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 py-10">
      <div className="mb-6 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-green-dark text-white">
          <Trophy className="h-5 w-5" />
        </span>
        <div>
          <p className="font-display text-lg font-bold text-green-dark">
            CampoLivre
          </p>
          <p className="text-xs text-muted-foreground">LigaPro</p>
        </div>
      </div>
      <Card className="w-full max-w-md p-2 shadow-sm">{children}</Card>
    </div>
  );
}

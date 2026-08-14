import type { ReactNode } from 'react';

import { Card } from '@/shared/components/campo-livre-ui';

export function StatusPage({
  title,
  description,
  code,
  actions,
}: {
  title: string;
  description: string;
  code?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
      <Card className="w-full max-w-md text-center">
        {code ? (
          <p className="font-display text-6xl font-bold text-green-dark">
            {code}
          </p>
        ) : null}
        <h1 className="mt-4 font-display text-xl font-bold text-foreground">
          {title}
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
        {actions ? (
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {actions}
          </div>
        ) : null}
      </Card>
    </main>
  );
}

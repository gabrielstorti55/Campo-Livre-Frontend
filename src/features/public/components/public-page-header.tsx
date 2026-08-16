import type { ReactNode } from 'react';

export function PublicPageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-8 overflow-hidden rounded-[28px] bg-green-dark text-white shadow-[0_16px_44px_rgba(20,63,45,0.14)] sm:mb-10">
      <div className="relative px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_34%)]" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.16em] text-white/75 uppercase">
              {eyebrow}
            </p>
            <h1 className="mt-2 max-w-3xl font-display text-3xl leading-tight font-semibold tracking-[-0.04em] text-balance sm:text-4xl lg:text-[2.75rem]">
              {title}
            </h1>
            {description ? (
              <p className="mt-3 max-w-2xl text-base leading-7 text-white/80">
                {description}
              </p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      </div>
    </header>
  );
}

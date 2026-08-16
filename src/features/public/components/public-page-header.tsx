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
    <header className="mb-8 overflow-hidden rounded-[28px] bg-green-dark text-white shadow-[0_20px_60px_rgba(20,63,45,0.16)] sm:mb-10">
      <div className="relative px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_34%)]" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.16em] text-white/62 uppercase">
              {eyebrow}
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-[-0.04em] text-balance sm:text-4xl lg:text-[2.75rem]">
              {title}
            </h1>
            {description ? (
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/68 sm:text-base">
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

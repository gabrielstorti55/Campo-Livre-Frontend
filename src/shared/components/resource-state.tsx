import { AlertCircle, Inbox } from 'lucide-react';

export function ResourceState({
  kind,
  title,
  description,
}: {
  kind: 'empty' | 'error';
  title: string;
  description: string;
}) {
  const Icon = kind === 'error' ? AlertCircle : Inbox;

  return (
    <div
      className="rounded-xl border border-dashed border-border bg-white px-6 py-10 text-center"
      role={kind === 'error' ? 'alert' : 'status'}
    >
      <Icon
        className="mx-auto h-8 w-8 text-muted-foreground"
        aria-hidden="true"
      />
      <h2 className="mt-3 font-display text-lg font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

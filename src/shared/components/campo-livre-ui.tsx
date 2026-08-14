import { Search } from 'lucide-react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import { Card as UICard, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Separator } from '@/shared/components/ui/separator';
import {
  Tabs as UITabs,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs';
import { cn } from '@/shared/lib/utils';

export function Initials({
  name,
  className,
  tone = 'green',
}: {
  name: string;
  className?: string;
  tone?: 'green' | 'navy' | 'light';
}) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  const tones = {
    green: 'bg-green-mid',
    navy: 'bg-navy-mid',
    light: 'bg-green-light',
  };
  return (
    <Avatar className={cn('shrink-0', className ?? 'h-10 w-10 text-sm')}>
      <AvatarFallback
        className={cn('font-display font-semibold text-white', tones[tone])}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <UICard
      className={cn('rounded-lg border-border bg-white shadow-none', className)}
    >
      <CardContent className="p-4">{children}</CardContent>
    </UICard>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = 'green',
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: 'green' | 'navy';
}) {
  return (
    <Card>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p
        className={cn(
          'mt-1 font-display text-2xl font-bold',
          tone === 'navy' ? 'text-navy-dark' : 'text-green-dark',
        )}
      >
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </Card>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="pb-4">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate font-display text-xl font-bold text-foreground sm:text-2xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        ) : null}
      </div>
      <Separator className="mt-4" />
    </header>
  );
}

export function PrimaryButton({
  className,
  tone = 'green',
  ...props
}: ComponentPropsWithoutRef<typeof Button> & {
  tone?: 'green' | 'navy' | 'danger';
}) {
  const tones = {
    green: 'bg-green-mid hover:bg-green-dark',
    navy: 'bg-navy-mid hover:bg-navy-dark',
    danger: 'bg-danger hover:bg-danger/90',
  };
  return (
    <Button
      {...props}
      className={cn(
        'h-auto rounded-md px-5 py-2.5 font-display text-sm font-semibold text-white',
        tones[tone],
        className,
      )}
    />
  );
}

export function OutlineButton({
  className,
  tone = 'green',
  ...props
}: ComponentPropsWithoutRef<typeof Button> & {
  tone?: 'green' | 'navy' | 'danger';
}) {
  const tones = {
    green:
      'border-green-mid text-green-mid hover:bg-green-pale hover:text-green-dark',
    navy: 'border-navy-mid text-navy-mid hover:bg-navy-mid/10 hover:text-navy-dark',
    danger: 'border-danger text-danger hover:bg-danger/10 hover:text-danger',
  };
  return (
    <Button
      variant="outline"
      {...props}
      className={cn(
        'h-auto rounded-md px-5 py-2.5 font-display text-sm font-semibold',
        tones[tone],
        className,
      )}
    />
  );
}

export function SearchBar({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-auto rounded-md border-border bg-white py-2.5 pr-4 pl-10 text-sm focus-visible:border-green-mid"
      />
    </div>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="block space-y-1.5">
      <Label className="font-display text-sm font-medium text-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

export const inputClass =
  'flex w-full rounded-md border border-input bg-white px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-green-mid focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50';

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: string[];
  active: string;
  onChange: (t: string) => void;
}) {
  return (
    <UITabs value={active} onValueChange={onChange}>
      <TabsList className="h-auto w-full justify-start gap-2 overflow-x-auto rounded-none border-b border-border bg-transparent p-0">
        {tabs.map((t) => (
          <TabsTrigger
            key={t}
            value={t}
            className="shrink-0 rounded-none border-b-2 border-transparent px-4 py-2.5 font-display text-sm font-semibold text-muted-foreground shadow-none data-[state=active]:border-green-mid data-[state=active]:bg-transparent data-[state=active]:text-green-dark data-[state=active]:shadow-none"
          >
            {t}
          </TabsTrigger>
        ))}
      </TabsList>
    </UITabs>
  );
}

export function FilterPills({
  options,
  value,
  onChange,
  variant = 'outline',
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  variant?: 'outline' | 'solid';
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filtros">
      {options.map((option) => (
        <Button
          key={option}
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange(option)}
          aria-pressed={value === option}
          className={cn(
            'h-auto rounded-full px-4 py-1.5 font-display text-xs font-semibold',
            value === option
              ? variant === 'solid'
                ? 'border-green-dark bg-green-dark text-white hover:bg-green-dark hover:text-white'
                : 'border-green-mid bg-green-pale text-green-dark hover:bg-green-pale hover:text-green-dark'
              : 'border-border bg-white text-muted-foreground hover:bg-muted',
          )}
        >
          {option}
        </Button>
      ))}
    </div>
  );
}

export function Section({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('space-y-3', className)}>
      <h2 className="font-display text-lg font-bold text-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-white p-10 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

export function StatGrid({
  items,
  tone = 'green',
  columns = 4,
  className,
}: {
  items: { label: string; value: ReactNode; hint?: string }[];
  tone?: 'green' | 'navy';
  columns?: 3 | 4;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'grid gap-4',
        columns === 3
          ? 'grid-cols-1 sm:grid-cols-3'
          : 'grid-cols-2 lg:grid-cols-4',
        className,
      )}
    >
      {items.map((item) => (
        <StatCard
          key={item.label}
          label={item.label}
          value={item.value}
          tone={tone}
          {...(item.hint ? { hint: item.hint } : {})}
        />
      ))}
    </div>
  );
}

export function GroupLabel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        'font-display text-xs font-bold tracking-wide text-muted-foreground uppercase',
        className,
      )}
    >
      {children}
    </p>
  );
}

export function FormCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <Card className={cn('max-w-2xl space-y-4', className)}>{children}</Card>
  );
}

export function Pill({
  children,
  shape = 'rounded',
  className,
}: {
  children: ReactNode;
  shape?: 'rounded' | 'full';
  className?: string;
}) {
  return (
    <span
      className={cn(
        'shrink-0 bg-green-pale px-3 py-1 font-display font-semibold text-green-dark',
        shape === 'full'
          ? 'rounded-full text-xs'
          : 'rounded-lg text-sm font-bold',
        className,
      )}
    >
      {children}
    </span>
  );
}
